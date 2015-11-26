from splice.models import impression_stats_daily
from splice.queries.tile import get_tiles
from sqlalchemy.sql import func
from sqlalchemy.orm import aliased
from sqlalchemy import case


def get_stats(group_by, filters=None):
    """
    Get aggregated stats based on a list of group_by fields and filters
    """
    from splice.environment import Environment
    env = Environment.instance()

    isd = aliased(impression_stats_daily)
    filters = filters or {}
    base_table = isd
    tiles = []
    group_by_columns = []

    # Fields
    if 'category' in group_by:
        grouped_tiles = get_tiles(group_by='category', filters=filters)
        if not grouped_tiles:
            return None
        for c in grouped_tiles:
            for tile in c['tile_ids']:
                tiles.append(tile)

        category = case(map(
            (lambda item: (isd.c.tile_id.in_(item['tile_ids']), item['category'])),
            grouped_tiles
        ))

        other_groups = group_by[:]
        other_groups.remove('category')
        if 'date' in other_groups:
            other_groups.remove('date')

        base_table = (
            env.db.session.query(
                category.label('category'),
                isd.c.date,
                isd.c.tile_id,
                isd.c.impressions,
                isd.c.clicks,
                isd.c.pinned,
                isd.c.blocked,
                *other_groups
            )
            .filter(isd.c.tile_id.in_(tiles))
        ).subquery()
    else:
        tiles = get_tiles(limit_fields=['id'], filters=filters)
        if not tiles:
            return None
        else:
            tiles = [t['id'] for t in tiles]

    for column in group_by:
        group_by_columns.append(base_table.c[column])

    query = group_by_columns + [
        func.sum(base_table.c.impressions).label('impressions'),
        func.sum(base_table.c.clicks).label('clicks'),
        func.sum(base_table.c.pinned).label('pinned'),
        func.sum(base_table.c.blocked).label('blocked')
    ]

    # Base query
    rows = (
        env.db.session
        .query(*query)
        .group_by(*group_by_columns)
        .order_by(group_by_columns[0])
    )

    # Filters
    if 'category' not in group_by:
        rows = rows.filter(base_table.c.tile_id.in_(tiles))
    if 'country_code' in filters:
        rows = rows.filter(base_table.c.country_code == filters['country_code'])
    if 'start_date' in filters:
        rows = rows.filter(base_table.c.date >= filters['start_date'])
    if 'end_date' in filters:
        rows = rows.filter(base_table.c.date <= filters['end_date'])

    rows = rows.all()
    env.db.session.close()
    return [r._asdict() for r in rows] if rows else None
