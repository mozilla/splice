#!/usr/bin/env python
from sqlalchemy.sql import text
from splice.queries import get_tiles


from splice.environment import Environment
env = Environment.instance()
with env.application.app_context():

    session = env.db.session
    conn = env.db.engine.connect()
    trans = conn.begin()


    try:
        has_rows = conn.execute("SELECT count(*) FROM adgroups").scalar()
        if has_rows:
            print "won't execute insert.  adgroups has %d non-empty rows" % has_rows
        else:
            for tile in get_tiles():
                conn.execute(
                    text("INSERT INTO adgroups (locale) VALUES (:locale)"),
                    locale=tile['locale'])
                ag_id = conn.execute("SELECT MAX(id) FROM adgroups;").scalar()
                conn.execute(
                    text("UPDATE tiles set adgroup_id = :adgroup_id"),
                    adgroup_id=ag_id)
    except Exception as e:
        trans.rollback()
        print "error: %s" % e
    else:
        trans.commit()
        if not has_rows:
            print "success!"
