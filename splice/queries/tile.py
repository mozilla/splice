from splice.models import Tile
from sqlalchemy.orm.exc import NoResultFound

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


def insert_tile(session, record):
    tile = Tile(**record)
    session.add(tile)
    session.flush()
    return row_to_dict(tile)


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
