from splice.models import Account, Campaign, Adgroup, AdgroupCategory, Tile
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import InvalidRequestError
from sqlalchemy.sql import exists, func
from splice.queries.common import tuple_to_dict, row_to_dict


def add_joins_for_filters(query, filters, group_by=None):
    """
    Check if we need to join on other tables to do our filters
    """
    adgroup_filters = set(['account_id', 'campaign_id', 'adgroup_type', 'channel_id', 'locale'])
    campaign_filters = set(['account_id'])

    if adgroup_filters.intersection(filters) and group_by not in ['account_id', 'campaign_id', 'adgroup_id']:
        query = query.join(Adgroup, Tile.adgroup_id == Adgroup.id)
    if campaign_filters.intersection(filters) and group_by not in ['account_id', 'campaign_id']:
        query = query.join(Campaign, Adgroup.campaign_id == Campaign.id)

    return query


def add_filters(query, filters, group_by=None):
    """
    Builds filters into a tile query from a dict
    """

    if not filters:
        return query
    if 'adgroup_id' in filters:
        query = query.filter(Tile.adgroup_id == filters['adgroup_id'])
    if 'campaign_id' in filters:
        query = query.filter(Adgroup.campaign_id == filters['campaign_id'])
    if 'account_id' in filters:
        query = query.filter(Campaign.account_id == filters['account_id'])
    if 'type' in filters:
        query = query.filter(Tile.type == filters['type'])
    if 'adgroup_type' in filters:
        query = query.filter(Adgroup.type == filters['adgroup_type'])
    if 'channel_id' in filters:
        query = query.filter(Adgroup.channel_id == filters['channel_id'])
    if 'locale' in filters:
        query = query.filter(Adgroup.locale == filters['locale'])

    query = add_joins_for_filters(query, filters, group_by)

    return query


def add_joins_for_group_by(query, group_by):
    if group_by == 'category':
        query = query.join(AdgroupCategory, Tile.adgroup_id == AdgroupCategory.adgroup_id)
    if group_by in ['account_id', 'campaign_id', 'adgroup_id']:
        query = query.join(Adgroup, Tile.adgroup_id == Adgroup.id)
    if group_by in ['account_id', 'campaign_id']:
        query = query.join(Campaign, Adgroup.campaign_id == Campaign.id)
    if group_by == 'account_id':
        query = query.join(Account, Campaign.account_id == Account.id)
    return query


def get_tiles(filters=None, limit_fields=None):
    from splice.environment import Environment

    fields = [getattr(Tile, field) for field in limit_fields] if limit_fields else [Tile]
    format_row = tuple_to_dict if limit_fields else row_to_dict

    rows = Environment.instance().db.session.query(*fields)
    rows = add_filters(rows, filters)
    rows = rows.all()

    return [format_row(r) for r in rows] if rows else None


def get_tile_ids_by_group(group_by, filters=None):
    from splice.environment import Environment
    env = Environment.instance()

    group_by_field = {
        'category': AdgroupCategory.category,
        'account_id': Account.id,
        'campaign_id': Campaign.id,
        'adgroup_id': Adgroup.id
    }.get(group_by)

    rows = (
        env.db.session
        .query(group_by_field.label(group_by), func.array_agg(Tile.id).label('tile_ids'))
        .select_from(Tile)
        .group_by(group_by_field)
    )

    rows = add_joins_for_group_by(query=rows, group_by=group_by)
    rows = add_filters(rows, filters, group_by)
    rows = rows.all()

    return [tuple_to_dict(r) for r in rows] if rows else None


def get_tile(id):
    from splice.environment import Environment

    env = Environment.instance()

    row = (
        env.db.session
        .query(Tile).get(id)
    )
    return row_to_dict(row) if row else None


def tile_exists(session, title, target_url, image_uri, enhanced_image_uri, tile_type, adgroup_id):
    ret = session.query(
        exists().
        where(Tile.title == title).
        where(Tile.target_url == target_url).
        where(Tile.image_uri == image_uri).
        where(Tile.enhanced_image_uri == enhanced_image_uri).
        where(Tile.type == tile_type).
        where(Tile.adgroup_id == adgroup_id)).scalar()
    return ret


def insert_tile(session, record):
    if not tile_exists(session, record["title"], record["target_url"],
                       record["image_uri"], record["enhanced_image_uri"],
                       record["type"], record["adgroup_id"]):
        tile = Tile(**record)
        session.add(tile)
        session.flush()

        return row_to_dict(tile)
    else:
        raise InvalidRequestError("Tile already exists")


def update_tile(session, tile_id, record):
    """ Tile is immutable once it gets created, the only field could be updated
    is the status.
    """
    tile = session.query(Tile).get(tile_id)
    if tile is None:
        raise NoResultFound("No result found")

    for key, val in record.items():
        setattr(tile, key, val)

    return row_to_dict(tile)
