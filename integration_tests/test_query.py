from splice.environment import Environment

# env = Environment.instance("integration_tests.prod_settings.DefaultConfig")
env = Environment.instance()

from splice.queries import tile_stats_weekly, slot_stats_weekly, tile_stats_monthly, slot_stats_monthly, \
    tile_summary_weekly, slot_summary_weekly, tile_summary_monthly, slot_summary_monthly, \
    tile_stats_daily, tile_summary_daily

with env.application.app_context():
    # TODO: check results
    conn = env.db.engine.connect()
    print "\ntile_summary_weekly"
    key, rval = tile_summary_weekly(conn, '2014-05-15')
    for x in rval:
        print x

    print "\ntile_summary_daily"
    _, rval = tile_summary_daily(conn, '2014-05-15')
    for year, week, tile_id, title, imps, clicks, pinned, blocked, spon, spon_link, newtabs in rval:
        print year, week, tile_id, title, imps, clicks, pinned, blocked, spon, spon_link, newtabs

    print "\ntile_stats_weekly - tile_id = 2"
    _, rval = tile_stats_weekly(conn, '2014-05-15', '2')
    for year, week, tile_id, title, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs in rval:
        print year, week, tile_id, title, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs

    print "\ntile_stats_weekly - tile_id = 2, country_code = US"
    _, rval = tile_stats_weekly(conn, '2014-05-15', '2', 'US')
    for year, week, tile_id, title, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs in rval:
        print year, week, tile_id, title, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs

    print "\ntile_stats_daily - tile_id = 2"
    _, rval = tile_stats_daily(conn, '2014-05-15', '2')
    for year, week, tile_id, title, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs in rval:
        print year, week, tile_id, title, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs

    print "\ntile_stats_daily - tile_id = 2, country_code = US"
    _, rval = tile_stats_daily(conn, '2014-05-15', '2', 'US')
    for year, week, tile_id, title, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs in rval:
        print year, week, tile_id, title, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs

    print "\nslot_summary_weekly"
    _, rval = slot_summary_weekly(conn, '2014-05-15')
    for year, week, tile_id, imps, clicks, pinned, blocked, spon, spon_link, newtabs in rval:
        print year, week, tile_id, imps, clicks, pinned, blocked, spon, spon_link, newtabs

    print "\nslot_stats_weekly - slot_id = 1"
    _, rval = slot_stats_weekly(conn, '2014-05-15', 1)
    for year, week, tile_id, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs in rval:
        print year, week, tile_id, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs

    print "\nslot_stats_weekly - slot_id = 1, country_code = US"
    _, rval = slot_stats_weekly(conn, '2014-05-15', 1, 'US')
    for year, week, tile_id, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs in rval:
        print year, week, tile_id, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs

    print "\ntile_summary_monthly"
    _, rval = tile_summary_monthly(conn, '2014-05-15')
    for year, week, tile_id, title, imps, clicks, pinned, blocked, spon, spon_link, newtabs in rval:
        print year, week, tile_id, title, imps, clicks, pinned, blocked, spon, spon_link, newtabs

    print "\ntile_stats_monthly - tile_id = 2"
    _, rval = tile_stats_monthly(conn, '2014-05-15', '2')
    for year, week, tile_id, title, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs in rval:
        print year, week, tile_id, title, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs

    print "\ntile_stats_monthly - tile_id = 2, country_code = US"
    _, rval = tile_stats_monthly(conn, '2014-05-15', '2', 'US')
    for year, week, tile_id, title, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs in rval:
        print year, week, tile_id, title, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs

    print "\nslot_summary_monthly"
    _, rval = slot_summary_monthly(conn, '2014-05-15')
    for year, week, tile_id, imps, clicks, pinned, blocked, spon, spon_link, newtabs in rval:
        print year, week, tile_id, imps, clicks, pinned, blocked, spon, spon_link, newtabs

    print "\nslot_stats_monthly - slot_id = 1"
    _, rval = slot_stats_monthly(conn, '2014-05-15', 1)
    for year, week, tile_id, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs in rval:
        print year, week, tile_id, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs

    print "\nslot_stats_monthly - slot_id = 1, country_code = US"
    _, rval = slot_stats_monthly(conn, '2014-05-15', 1, 'US')
    for year, week, tile_id, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs in rval:
        print year, week, tile_id, country, locale, imps, clicks, pinned, blocked, spon, spon_link, newtabs
