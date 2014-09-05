from datetime import datetime
from sqlalchemy.sql import text
from splice.environment import Environment
from splice.models import Tile, impression_stats_daily
from sqlalchemy.sql import select, func, and_


def tile_exists(target_url, bg_color, title, type, image_uri, enhanced_image_uri, locale, country_code, *args, **kwargs):
    """
    Return the id of a tile having the data provided
    """
    from splice.environment import Environment
    env = Environment.instance()
    results = (
        env.session
        .query(Tile.id)
        .filter(Tile.target_url == target_url)
        .filter(Tile.bg_color == bg_color)
        .filter(Tile.title == title)
        .filter(Tile.image_uri == image_uri)
        .filter(Tile.enhanced_image_uri == enhanced_image_uri)
        .filter(Tile.locale == locale)
        .first()
    )

    if results:
        return results[0]

    return results


def _stats_query(connection, start_date, date_window, group_column_name, group_value):
    imps = impression_stats_daily
    window_func_table = func.date_part(date_window, imps.c.date)
    window_func_param = func.date_part(date_window, func.date(start_date))
    group_column = imps.c.get(group_column_name)
    if group_value is not None:
        where_clause = and_(
            window_func_table >= window_func_param,
            group_column == group_value)
    else:
        where_clause = window_func_table >= window_func_param

    stmt = select([
            window_func_table,
            group_column,
            func.sum(imps.c.impressions),
            func.sum(imps.c.clicks),
            func.sum(imps.c.pinned),
            func.sum(imps.c.blocked),
            func.sum(imps.c.sponsored),
            func.sum(imps.c.sponsored_link)])\
        .where(where_clause)\
        .group_by(window_func_table, group_column)\
        .order_by(window_func_table, group_column)
    return (date_window, group_column_name, 'impressions', 'clicks', 'pinned',
                'blocked', 'sponsored', 'sponsored_link'),\
           connection.execute(stmt)


def tile_stats_weekly(connection, start_date, tile_id=None):
    return _stats_query(connection, start_date, 'week', 'tile_id', tile_id)


def tile_stats_monthly(connection, start_date, tile_id=None):
    return _stats_query(connection, start_date, 'month', 'tile_id', tile_id)


def slot_stats_weekly(connection, start_date, slot_id=None):
    return _stats_query(connection, start_date, 'week', 'position', slot_id)


def slot_stats_monthly(connection, start_date, slot_id=None):
    return _stats_query(connection, start_date, 'month', 'position', slot_id)

        week_func_table, imps.c.tile_id,
        func.sum(imps.c.impressions),
        func.sum(imps.c.clicks),
        func.sum(imps.c.pinned),
        func.sum(imps.c.blocked),
        func.sum(imps.c.sponsored),
        func.sum(imps.c.sponsored_link)
    ])
    return connection.execute(stmt)

def insert_tile(target_url, bg_color, title, type, image_uri, enhanced_image_uri, locale, *args, **kwargs):
    conn = env.db.engine.connect()
    trans = conn.begin()
    try:
        conn.execute("LOCK TABLE tiles IN SHARE ROW EXCLUSIVE MODE;")
        conn.execute(

            text(
                "INSERT INTO tiles ("
                " target_url, bg_color, title, type, image_uri, enhanced_image_uri, locale, created_at"
                ") "
                "VALUES ("
                " :target_url, :bg_color, :title, :type, :image_uri, :enhanced_image_uri, :locale, :created_at"
                ")"
            ),
            target_url=target_url,
            bg_color=bg_color,
            title=title,
            type=type,
            image_uri=image_uri,
            enhanced_image_uri=enhanced_image_uri,
            locale=locale,
            created_at=datetime.utcnow()
        )

        result = conn.execute("SELECT MAX(id) FROM tiles;").scalar()
        trans.commit()
        return result
    except:
        trans.rollback()
        raise
