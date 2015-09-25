from splice.models import Adgroup, AdgroupCategory
from sqlalchemy.sql import exists
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import InvalidRequestError

from splice.queries.common import row_to_dict


def get_categories_for_adgroup(session, adgroup_id):
    results = (
        session.query(AdgroupCategory.category)
        .filter(AdgroupCategory.adgroup_id == adgroup_id)).all()
    categories = [category for category, in results]

    return sorted(set(categories))


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

    output = []
    for d in rows:
        new = row_to_dict(d)
        categories = []
        for category in d.categories:
            categories = categories.append(category.category)
        new['categories'] = categories
        output.append(new)

    return output


def get_adgroup(id):
    from splice.environment import Environment

    env = Environment.instance()

    row = (
        env.db.session
        .query(Adgroup).get(id)
    )
    if row is None:
        return None

    new = row_to_dict(row)
    categories = []
    for category in row.categories:
        categories.append(category.category)
    new['categories'] = categories

    return new


def adgroup_exists(session, name, adgroup_type, campaign_id):
    ret = session.query(
        exists()
        .where(Adgroup.name == name)
        .where(Adgroup.type == adgroup_type)
        .where(Adgroup.campaign_id == campaign_id)).scalar()
    return ret


def insert_adgroup(session, record):
    if not adgroup_exists(session, record["name"], record["type"], record["campaign_id"]):
        record = record.copy()
        categories = record.pop('categories', [])
        if record['type'] == "suggested" and not categories:
            raise InvalidRequestError("Each suggested adgroup must have at least one category.")
        cats = [AdgroupCategory(category=category) for category in categories]
        adgroup = Adgroup(categories=cats, **record)
        session.add(adgroup)

        session.flush()
        new = row_to_dict(adgroup)
        # row_to_dict can't handle nested objects
        new['categories'] = categories

        return new
    else:
        raise InvalidRequestError("Adgroup already exists")


def update_adgroup(session, adgroup_id, record):
    adgroup = session.query(Adgroup).get(adgroup_id)
    if adgroup is None:
        raise NoResultFound("No result found")

    if "paused" in record:
        adgroup.paused = record["paused"]

    is_unique_key_changed = False
    if "name" in record and adgroup.name != record["name"]:
        is_unique_key_changed = True
        adgroup.name = record["name"]

    if "type" in record and adgroup.type != record["type"]:
        is_unique_key_changed = True
        adgroup.type = record["type"]

    if is_unique_key_changed and adgroup_exists(session, adgroup.name, adgroup.type, adgroup.campaign_id):
        raise InvalidRequestError("Adgroup already exists")

    if "frequencey_cap_daily" in record:
        adgroup.frequency_cap_daily = record["frequency_cap_daily"]

    if "frequencey_cap_total" in record:
        adgroup.frequency_cap_total = record["frequency_cap_total"]

    session.flush()
    new = row_to_dict(adgroup)

    if "categories" in record:
        if adgroup.type == "suggested" and not record['categories']:
            raise InvalidRequestError("Each suggested adgroup must have at least one category")
        for category in adgroup.categories:
            session.delete(category)
        for category in record['categories']:
            adgroup.categories.append(AdgroupCategory(category=category))

        new['categories'] = record['categories']
    return new
