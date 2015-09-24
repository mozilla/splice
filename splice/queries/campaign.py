from sqlalchemy.orm.exc import NoResultFound

from splice.models import Campaign, CampaignCountry
from splice.queries.common import row_to_dict


def get_campaigns(account_id=None):
    from splice.environment import Environment

    env = Environment.instance()

    query = (
        env.db.session
        .query(Campaign, CampaignCountry.country_code)
        .join(CampaignCountry, Campaign.id==CampaignCountry.campaign_id)
    )

    if account_id is not None:
        query = query.filter(Campaign.account_id == account_id)

    rows = query.order_by(Campaign.id.desc()).all()

    campaigns = []
    for row in rows:
        ret = row_to_dict(row.Campaign)
        ret['country'] = row.country_code
        campaigns.append(ret)

    return campaigns


def get_campaign(campaign_id):
    from splice.environment import Environment

    env = Environment.instance()

    row = (
        env.db.session
        .query(Campaign, CampaignCountry.country_code)
        .join(CampaignCountry, Campaign.id==CampaignCountry.campaign_id)
        .filter(Campaign.id == campaign_id)
    ).one()
    if row:
        ret = row_to_dict(row.Campaign)
        ret['country'] = row.country_code
        return ret
    else:
        return None

def insert_campaign(session, record):
    record = record.copy()
    country = record.pop('country')
    campaign = Campaign(**record)
    session.add(campaign)
    session.flush()
    new = row_to_dict(campaign)
    campaign_country = CampaignCountry(campaign_id=campaign.id, country_code=country)
    session.add(campaign_country)
    session.flush()
    new["country"] = country

    return new


def update_campaign(session, campaign_id, record):
    campaign = session.query(Campaign).get(campaign_id)
    if campaign is None:
        raise NoResultFound('Campaign not found')

    for key, val in record.items():
        setattr(campaign, key, val)

    return row_to_dict(campaign)
