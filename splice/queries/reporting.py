from splice.models import impression_stats_daily
from splice.queries.tile import get_tiles, get_tile_ids_by_group
from sqlalchemy.sql import func
from sqlalchemy.orm import aliased
from sqlalchemy import case
from splice.queries.common import tuple_to_dict
from sqlalchemy.exc import InvalidRequestError

CROSS_DB_COLUMNS = {
    'account_id',
    'campaign_id',
    'adgroup_id',
    'type',
    'adgroup_type',
    'category'
}

CROSS_DB_ERROR = 'You may only group by ONE of %s'


def build_subquery_table(env, stats_table, cross_db_group_by, group_by, filters=None):
    """
    Build a subquery for group_by fields that require groupings in mozsplice_campaigns
    """
    # Note: we only support one cross-db group-by at the moment
    if (len(cross_db_group_by) > 1):
        raise InvalidRequestError(CROSS_DB_ERROR % ' and '.join(cross_db_group_by))

    group_by_field = cross_db_group_by[0]
    grouped_tiles = get_tile_ids_by_group(group_by=group_by_field, filters=filters)

    if not grouped_tiles:
        return None

    # flatten grouped_tiles
    all_tiles = sum([group['tile_ids'] for group in grouped_tiles], [])

    case_table = case(map(
        (lambda item: (stats_table.c.tile_id.in_(item['tile_ids']), item[group_by_field])),
        grouped_tiles
    ))

    subquery = (
        env.db.session.query(
            case_table.label(group_by_field),
            *stats_table.c
        )
        .filter(stats_table.c.tile_id.in_(all_tiles))
    ).subquery()

    return subquery


def build_base_query(env, group_by, base_table):
    """
    Build a basic query given a list of group_by fields and a base table
    """
    group_by_columns = [base_table.c[column] for column in group_by]

    fields = group_by_columns + [
        func.sum(base_table.c.impressions).label('impressions'),
        func.sum(base_table.c.clicks).label('clicks'),
        func.sum(base_table.c.pinned).label('pinned'),
        func.sum(base_table.c.blocked).label('blocked')
    ]

    return (
        env.db.session
        .query(*fields)
        .group_by(*group_by_columns)
    )


def add_filters(query, base_table, filters):
    """
    Adds filters to query
    """
    if 'tile_id' in filters:
        query = query.filter(base_table.c.tile_id.in_(filters['tile_id']))
    if 'country_code' in filters:
        query = query.filter(base_table.c.country_code == filters['country_code'])
    if 'locale' in filters:
        query = query.filter(base_table.c.locale == filters['locale'])
    if 'start_date' in filters:
        query = query.filter(base_table.c.date >= filters['start_date'])
    if 'end_date' in filters:
        query = query.filter(base_table.c.date <= filters['end_date'])
    return query


def get_stats(group_by, filters=None, limit=60):
    """
    Get aggregated stats based on a list of group_by fields and filters
    """
    from splice.environment import Environment
    env = Environment.instance()

    isd = aliased(impression_stats_daily)
    base_table = isd
    local_filters = filters.copy()

    has_cross_db_filters = bool(CROSS_DB_COLUMNS.intersection(filters)) if filters else False
    cross_db_group_by = list(CROSS_DB_COLUMNS.intersection(group_by))

    # Build base table and list of tiles
    if cross_db_group_by:
        base_table = build_subquery_table(env=env, stats_table=isd, group_by=group_by,
                                          cross_db_group_by=cross_db_group_by, filters=filters)
        # No tiles were found, so no stats
        if base_table is None:
            return None

    elif has_cross_db_filters:
        tiles_result = get_tiles(limit_fields=['id'], filters=filters)
        # No tiles were found, so no stats
        if not tiles_result:
            return None
        local_filters['tile_id'] = [t['id'] for t in tiles_result]

    # Build query
    rows = build_base_query(env=env, group_by=group_by, base_table=base_table)
    rows = add_filters(query=rows, base_table=base_table, filters=local_filters)
    rows = rows.order_by(base_table.c[group_by[0]]).limit(limit)
    rows = rows.all()

    return [tuple_to_dict(r) for r in rows] if rows else None
