from sqlalchemy.orm.exc import NoResultFound

from splice.models import Content, Version
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

    output = []
    for d in rows:
        versions = []
        for version in d.versions:
            versions.append(row_to_dict(version))
        c = row_to_dict(d)
        c['versions'] = versions
        output.append(c)

    return output


def get_content(name):
    from splice.environment import Environment

    env = Environment.instance()

    row = env.db.session.query(Content).filter(Content.name == name).first()
    c = row_to_dict(row) if row else None
    if c is not None:
        versions = []
        for version in row.versions:
            versions.append(row_to_dict(version))
        c['versions'] = versions

    return c


def insert_content(session, record):
    record = record.copy()
    versions = record.pop('versions', [])
    vns = [Version(**version) for version in versions]
    content = Content(versions=vns, **record)
    session.add(content)
    session.flush()

    c = row_to_dict(content)
    vs = []
    for version in content.versions:
        vs.append(row_to_dict(version))
    c['versions'] = vs

    return c


def update_content(session, content_id, record):
    content = session.query(Content).get(content_id)
    if content is None:  # pragma: no cover
        raise NoResultFound('Content not found')

    for key, val in record.items():
        setattr(content, key, val)

    return row_to_dict(content)


def update_version(session, content_id, version, record):
    version = (
        session
        .query(Version)
        .filter(Version.content_id == content_id)
        .filter(Version.version == version)
        .first()
    )
    if version is None:  # pragma: no cover
        raise NoResultFound('Version not found')

    for key, val in record.items():
        setattr(version, key, val)

    return row_to_dict(version)


def insert_version(session, content_id, record):
    content = session.query(Content).get(content_id)
    if content is None:  # pragma: no cover
        raise NoResultFound('Content not found')

    version = Version(**record)
    content.versions.append(version)
    session.flush()

    return row_to_dict(version)
