from splice.models import Adgroup
from sqlalchemy.sql import exists
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import InvalidRequestError

from splice.queries.common import row_to_dict


def get_adgroups_by_campaign_id(campaign_id):
    from splice.environment import Environment

    env = Environment.instance()

    rows = (
        env.db.session
        .query(Adgroup)
        .filter(Adgroup.campaign_id == campaign_id)
        .order_by(Adgroup.id.desc())
        .all()
    )
    output = [row_to_dict(d) for d in rows]

    return output


def get_adgroup(id):
    from splice.environment import Environment

    env = Environment.instance()

    row = (
        env.db.session
        .query(Adgroup).get(id)
    )
    return row_to_dict(row) if row else None


def adgroup_exists(session, record):
    ret = session.query(
        exists().
        where(Adgroup.name == record["name"]).
        where(Adgroup.locale == record["locale"]).
        where(Adgroup.type == record["type"]).
        where(Adgroup.campaign_id == record["campaign_id"])).scalar()
    return ret


def insert_adgroup(session, record):
    if not adgroup_exists(session, record):
        adgroup = Adgroup(**record)
        if adgroup.type == "suggested" and not adgroup.category:
            raise InvalidRequestError("Each suggested adgroup must have a category")
        session.add(adgroup)
        session.flush()
        return row_to_dict(adgroup)
    else:
        raise InvalidRequestError("Adgroup already exists")


def update_adgroup(session, adgroup_id, record):
    adgroup = session.query(Adgroup).get(adgroup_id)
    if adgroup is None:
        raise NoResultFound("No result found")

    if "name" in record:
        adgroup.name = record["name"]

    if "type" in record:
        adgroup.type = record["type"]

    if "category" in record:
        adgroup.category = record["category"]
    if adgroup.type == "suggested" and not adgroup.category:
        raise InvalidRequestError("Each suggested adgroup must have a category")

    if "frequencey_cap_daily" in record:
        adgroup.frequency_cap_daily = record["frequency_cap_daily"]

    if "frequencey_cap_total" in record:
        adgroup.frequency_cap_total = record["frequency_cap_total"]

    return row_to_dict(adgroup)
