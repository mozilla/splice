from splice.models import impression_stats_daily
from splice.queries.tile import get_tiles_by_campaign
from sqlalchemy.sql import func


def get_stats_by_date(campaign_id):

    from splice.environment import Environment
    env = Environment.instance()

    tiles = get_tiles_by_campaign(campaign_id)

    if not tiles:
        return None

    tile_ids = map((lambda tile: tile['id']), tiles)

    rows = (
        env.db.session
        .query(
            impression_stats_daily.c.date,
            func.sum(impression_stats_daily.c.impressions).label('impressions'),
            func.sum(impression_stats_daily.c.clicks).label('clicks'),
            func.sum(impression_stats_daily.c.pinned).label('pinned'),
            func.sum(impression_stats_daily.c.blocked).label('blocked')
        )
        .group_by(impression_stats_daily.c.date)
        .filter(impression_stats_daily.c.tile_id.in_(tile_ids))
        .order_by(impression_stats_daily.c.date)
        .all()
    )

    return [r._asdict() for r in rows]
