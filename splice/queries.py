from datetime import datetime
from sqlalchemy.sql import text
from splice.environment import Environment
from splice.models import Tile
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


def insert_tile(target_url, bg_color, title, type, image_uri, enhanced_image_uri, locale, *args, **kwargs):
    conn = env.db.engine.connect()
    trans = conn.begin()
    try:
        result = conn.execute(

            text(
                "BEGIN; "
                "INSERT INTO tiles ("
                " target_url, bg_color, title, type, image_uri, enhanced_image_uri, locale, created_at"
                ") "
                "VALUES ("
                " :target_url, :bg_color, :title, :type, :image_uri, :enhanced_image_uri, :locale, :created_at"
                ") "
                "RETURNING id"
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
        trans.commit()
        return result.scalar()
    except:
        trans.rollback()
        raise
