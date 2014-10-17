from datetime import datetime
from sqlalchemy.sql import text
from splice.models import Distribution, Tile, impression_stats_daily
from sqlalchemy.sql import select, func, and_


def tile_exists(target_url, bg_color, title, type, image_uri, enhanced_image_uri, locale, *args, **kwargs):
    """
    Return the id of a tile having the data provided
    """
    from splice.environment import Environment

    env = Environment.instance()
    results = (
        env.db.session
        .query(Tile.id)
        .filter(Tile.target_url == target_url)
        .filter(Tile.bg_color == bg_color)
        .filter(Tile.title == title)
        .filter(Tile.image_uri == image_uri)
        .filter(Tile.enhanced_image_uri == enhanced_image_uri)
        .filter(Tile.locale == locale)
        .first()
    )

    if results:
        return results[0]

    return results


def _stats_query(connection, start_date, date_window, group_column_name, group_value, country_code):
    dt = datetime.strptime(start_date, "%Y-%m-%d")
    year = dt.year
    if date_window == 'month':
        window_param = dt.month
    elif date_window == 'date':
        window_param = dt
    else:
        window_param = dt.isocalendar()[1]

    imps = impression_stats_daily
    window_func_table = imps.c.get(date_window)
    group_column = imps.c.get(group_column_name)

    # the where clause is an ANDed list of country, monthly|weekly, and year conditions
    where_elements = [imps.c.year >= year, window_func_table >= window_param]
    if country_code is not None:
        where_elements.append(imps.c.country_code == country_code)

    if group_value is not None:
        where_elements.append(group_column == group_value)

    where_clause = and_(*where_elements)

    stmt = select(
        [
            imps.c.year,
            window_func_table,
            group_column,
            imps.c.country_code,
            imps.c.locale,
            func.sum(imps.c.impressions),
            func.sum(imps.c.clicks),
            func.sum(imps.c.pinned),
            func.sum(imps.c.blocked),
            func.sum(imps.c.sponsored),
            func.sum(imps.c.sponsored_link),
            func.sum(imps.c.newtabs)
        ]) \
        .where(where_clause) \
        .group_by(imps.c.year, window_func_table, group_column, imps.c.country_code, imps.c.locale) \
        .order_by(imps.c.year, window_func_table, group_column, imps.c.country_code, imps.c.locale)
    return ('year', date_window, group_column_name, 'country_code', 'locale',
            'impressions', 'clicks', 'pinned', 'blocked', 'sponsored', 'sponsored_link', 'newtabs'), \
        connection.execute(stmt)


def _summary_query(connection, start_date, date_window, group_column_name, country_code):
    dt = datetime.strptime(start_date, "%Y-%m-%d")
    year = dt.year
    if date_window == 'month':
        window_param = dt.month
    elif date_window == 'date':
        window_param = dt
    else:
        window_param = dt.isocalendar()[1]

    imps = impression_stats_daily
    window_func_table = imps.c.get(date_window)
    group_column = imps.c.get(group_column_name)

    # the where clause is an ANDed list of country, monthly|weekly, and year conditions
    where_elements = [imps.c.year >= year, window_func_table >= window_param]
    if country_code is not None:
        where_elements.append(imps.c.country_code == country_code)

    where_clause = and_(*where_elements)

    stmt = select(
        [
            imps.c.year,
            window_func_table,
            group_column,
            func.sum(imps.c.impressions),
            func.sum(imps.c.clicks),
            func.sum(imps.c.pinned),
            func.sum(imps.c.blocked),
            func.sum(imps.c.sponsored),
            func.sum(imps.c.sponsored_link),
            func.sum(imps.c.newtabs)
        ]) \
        .where(where_clause) \
        .group_by(imps.c.year, window_func_table, group_column) \
        .order_by(imps.c.year, window_func_table, group_column)
    return ('year', date_window, group_column_name,
            'impressions', 'clicks', 'pinned', 'blocked', 'sponsored', 'sponsored_link', 'newtabs'), \
        connection.execute(stmt)


def tile_stats_weekly(connection, start_date, tile_id=None, country_code=None):
    return _stats_query(connection, start_date, 'week', 'tile_id', tile_id, country_code)


def tile_stats_monthly(connection, start_date, tile_id=None, country_code=None):
    return _stats_query(connection, start_date, 'month', 'tile_id', tile_id, country_code)


def tile_stats_daily(connection, start_date, tile_id=None, country_code=None):
    return _stats_query(connection, start_date, 'date', 'tile_id', tile_id, country_code)


def tile_summary_weekly(connection, start_date, country_code=None):
    return _summary_query(connection, start_date, 'week', 'tile_id', country_code)


def tile_summary_monthly(connection, start_date, country_code=None):
    return _summary_query(connection, start_date, 'month', 'tile_id', country_code)


def tile_summary_daily(connection, start_date, country_code=None):
    return _summary_query(connection, start_date, 'date', 'tile_id', country_code)


def slot_stats_weekly(connection, start_date, slot_id=None, country_code=None):
    return _stats_query(connection, start_date, 'week', 'position', slot_id, country_code)


def slot_stats_monthly(connection, start_date, slot_id=None, country_code=None):
    return _stats_query(connection, start_date, 'month', 'position', slot_id, country_code)


def slot_summary_weekly(connection, start_date, country_code=None):
    return _summary_query(connection, start_date, 'week', 'position', country_code)


def slot_summary_monthly(connection, start_date, country_code=None):
    return _summary_query(connection, start_date, 'month', 'position', country_code)


def insert_tile(target_url, bg_color, title, type, image_uri, enhanced_image_uri, locale, *args, **kwargs):
    from splice.environment import Environment

    env = Environment.instance()
    conn = env.db.engine.connect()
    trans = conn.begin()
    try:
        if not env.is_test:
            # test database is sqlite and doesn't support LOCK syntax
            conn.execute("LOCK TABLE tiles IN SHARE ROW EXCLUSIVE MODE;")
        conn.execute(

            text(
                "INSERT INTO tiles ("
                " target_url, bg_color, title, type, image_uri, enhanced_image_uri, locale, created_at"
                ") "
                "VALUES ("
                " :target_url, :bg_color, :title, :type, :image_uri, :enhanced_image_uri, :locale, :created_at"
                ")"
            ),
            target_url=target_url,
            bg_color=bg_color,
            title=title,
            type=type,
            image_uri=image_uri,
            enhanced_image_uri=enhanced_image_uri,
            locale=locale,
            created_at=datetime.utcnow()
        )

        result = conn.execute("SELECT MAX(id) FROM tiles;").scalar()
        trans.commit()
        return result
    except:
        trans.rollback()
        raise


def insert_distribution(url, *args, **kwargs):
    from splice.environment import Environment

    env = Environment.instance()
    conn = env.db.engine.connect()
    trans = conn.begin()
    try:
        conn.execute(
            text(
                "INSERT INTO distributions ("
                " url, created_at"
                ") "
                "VALUES ("
                " :url, :created_at"
                ")"
            ),
            url=url,
            created_at=datetime.utcnow()
        )
        trans.commit()
    except:
        trans.rollback()
        raise


def get_distributions(limit=100, *args, **kwargs):
    from splice.environment import Environment

    env = Environment.instance()

    rows = (
        env.db.session
        .query(Distribution.url, Distribution.created_at)
        .order_by(Distribution.id.desc())
        .limit(limit)
        .all()
    )

    # ensure items are lists of lists rather than KeyedTuples
    # KeyedTuples may serialize differently on other systems
    output = [list(d) for d in rows]

    return output
