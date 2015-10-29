from sqlalchemy.orm.exc import NoResultFound

from splice.models import Campaign, CampaignCountry
from splice.queries.common import row_to_dict
from datetime import datetime


def get_campaigns(account_id=None, past=True, in_flight=True, scheduled=True, utctoday=None):
    from splice.environment import Environment

    env = Environment.instance()

    query = env.db.session.query(Campaign)

    if account_id is not None:
        query = query.filter(Campaign.account_id == account_id)

    if utctoday is None:
        utctoday = datetime.utcnow().date()

    rows = query.order_by(Campaign.id.desc()).all()

    campaigns = []
    for row in rows:
        ret = row_to_dict(row)
        countries = []
        for country in row.countries:
            countries.append(country.country_code)
        ret['countries'] = countries

        # filter based on start and end dates unless an account ID is specified
        if ((past and row.end_date.date() <= utctoday) or
                (in_flight and row.end_date.date() >= utctoday >= row.start_date.date()) or
                (scheduled and row.start_date.date() >= utctoday)):
            campaigns.append(ret)

    return campaigns


def get_campaign(campaign_id):
    from splice.environment import Environment

    env = Environment.instance()

    row = (
        env.db.session
        .query(Campaign).get(campaign_id)
    )
    if row:
        ret = row_to_dict(row)
        countries = []
        for country in row.countries:
            countries.append(country.country_code)
        ret['countries'] = countries
        return ret
    else:
        return None


def insert_campaign(session, record):
    record = record.copy()
    countries = record.pop('countries')
    countries_objs = [CampaignCountry(country_code=country) for country in countries]
    campaign = Campaign(countries=countries_objs, **record)
    session.add(campaign)
    session.flush()
    new = row_to_dict(campaign)
    new["countries"] = countries

    return new


def update_campaign(session, campaign_id, record):
    campaign = session.query(Campaign).get(campaign_id)
    if campaign is None:
        raise NoResultFound('Campaign not found')

    record = record.copy()
    countries = record.pop("countries", [])
    for key, val in record.items():
        setattr(campaign, key, val)

    session.flush()
    new = row_to_dict(campaign)

    if countries:
        for country in campaign.countries:
            session.delete(country)
        for country in countries:
            campaign.countries.append(CampaignCountry(country_code=country))

        new['countries'] = countries

    return new
