from splice.models import Tile
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import InvalidRequestError
from sqlalchemy.sql import exists

from splice.queries.common import row_to_dict


def get_tiles_by_adgroup_id(adgroup_id):
    from splice.environment import Environment

    env = Environment.instance()

    rows = (
        env.db.session
        .query(Tile)
        .filter(Tile.adgroup_id == adgroup_id)
        .order_by(Tile.id.desc())
        .all()
    )
    output = [row_to_dict(d) for d in rows]

    return output


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
