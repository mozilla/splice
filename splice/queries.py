from datetime import datetime
from sqlalchemy.sql import text
from splice.environment import Environment
from splice.models import Tile, impression_stats_daily
from sqlalchemy.sql import select, func, and_
env = Environment.instance()



def tile_exists(target_url, bg_color, title, type, image_uri, enhanced_image_uri, locale, *args, **kwargs):
    """
    Return the id of a tile having the data provided
    """
    results = (
        env.db.session
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


def tile_stats_weekly(connection, start_date, tile_id=None):
    imps = impression_stats_daily
    week_func_table = func.date_part('week', imps.c.date)
    week_func_param = func.date_part('week', func.date(start_date))
    if tile_id is not None:
        where_clause = and_()
    stmt = select([
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
