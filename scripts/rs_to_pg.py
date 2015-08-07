#!/usr/bin/env python
import psycopg2
from splice.environment import Environment
from StringIO import StringIO


#
# these tables must be in 'reverse' foreign key order to avoid adding rows that reference primary keys that
# have yet to be inserted
#
TABLES = (
    ('channels', ('id', 'name', 'created_at')),
    ('distributions', ('id', 'url', 'channel_id', 'deployed', 'scheduled_start_date', 'created_at')),
    ('adgroups', ('id', 'created_at', 'locale', 'frequency_cap_daily', 'frequency_cap_total', 'check_inadjacency', 'explanation', 'name', 'end_date', 'end_date_dt', 'start_date', 'start_date_dt')),
    ('adgroup_sites', ('id', 'site', 'adgroup_id', 'created_at')),
    ('tiles', ('id', 'target_url', 'bg_color', 'title', 'type', 'image_uri', 'enhanced_image_uri', 'created_at', 'adgroup_id', 'locale')),
)


def main():
    print "So it begins..."
    target_db_uri = Environment.instance().config.SQLALCHEMY_DATABASE_URI
    target_connection = psycopg2.connect(target_db_uri)
    target_cursor = target_connection.cursor()

    db_uri = Environment.instance().config.SQLALCHEMY_BINDS['stats']
    connection = psycopg2.connect(db_uri)
    cursor = connection.cursor()

    try:
        for table_name, columns in TABLES:
            print "Copying ", table_name

            # first, we need to lock the source table (ideally)
            # the problem with this is that we would need to modify permissions for production to allow
            # the lock for the user configured in SQLALCHEMY_DATABASE_URI
            # cursor.execute("LOCK TABLE %s" % table_name)

            # we need to assert the table is empty
            print "Counting ", table_name
            target_cursor.execute("select count(*) from %s" % table_name)
            count, = target_cursor.fetchone()
            assert count == 0, "Table %s "

            col_string = ','.join(columns)
            str_string = ','.join(["%s"] * len(columns))
            target_query = StringIO()
            target_query.write('insert into %s(%s) values ' % (table_name, col_string))
            print "Reading ", table_name
            cursor.execute('select %s from %s' % (col_string, table_name))
            for rec in cursor:
                target_query.write("(%s)," % target_cursor.mogrify(str_string, tuple(rec)))
            print "Writing ", table_name
            target_cursor.execute(target_query.getvalue()[:-1])

            # now we need to reset the sequence associated with the id for this table
            target_cursor.execute("select max(id) + 1 from %s" % table_name)
            nextone, = target_cursor.fetchone()
            print "Updating sequence for ", table_name
            target_cursor.execute("ALTER SEQUENCE %s_id_seq start %s" % (table_name, nextone))
            print "Done ", table_name

    except Exception as e:
        print "Error ", e
        target_connection.rollback()
        connection.rollback()
    else:
        print "Good, well done, excellent."
        target_connection.commit()
        connection.commit()
    finally:
        connection.close()
        target_connection.close()

if __name__ == '__main__':
    main()
