from splice.models import Tile
from sqlalchemy.sql import exists
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import InvalidRequestError

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


def tile_exists(session, record):
    ret = session.query(
        exists().
        where(Tile.title == record["title"]).
        where(Tile.target_url == record["target_url"]).
        where(Tile.bg_color == record["bg_color"]).
        where(Tile.image_uri == record["image_uri"]).
        where(Tile.enhanced_image_uri == record["enhanced_image_uri"]).
        where(Tile.type == record["type"]).
        where(Tile.status == record["status"]).
        where(Tile.explanation == record["explanation"]).
        where(Tile.adgroup_id == record["adgroup_id"])).scalar()
    return ret


def insert_tile(session, record):
    if not tile_exists(session, record):
        adgroup = Tile(**record)
        session.add(adgroup)
        session.flush()
        return row_to_dict(adgroup)
    else:
        raise InvalidRequestError("Tile already exists")


def update_tile(session, tile_id, record):
    """ Tile is immutable once it gets created, the only field could be updated
    is the status.
    """
    tile = session.query(Tile).get(tile_id)
    if tile is None:
        raise NoResultFound("No result found")

    if "status" in record:
        tile.status = record["status"]

    return row_to_dict(tile)
