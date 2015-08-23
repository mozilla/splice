from sqlalchemy.orm.exc import NoResultFound

from splice.models import Campaign
from splice.queries.common import row_to_dict


def get_campaigns(account_id=None):
    from splice.environment import Environment

    env = Environment.instance()

    query = env.db.session.query(Campaign)

    if account_id is not None:
        query = query.filter(Campaign.account_id == account_id)

    rows = query.order_by(Campaign.id.desc()).all()

    return [row_to_dict(d) for d in rows]


def get_campaign(campaign_id):
    from splice.environment import Environment

    env = Environment.instance()

    row = (
        env.db.session
        .query(Campaign).get(campaign_id)
    )
    return row_to_dict(row) if row else None


def insert_campaign(session, record):
    campaign = Campaign(**record)
    session.add(campaign)
    session.flush()
    return row_to_dict(campaign)


def update_campaign(session, campaign_id, record):
    campaign = session.query(Campaign).get(campaign_id)
    if campaign is None:
        raise NoResultFound('Campaign not found')

    for key, val in record.items():
        setattr(campaign, key, val)

    return row_to_dict(campaign)
