import os
import sys
import csv
from splice.environment import Environment


def get_fixture_path(name):
    path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(path, 'fixtures/{0}'.format(name))


def parse_csv(file, fieldnames=None):
    with open(get_fixture_path(file), "rb") as f:
        tsv_reader = csv.DictReader(f, fieldnames=fieldnames)
        for item in tsv_reader:
            yield item


def get_country_code():
    for code, name in Environment.instance()._load_countries():
        yield dict(country_name=name, country_code=code)


def insert(env, drop=False):
    # import models here to delay the db instantiation
    from splice.models import (Account, Country, Campaign, CampaignCountry,
                               Channel, Adgroup, AdgroupCategory, Tile)
    with env.application.app_context():
        session = env.db.session
        if drop:
            env.db.drop_all()
            env.db.create_all()

        for record in parse_csv("accounts.csv"):
            account = Account(**record)
            session.add(account)

        for record in parse_csv("channels.csv"):
            channel = Channel(**record)
            session.add(channel)

        for record in get_country_code():
            country = Country(**record)
            session.add(country)

        for record in parse_csv("campaigns.csv"):
            campaign = Campaign(**record)
            session.add(campaign)

        for record in parse_csv("campaign_countries.csv"):
            campaign_country = CampaignCountry(**record)
            session.add(campaign_country)

        for record in parse_csv("adgroups.csv"):
            adgroup = Adgroup(**record)
            session.add(adgroup)

        # it needs to flush here to get the adgroup ids
        session.flush()

        for record in parse_csv("adgroup_categories.csv"):
            adgroup_category = AdgroupCategory(**record)
            session.add(adgroup_category)

        for record in parse_csv("tiles.csv"):
            tile = Tile(**record)
            session.add(tile)

        session.commit()
    return True


if __name__ == '__main__':
    db_name = "splice_test"
    if len(sys.argv) > 1:
        db_name = sys.argv[1]
    db_uri = os.environ.get('TEST_DB_URI') or 'postgres://localhost/%s' % db_name
    env = Environment.instance(test=True, test_db_uri=db_uri)

    insert(env, True)
