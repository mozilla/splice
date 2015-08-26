#!/usr/bin/env python

import requests
import json
import datetime
from collections import defaultdict
from itertools import chain
from splice.environment import Environment
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import select, insert, update
from sqlalchemy import create_engine
from splice.models import Tile, Adgroup, Country, Account, Campaign, CampaignCountry
from tld import get_tld

ARBITRARY_FUTURE = datetime.datetime.strptime('2525-01-01', "%Y-%m-%d").date()


def main():
    """
    This script is going to populate Account and Campaign database structures.  It does this
    by reading the currently deployed tile distributions (s3), where it determines the currently active
    tile set, as well as the geo-targetting data (currently only country level) for each tile/adgroup.

    The script also popultates/migrates data from the 'countries' table in the stats database.

    The script will discriminate between 'active' and 'inactive' adgroups based on whether or not
    the adgroup exists in the current distribution.  Inactive adgroups are given start/end dates
    in campaigns that are in the *past*.  Active adgroups are placed in campaigns that start on their
    adgroup creation date and end at some far distant future date.

    Campaign objects are considered unique by grouping together the following keys in the adgroup:
    * the TLD+1 of the target_url
    * the locale of the adgroup
    * the channel of the adgroup
    * the 'active' flag (determined as explained above) of the adgroup

    One campaign row will be assigned for each unique campaign detected.

    The script will populate the adgroup.campaign_id with the campaign that the adgroup fits into.

    Account objects are considered unique by considering the TLD+1 of the campaign.  All campaigns that
    share the same TLD+1 will be grouped into the same Account.

    All writes to the database are transactional.

    This script is *not* idempotent, and will therefore check that accounts and campaigns tables are empty
    before running.

    :return:
    """
    r = requests.get('https://tiles.cdn.mozilla.net/desktop-prerelease_tile_index_v3.json')
    active_tiles = set()
    tile_geodes = defaultdict(set)

    if 200 <= r.status_code <= 299:
        data = json.loads(r.text)

        for geo_locale, dist_dict in data.iteritems():
            try:
                ag = dist_dict.get('ag')
                if ag:
                    geode = tuple(geo_locale.split('/'))
                    print "processing ", geo_locale
                    ag_r = requests.get(ag)
                    if 200 <= ag_r.status_code <= 299:
                        tiles = json.loads(ag_r.text)
                        directory_tiles = tiles['directory']
                        suggested_tiles = tiles['suggested']
                        newts = set(chain((t['directoryId'] for t in directory_tiles),
                                          (t['directoryId'] for t in suggested_tiles)))
                        active_tiles.update(newts)
                        for tile_id in newts:
                            tile_geodes[tile_id].add(geode)
            except:
                print "skipping ", geo_locale

    # print "active", str(active_tiles)

    env = Environment.instance()

    # get the country data out of the fixtures
    country_codes = [dict(country_name=cname, country_code=cc) for cc, cname in env._load_countries()]

    db_uri = env.config.SQLALCHEMY_DATABASE_URI
    engine = create_engine(db_uri)
    connection = engine.connect()

    try:
        # assert that campaigns and accounts are empty
        account_count, = connection.execute("SELECT count(*) FROM accounts").fetchone()
        assert account_count == 0, "Accounts not empty"
        campaign_count, = connection.execute("SELECT count(*) FROM campaigns").fetchone()
        assert campaign_count == 0, "Campaigns not empty"

        # collate/generate campaign and account data
        stmt = select([Adgroup.id, Tile.target_url, Adgroup.locale, Adgroup.channel_id, Adgroup.created_at]). \
            where(Tile.adgroup_id == Adgroup.id)
        result = connection.execute(stmt)

        campaign_id = 0
        account_id = 0
        campaigns = dict()
        adgroups = defaultdict(list)
        countries = defaultdict(set)
        accounts = dict()

        for adgroup_id, url, locale, channel, created_at in result:
            assert all(x is not None for x in (adgroup_id, url, locale, channel)), \
                "Some of %s is None" % str((adgroup_id, url, locale, channel))
            tld = get_tld(url)
            active = adgroup_id in active_tiles
            curr = (tld, locale, channel, active)
            if curr not in campaigns:
                # this is a new campaign, see if it's active
                campaign_id += 1
                if active:
                    # print "active", curr
                    start_date = created_at.date()
                    end_date = ARBITRARY_FUTURE
                else:
                    start_date = created_at.date()
                    end_date = created_at.date()

                # insert it into the right account
                if tld not in accounts:
                    account_id += 1
                    next_account_id = account_id
                    accounts[tld] = account_id
                else:
                    next_account_id = accounts[tld]

                ctuple = (campaign_id, locale, start_date, end_date, '/'.join((tld, locale, str(channel))),
                          False, channel, next_account_id)
                campaigns[curr] = ctuple

                # append all the countries, be smart about 'STAR'
                for sub_country_code, sub_locale in tile_geodes[adgroup_id]:
                    if sub_country_code == 'STAR':
                        countries[campaign_id] = {'STAR'}
                    elif 'STAR' not in countries[campaign_id]:
                        countries[campaign_id].add(sub_country_code)
                # print "campaign", ctuple

            adgroups[campaign_id].append(adgroup_id)

        # insert data into new tables
        Session = sessionmaker(bind=engine)
        session = Session()

        # we need to monkeypatch flask's monkeypatch...
        session._model_changes = None

        try:
            country_stmt = insert(Country).values(country_codes)
            session.execute(country_stmt)

            account_stmt = insert(Account).values([dict(id=aid, name=aname) for aname, aid in accounts.iteritems()])
            session.execute(account_stmt)
            session.execute("SELECT setval('accounts_id_seq', %s, false)" % (account_id + 1))

            campaign_cols = ('id', 'locale', 'start_date', 'end_date', 'name', 'paused', 'channel_id',
                             'account_id', 'created_at', 'channel_id', 'account_id')
            campaign_stmt = insert(Campaign).values([dict(zip(campaign_cols, cval)) for cval in campaigns.values()])
            session.execute(campaign_stmt)
            session.execute("SELECT setval('campaigns_id_seq', %s, false)" % (campaign_id + 1))

            cc_stmt = insert(CampaignCountry).values([dict(country_code=cc, campaign_id=cid)
                                                      for cid, cc_list in countries.iteritems()
                                                      for cc in cc_list])
            session.execute(cc_stmt)

            adgroup_updates = [update(Adgroup)
                               .where(Adgroup.id.in_(tuple(adgroup_ids)))
                               .values(dict(campaign_id=cid))
                               for cid, adgroup_ids in adgroups.iteritems()]
            for adgroup_stmt in adgroup_updates:
                session.execute(adgroup_stmt)

            session.commit()
        except Exception as e:
            print "Error: ", str(e)
            session.rollback()
            raise e
    finally:
        connection.close()
        print "done"


if __name__ == '__main__':
    main()
