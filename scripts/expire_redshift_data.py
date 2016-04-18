#!/usr/bin/env python
from optparse import OptionParser
from datetime import date, timedelta


USAGE = """Usage:
        # delete all the rows that are more than 7 days old
        %prog -n 7

        # delete with specific tables
        %prog -n 30 -t the_table_name
        """

_DEFAULT_RETENTION_DAYS = 365 + 31
_TABLES = ["impression_stats_daily", "application_stats_daily",
           "newtab_stats_daily", "site_stats_daily"]
_TEMPLATE = "DELETE FROM {table} WHERE date < {date_lower};"
_TEMPLATE_VACUUM = "VACUUM {table};"
_TEMPLATE_ANALYZE = "ANALYZE {table};"


def main():
    parser = OptionParser(usage=USAGE)
    parser.add_option("-n", "--days",
                      dest="days", type="int", action="store",
                      default=_DEFAULT_RETENTION_DAYS,
                      help="specify how many days of data we want to keep")
    parser.add_option("-t", "--table", default=[],
                      action="append", dest="tables",
                      help="specify extra tables")
    options, _ = parser.parse_args()
    sql = expire_data(options.days, options.tables)
    print sql


def expire_data(days, extra_tables):
    sql = ["BEGIN;"]
    date_lower = date.today() + timedelta(days=-days)
    all_tables = _TABLES + extra_tables
    for table in all_tables:
        sql.append(_TEMPLATE.format(table=table, date_lower=date_lower))
    sql.append("COMMIT;")

    for table in all_tables:
        sql.append(_TEMPLATE_VACUUM.format(table=table))
        sql.append(_TEMPLATE_ANALYZE.format(table=table))

    sql = "\n".join(sql)
    return sql


if __name__ == '__main__':
    main()
