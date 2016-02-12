
from sqlalchemy.orm.exc import NoResultFound

from splice.models import Content
from splice.queries.common import row_to_dict


def get_contents():
    from splice.environment import Environment

    env = Environment.instance()

    rows = (
        env.db.session
        .query(Content)
        .order_by(Content.id.desc())
        .all()
    )
    output = [row_to_dict(d) for d in rows]

    return output


def get_content(name):
    from splice.environment import Environment

    env = Environment.instance()

    row = env.db.session.query(Content).filter(Content.name == name).first()
    return row_to_dict(row) if row else None


def insert_content(session, record):
    content = Content(**record)
    session.add(content)
    session.flush()
    return row_to_dict(content)


def update_content(session, content_id, record):
    content = session.query(Content).get(content_id)
    if content is None:
        raise NoResultFound('Content not found')

    for key, val in record.items():
        setattr(content, key, val)

    return row_to_dict(content)
