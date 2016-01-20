# -*- coding: utf-8 -*-
from StringIO import StringIO

import requests
import json
import datetime
from collections import defaultdict
from itertools import chain
from splice.environment import Environment
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import insert, update
from sqlalchemy import create_engine
from splice.models import Adgroup, Account, CampaignCountry
from tld import get_tld
import os
import base64
import hashlib

ARBITRARY_FUTURE = datetime.datetime.strptime('2525-01-01', "%Y-%m-%d").date()

# coding=utf-8
_titles = {
    "CLIQZ": ("CLIQZ", "CLIQZ"),
    "FedEx": ("FedEx", "FedEx"),
    "YouTube": ("YouTube", "YouTube"),
    "PagesJaunes": ("PagesJaunes", "PagesJaunes"),
    "CVS Health": ("CVS Health", "CVS Health"),
    "BBC": ("BBC", "BBC"),
    "Facebook": ("Facebook", "Facebook"),
    "Outbrain Sphere": ("Outbrain Sphere", "Outbrain Sphere"),
    "Wikipedia": ("Wikipedia", "Wikipedia"),
    "Trulia": ("Trulia", "Trulia"),
    "Amazon": ("Amazon", "Amazon"),
    "CITIZENFOUR": ("CITIZENFOUR", "CITIZENFOUR"),
    "Booking.com": ("Booking.com", "Booking.com"),
    "Casper": ("Casper", "Casper"),
    "NFL": ("NFL", "NFL"),
    "Dashlane": ("Dashlane", "Dashlane"),
    "Yahoo": ("Yahoo", "Yahoo"),
    "cars.com": ("Cars.com", "Cars.com"),
    "Cars.com": ("Cars.com", "Cars.com"),
    "Squarespace": ("Squarespace", "Squarespace"),
    "Quartz": ("Quartz", "Quartz"),
    "Get Disconnect": ("Get Disconnect", "Get Disconnect"),
    "Descarga Disconnect": ("Get Disconnect", "Descarga Disconnect"),
    "TurboTax": ("TurboTax", "TurboTax"),
    "ImpôtRapide": ("TurboTax", "ImpôtRapide"),
    "Wired": ("Condé Nast", "Wired"),
    "WIRED": ("Condé Nast", "Wired"),
    "The Scene": ("Condé Nast", "The Scene"),
    "Glamour": ("Condé Nast", "Glamour"),
    "Ars Technica": ("Condé Nast", "Ars Technica"),
    "Details": ("Condé Nast", "Details"),
    "GQ": ("Condé Nast", "GQ"),
    "Allure": ("Condé Nast", "Allure"),
    "EFF": ("EFF", "EFF"),
    "Electronic Frontier Foundation": ("EFF", "EFF"),
    "Fortune": ("Time Inc", "Fortune"),
    "Mozilla Gear": ("Mozilla", "Mozilla Gear"),
    "Firefox Help and Support": ("Mozilla", "Firefox Help and Support"),
    "Firefox Sync": ("Mozilla", "Firefox Sync"),
    "Firefox Hello": ("Mozilla", "Firefox Hello"),
    "Lightbeam": ("Mozilla", "Lightbeam"),
    "Mozilla Advocacy": ("Mozilla", "Mozilla Advocacy"),
    "Protect Net Neutrality": ("Mozilla", "Protect Net Neutrality"),
    "Support Mozilla": ("Mozilla", "Support Mozilla"),
    "The Mozilla Project": ("Mozilla", "The Mozilla Project"),
    "Stop Surveillance": ("Mozilla", "Stop Surveillance"),
    "Get smart on mass surveillance": ("Mozilla", "Get smart on mass surveillance"),
}

_target_url_in = [
    ("https://addons.mozilla.org/firefox/?utm_source=directory-tiles&utm_medium=tiles&utm_content=Generaladdons", ("Mozilla", "Firefox Add-ons")),
    ("http://www.webmaker.org?ref=Webmaker_Launch&utm_campaign=Webmaker_Launch?utm_source=directory-tiles&utm_medium=tiles&utm_term=V1utm_campaign=Webmaker_Launch", ("Mozilla", "Webmaker Mobile App")),
    ("https://support.mozilla.org/kb/make-firefox-your-default-browser?utm_source=directory-tiles&utm_medium=tiles&utm_content=DefaultV1&utm_campaign=Win10", ("Mozilla", "Make Firefox Your Default Browser")),
    ("https://www.mozilla.org/privacy/tips/?utm_source=directory-tiles&utm_medium=tiles&utm_content=PrivacyV1&utm_campaign=desktop", ("Mozilla", "Privacy Tips")),
    ("http://mzl.la/1U7wxPL", ("Mozilla", "Follow us on Twitter")),
    ("http://mzl.la/1ILjvWb", ("Mozilla", "Follow us on Twitter")),
    ("http://mzl.la/1KAsk2A", ("Mozilla", "Follow us on Twitter")),
    ("https://www.mozilla.org/firefox/pocket/?utm_source=directory-tiles&utm_medium=tiles&utm_term=v1&utm_campaign=desktop", ("Mozilla", "Pocket for Firefox")),
    ("https://www.mozilla.org/newsletter?utm_source=directory-tiles&utm_medium=tiles&utm_term=v1&utm_campaign=desktop", ("Mozilla", "Newsletter_Directory")),
    ("http://mzl.la/1Vg8Hmk", ("Mozilla", "Follow us on social")),
    ("http://mzl.la/1Mdhxxu", ("Mozilla", "Follow us on social")),
    ("http://mzl.la/1RGAtsX", ("Mozilla", "Follow us on social")),
    ("http://mzl.la/1KdVzbh", ("Mozilla", "Follow us on social")),
    ("http://mzl.la/1HC2Bps", ("Mozilla", "Follow us on social")),
    ("https://foxyeah.mozilla.org/?utm_source=directory-tiles&utm_medium=tiles&utm_campaign=sc-2015-foxyeah&utm_content=send-invite", ("Mozilla", "Foxyeah")),
    ("http://mzl.la/1HqQv3A", ("Mozilla", "Foxyeah #2")),
    ("fastestfirefox.com", ("Mozilla", "Customize Firefox")),
    ("https://addons.mozilla.org/en-US/android/", ("Mozilla", "Customize Firefox")),
    ("https://play.google.com/store/apps/details?id=org.mozilla.firefox&referrer=utm_source%3Dmozilla%26utm_medium%3Dbanner%26utm_campaign%3Ddesktop01", ("Mozilla", "Firefox for Android DT v1")),
    ("https://www.mozilla.com/firefox/independent/?utm_source=directory-tiles&utm_medium=directory-tiles&utm_campaign=FX10", ("Mozilla", "Firefox 10th Anniversary")),
    ("http://android.www.mozilla.com/firefox/android/?utm_source=directory-tiles&utm_medium=tiles&utm_campaign=sc-2015-fennec&utm_content=phone-in-hand", ("Mozilla", "Firefox for Android DT v2")),
    ("https://www.mozilla.org/firefox/android/?utm_source=suggested-tiles&utm_medium=tiles&utm_content=androidenthusiasts&utm_campaign=firefoxforandroid", ("Mozilla", "Firefox for Android ST")),
    ("https://www.mozilla.org/firefox/android/?utm_source=suggested-tiles&utm_medium=tiles&utm_content=mobileproviders&utm_campaign=firefoxforandroid", ("Mozilla", "Firefox for Android ST")),
    ("https://www.mozilla.org/firefox/android/?utm_source=suggested-tiles&utm_medium=tiles&utm_content=mozillafans&utm_campaign=firefoxforandroid", ("Mozilla", "Firefox for Android ST")),
    ("marketplace.firefox.com", ("Mozilla", "Firefox Marketplace")),
    ("https://www.mozilla.com/privacy/tips?utm_source=firefox&utm_medium=directorytile&utm_campaign=DPD15", ("Mozilla", "Get Smart on Privacy")),
    ("https://www.mozilla.org/firefox/private-browsing/?utm_source=directory-tiles&utm_medium=tiles&utm_content=TPV1&utm_campaign=fx-fall-15", ("Mozilla", "Tracking Protection")),
    ("https://www.mozilla.com/en-US/?utm_source=directory-tiles&utm_medium=firefox-browser", ("Mozilla", "Mozilla")),
    ("https://www.mozilla.org/en-US/?utm_source=directory-tiles&utm_medium=firefox-browser", ("Mozilla", "Mozilla")),
    ("http://contribute.mozilla.org/", ("Mozilla", "Mozilla Community")),
    ("http://mozilla.de/gemeinschaft/index.html", ("Mozilla", "Mozilla Community")),
    ("https://developer.mozilla.org/Learn?utm_campaign=default&utm_source=mozilla&utm_medium=firefox-suggested-tile&utm_content=MozCat_WebLearner", ("Mozilla", "MDN Suggested")),
    ("https://developer.mozilla.org/?utm_campaign=default&utm_source=mozilla&utm_medium=firefox-suggested-tile&utm_content=MozCat_Mozilla_Sites", ("Mozilla", "MDN Suggested")),
    ("https://developer.mozilla.org/?utm_campaign=default&utm_source=mozilla&utm_medium=firefox-suggested-tile&utm_content=MozCat_WebDev", ("Mozilla", "MDN Suggested")),
    ("https://developer.mozilla.org/en-GB/?utm_source=mozilla&utm_medium=firefox-tile&utm_campaign=default", ("Mozilla", "MDN Directory")),
    ("https://developer.mozilla.org/en-US/?utm_source=mozilla&utm_medium=firefox-tile&utm_campaign=default", ("Mozilla", "MDN Directory")),
    ("https://developer.mozilla.org/es/?utm_source=mozilla&utm_medium=firefox-tile&utm_campaign=default", ("Mozilla", "MDN Directory")),
    ("https://developer.mozilla.org/pt-BR/?utm_source=mozilla&utm_medium=firefox-tile&utm_campaign=default", ("Mozilla", "MDN Directory")),
    ("https://developer.mozilla.org/ru/?utm_source=mozilla&utm_medium=firefox-tile&utm_campaign=default", ("Mozilla", "MDN Directory")),
    ("https://developer.mozilla.org/de/?utm_source=mozilla&utm_medium=firefox-tile&utm_campaign=default", ("Mozilla", "MDN Directory")),
    ("https://developer.mozilla.org/ja/?utm_source=mozilla&utm_medium=firefox-tile&utm_campaign=default", ("Mozilla", "MDN Directory")),
    ("https://developer.mozilla.org/pl/?utm_source=mozilla&utm_medium=firefox-tile&utm_campaign=default", ("Mozilla", "MDN Directory")),
    ("https://developer.mozilla.org/fr/?utm_source=mozilla&utm_medium=firefox-tile&utm_campaign=default", ("Mozilla", "MDN Directory")),
    ("http://2014.mozillafestival.org/", ("Mozilla", "Mozilla Festival")),
    ("mozilla.org/about/manifesto", ("Mozilla", "Mozilla Manifesto")),
    ("https://www.mozilla.org/en-US/about/manifesto/", ("Mozilla", "Mozilla Manifesto")),
    ("http://europe.mozilla.org/privacy/you", ("Mozilla", "Privacy Principles")),
    ("https://openstandard.mozilla.org/", ("Mozilla", "The Open Standard")),
    ("https://webmaker.org/", ("Mozilla", "Webmaker")),
    ("https://www.mozilla.com/firefox/tiles", ("Mozilla", "A brand new tiles experience")),
    ("https://www.mozilla.org/firefox/private-browsing/?utm_source=directory-tiles&utm_medium=tiles&utm_content=TPV1&utm_campaign=fx-fall-15", ("Mozilla", "Private Browsing With Tracking Protection")),
    ("https://www.mozilla.org/teach/smarton/tracking/?utm_source=directory-tiles&utm_medium=tiles&utm_content=SOTV1&utm_campaign=smarton", ("Mozilla", "Get Smart on Tracking")),
    ("https://donate.mozilla.org/?&amount=10&ref=EOYFR2015&utm_campaign=EOYFR2015&utm_source=directory-tiles&utm_medium=tiles&utm_content=dapper_v1", ("Mozilla", "Donate to Mozilla")),
    ("https://app.adjust.com/2uo1qc?campaign=tiles&adgroup=directory&creative=general&fallback=https%3A%2F%2Fitunes.apple.com%2Fapp%2Fapple-store%2Fid989804926%3Fpt%3D373246%26ct%3Dadjust_tracker%26mt%3D8I", ("Mozilla", "Firefox for iOS")),
    ("http://mzl.la/1Dls1DC", ("Mozilla", "Firefox for Android"))
]

_target_urls = {
    "https://developer.mozilla.org/en-US/":
        ("Mozilla", "MDN Directory"),
    "https://developer.mozilla.org/":
        ("Mozilla", "MDN Directory"),
    "https://developer.mozilla.org":
        ("Mozilla", "MDN Directory"),
    "https://barkbox.com/?utm_source=mozilla&utm_medium=sponsorships&utm_campaign=mozilla_tile_image1&utm_content=102790":
        ("BarkBox", "BarkBox Directory"),
    "https://barkbox.com/?utm_source=mozilla&utm_medium=sponsorships&utm_campaign=mozilla_st_animals_general&utm_content=102944":
        ("BarkBox", "BarkBox Suggested"),
    "https://barkbox.com/?utm_source=mozilla&utm_medium=sponsorships&utm_campaign=mozilla_st_health_fitness&utm_content=102945":
        ("BarkBox", "BarkBox Suggested"),
    "https://barkbox.com/?utm_source=mozilla&utm_medium=sponsorships&utm_campaign=mozilla_st_health_general&utm_content=102946":
        ("BarkBox", "BarkBox Suggested"),
    "https://barkbox.com/?utm_source=mozilla&utm_medium=sponsorships&utm_campaign=mozilla_st_entertainment_humor&utm_content=102947":
        ("BarkBox", "BarkBox Suggested"),
    "https://barkbox.com/?utm_source=mozilla&utm_medium=sponsorships&utm_campaign=mozilla_st_entertainment_general&utm_content=102948":
        ("BarkBox", "BarkBox Suggested"),
    "https://barkshop.com/gifts?utm_source=mozilla&utm_medium=sponsorships&utm_campaign=mozilla_st_retail_gift&utm_content=503545":
        ("BarkBox", "BarkBox Suggested"),
    "https://jet.com/?jcmp=afl:moz:dt_jet:na:na:na:20off:dt:CyberWkPh:1":
        ("Jet.com", "Jet.com Directory"),
    "https://jet.com/landing/holidayshop?jcmp=afl:moz:dt_jet:na:na:na:holiday15off:dt:na:1":
        ("Jet.com", "Jet.com Directory"),
    "https://jet.com/?jcmp=afl:moz:dt_jet:na:na:na:20off:st_rg:CyberWkPh:1":
        ("Jet.com", "Jet.com Suggested"),
    "https://jet.com/?jcmp=afl:moz:dt_jet:na:na:na:na:st_rc:na:1":
        ("Jet.com", "Jet.com Suggested"),
    "https://jet.com/?jcmp=afl:moz:dt_jet:na:na:na:20off:st_rc:na:1":
        ("Jet.com", "Jet.com Suggested"),
    "https://jet.com/?jcmp=afl:moz:dt_jet:na:na:na:na:st_rg:na:1":
        ("Jet.com", "Jet.com Suggested"),
    "https://jet.com/?jcmp=afl:moz:dt_jet:na:na:na:20off:st_rg:na:1":
        ("Jet.com", "Jet.com Suggested"),
    "http://www.toms.com/?cid=mozilla_directory&utm_medium=directory&utm_source=mozilla":
        ("TOMS", "TOMS Directory"),
    "http://www.toms.com/improving-lives?cid=mozilla_suggested&utm_medium=suggested&utm_source=mozilla&utm_campaign=fashion_women":
        ("TOMS", "TOMS Suggested"),
    "http://www.toms.com/improving-lives?cid=mozilla_suggested&utm_medium=suggested&utm_source=mozilla&utm_campaign=fashion_men":
        ("TOMS", "TOMS Suggested"),
    "http://www.toms.com/?cid=mozilla_suggested&utm_medium=suggested&utm_source=mozilla&utm_campaign=lifestyle_men":
        ("TOMS", "TOMS Suggested"),
    "http://www.toms.com/?cid=mozilla_suggested&utm_medium=suggested&utm_source=mozilla&utm_campaign=lifestyle_women":
        ("TOMS", "TOMS Suggested")
}

_ids = {
    629: ("Mozilla", "Fennec Tiles"),
    630: ("Mozilla", "Fennec Tiles"),
    631: ("Mozilla", "Fennec Tiles"),
    632: ("Mozilla", "Fennec Tiles"),
}

_campaign_countries = {
    "BarkBox": ["US"],
    "Condé Nast": ["US"],
    "Jet.com": ["US"],
    "TOMS": ["US"],
    "Quartz": ["US"],
    "EFF": ["US"],
    "Yahoo": ["US"],
    "Squarespace": ["US"],
    "CLIQZ": ["DE"],
    "Times Inc": ["US"],
    "Cars.com": ["US"],
    "Casper.com": ["US"],
    "NFL": ["US"],
}

insane_identity_counter = 0


def derive_account_campaign(tid, title, url):

    if title in _titles:
        return _titles[title]

    if url in _target_urls:
        return _target_urls[url]

    if tid in _ids:
        return _ids[tid]

    for pattern, rval in _target_url_in:
        if pattern in url:
            return rval

    tld = get_tld(url)

    global insane_identity_counter
    insane_identity_counter += 1
    return tld, "%s/%s" % (tld, insane_identity_counter)


def safe_str(obj):
    """return the byte string representation of obj"""
    try:
        return str(obj)
    except UnicodeEncodeError:
        # obj is unicode
        return unicode(obj).encode('unicode_escape')


def _update_image(bucket, image_url, tile_id, column='image_uri'):
    env = Environment.instance()
    if image_url and not image_url.startswith('http'):
        imgs = list(bucket.list(prefix="images/%s" % image_url))
        if len(imgs):
            uri = os.path.join('https://%s.s3.amazonaws.com' % env.config.S3['bucket'], imgs[0])
            print "updating %s for tile=%s" % (column, tile_id)
            return "update tiles set %s = '%s' where id = %s" % (column, uri, tile_id)
    return None


def main():
    """
    Usage:
    manage.py db upgrade
    python index_walker.py

    This script is going to populate Account and Campaign database structures.  It does this
    by reading the currently deployed tile distributions (s3), where it determines the currently active
    tile set, as well as the geo-targetting data (currently only country level) for each tile/adgroup.

    The script will discriminate between 'active' and 'inactive' adgroups based on whether or not
    the adgroup exists in the current distribution.  Inactive adgroups are given start/end dates
    in campaigns that are in the *past*.  Active adgroups are placed in campaigns that start on their
    adgroup creation date and end at some far distant future date.

    We are using some data structures developed by the Zenko project to build the derive_account_campaign()
    function in order to identify existing campaigns from our tile data.

    Campaign objects are considered unique by grouping together the following keys in the adgroup:
    * the name of the campaign and account returned by derive_account_campaign()
    * the channel of the adgroup
    * the 'active' flag (determined as explained above) of the adgroup

    One campaign row will be assigned for each unique campaign detected.

    The script will populate the adgroup.campaign_id with the campaign that the adgroup fits into.

    All writes to the database are transactional.

    This script is *not* idempotent, and will therefore check that accounts and campaigns tables are empty
    before running.

    :return:
    """
    r = requests.get('https://tiles-resources-prod-tiless3-qbv71djahz3b.s3.amazonaws.com/desktop_tile_index_v3.json')
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
        # stmt = select([Adgroup.id, Tile.target_url, Adgroup.channel_id, Adgroup.created_at]). \
        #     where(Tile.adgroup_id == Adgroup.id)
        stmt = """SELECT a.id, t.target_url, t.title, a.channel_id, a.created_at, c.name,
                    t.id, t.image_uri, t.enhanced_image_uri
                  FROM adgroups a
                  JOIN tiles t on t.adgroup_id = a.id
                  JOIN channels c on a.channel_id = c.id"""
        result = connection.execute(stmt)

        campaign_id = 0
        account_id = 0
        campaigns = dict()
        adgroups = defaultdict(list)
        countries = defaultdict(set)
        accounts = dict()

        for adgroup_id, url, title, channel, created_at, channel_name, tile_id, i_url, ei_url in result:
            assert all(x is not None for x in (adgroup_id, url, channel)), \
                "Some of %s is None" % str((adgroup_id, url, channel))

            # do tld -> account mapping substitution
            active = adgroup_id in active_tiles
            account_name, campaign_name = derive_account_campaign(adgroup_id, title, url)
            curr = (account_name, campaign_name, channel, active)
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
                if account_name not in accounts:
                    account_id += 1
                    next_account_id = account_id
                    accounts[account_name] = account_id
                else:
                    next_account_id = accounts[account_name]

                active_name = '' if active else ' (Closed)'
                ctuple = (campaign_id, start_date, end_date,
                          "%s %s%s" % (safe_str(campaign_name), channel_name, active_name),
                          False, channel, next_account_id)
                campaigns[curr] = ctuple

                # append all the countries
                for sub_country_code, sub_locale in tile_geodes[adgroup_id]:
                    countries[campaign_id].add(sub_country_code)
                # this fixes the closed campaigns can't get the correct country code as above
                if account_name in _campaign_countries:
                    countries[campaign_id] = countries[campaign_id].union(_campaign_countries[account_name])
                # print "campaign", ctuple

            adgroups[campaigns[curr][0]].append(adgroup_id)

        # insert data into new tables
        Session = sessionmaker(bind=engine)
        session = Session()

        # we need to monkeypatch flask's monkeypatch...
        session._model_changes = None

        try:
            # grab all s3 images and reproduce image hash
            bucket = env.s3.get_bucket(env.config.S3["bucket"])
            images = bucket.list('images/')

            image_hashes = defaultdict(list)
            enhanced_image_hashes = defaultdict(list)
            stmt = "SELECT t.id, t.image_uri, t.enhanced_image_uri FROM tiles t"
            for tile_id, image_uri, enhanced_image_uri in connection.execute(stmt):
                image_hashes[image_uri].append(tile_id)
                enhanced_image_hashes[enhanced_image_uri].append(tile_id)

            for image in images:
                ext = image.key.split('.')[-1]
                if ext == 'svg':
                    ext = 'svg+xml'
                elif ext  == 'jpeg':
                    ext = 'jpg'
                new_hash = hashlib.sha1("data:image/%s;base64,%s" %
                                        (ext, base64.b64encode(image.get_contents_as_string()))).hexdigest()
                new_uri = image.generate_url(expires_in=0, query_auth=False)

                tile_ids = image_hashes.get(new_hash)
                if tile_ids:
                    print "image: %s" % image.key
                    session.execute("update tiles set image_uri = '%s' where id in (%s)" %
                                    (new_uri, ','.join(str(tid) for tid in tile_ids)))

                tile_ids = enhanced_image_hashes.get(new_hash)
                if tile_ids:
                    print "enhanced_image: %s" % image.key
                    session.execute("update tiles set enhanced_image_uri = '%s' where id in (%s)" %
                                    (new_uri, ','.join(str(tid) for tid in tile_ids)))

            account_stmt = insert(Account).values([dict(id=aid, name=aname) for aname, aid in accounts.iteritems()])
            session.execute(account_stmt)
            session.execute("SELECT setval('accounts_id_seq', %s, false)" % (account_id + 1))

            target_query = StringIO()
            target_query.write("""insert into campaigns(id, start_date, end_date, name, paused, channel_id, account_id) values """)
            pg2_cursor = session.connection().connection.cursor()
            for campaign_tuple in campaigns.values():
                # print "%s %s" % (type(campaign_tuple), campaign_tuple)
                target_query.write(unicode(pg2_cursor.mogrify("(%s,%s,%s,%s,%s,%s,%s),", campaign_tuple)))
            session.execute(target_query.getvalue()[:-1])
            session.execute("SELECT setval('campaigns_id_seq', %s, false)" % (campaign_id + 1))

            cc_stmt = insert(CampaignCountry).values([dict(country_code=cc, campaign_id=cid)
                                                      for cid, cc_list in countries.iteritems()
                                                      for cc in cc_list])
            session.execute(cc_stmt)

            adgroup_updates = [update(Adgroup)
                               .where(Adgroup.id.in_(tuple(adgroup_ids)))
                               .values(dict(campaign_id=cid, type="directory", name="adgoup_cpmg_%d" % cid))
                               for cid, adgroup_ids in adgroups.iteritems()]
            for adgroup_stmt in adgroup_updates:
                session.execute(adgroup_stmt)
            # set the type for the suggested adgroups
            session.execute("update adgroups set type = 'suggested' where id in (select distinct adgroup_id from adgroup_sites)")

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
