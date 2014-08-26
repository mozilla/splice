from sqlalchemy import exists
from splice.environment import Environment
from splice.models import Tile
env = Environment.instance()

def tile_exists(target_url, bg_color, title, type, image_uri, enhanced_image_uri, locale, country_code, *args, **kwargs):
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
        .filter(Tile.country_code == country_code)
        .scalar()
    )

    return results
