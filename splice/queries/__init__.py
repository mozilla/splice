from contextlib import contextmanager


@contextmanager
def session_scope():
    from splice.environment import Environment

    env = Environment.instance()
    session = env.db.session
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()


def row_to_dict(row):
    return {c.name: getattr(row, c.name) for c in row.__table__.columns}
