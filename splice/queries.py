from datetime import datetime
from sqlalchemy.sql import text
from splice.models import Distribution, Tile, impression_stats_daily, newtab_stats_daily
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


def _slot_query(connection, start_date, date_window, position, country_code):
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

    # the where clause is an ANDed list of country, monthly|weekly, and year conditions
    where_elements = [imps.c.year >= year, window_func_table >= window_param, imps.c.position == position]
    if country_code is not None:
        where_elements.append(imps.c.country_code == country_code)

    where_clause = and_(*where_elements)

    stmt = select(
        [
            imps.c.year,
            window_func_table,
            imps.c.position,
            imps.c.country_code,
            imps.c.locale,
            func.sum(imps.c.impressions),
            func.sum(imps.c.clicks),
            func.sum(imps.c.pinned),
            func.sum(imps.c.blocked),
            func.sum(imps.c.sponsored),
            func.sum(imps.c.sponsored_link),
        ]) \
        .where(where_clause) \
        .group_by(imps.c.year, window_func_table, imps.c.position, imps.c.country_code, imps.c.locale) \
        .order_by(imps.c.year, window_func_table, imps.c.position, imps.c.country_code, imps.c.locale)
    return ('year', date_window, 'position', 'country_code', 'locale',
            'impressions', 'clicks', 'pinned', 'blocked', 'sponsored', 'sponsored_link'), \
        connection.execute(stmt)


def _tile_query(connection, start_date, date_window, tile_id, country_code):
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

    # the where clause is an ANDed list of country, monthly|weekly, and year conditions
    where_elements = [imps.c.year >= year, window_func_table >= window_param, imps.c.tile_id == tile_id]
    if country_code is not None:
        where_elements.append(imps.c.country_code == country_code)

    where_clause = and_(*where_elements)

    stmt = select(
        [
            imps.c.year,
            window_func_table,
            imps.c.tile_id,
            Tile.title,
            imps.c.country_code,
            imps.c.locale,
            func.sum(imps.c.impressions),
            func.sum(imps.c.clicks),
            func.sum(imps.c.pinned),
            func.sum(imps.c.blocked),
            func.sum(imps.c.sponsored),
            func.sum(imps.c.sponsored_link),
        ]) \
        .where(where_clause) \
        .group_by(imps.c.year, window_func_table, imps.c.tile_id, Tile.title, imps.c.country_code, imps.c.locale) \
        .order_by(imps.c.year, window_func_table, imps.c.tile_id, imps.c.country_code, imps.c.locale)

    return ('year', date_window, 'tile_id', 'tile_title', 'country_code', 'locale',
            'impressions', 'clicks', 'pinned', 'blocked', 'sponsored', 'sponsored_link'), \
        connection.execute(stmt)


def _newtab_query(connection, start_date, date_window, country_code):
    dt = datetime.strptime(start_date, "%Y-%m-%d")
    year = dt.year
    if date_window == 'month':
        window_param = dt.month
    elif date_window == 'date':
        window_param = dt
    else:
        window_param = dt.isocalendar()[1]

    imps = newtab_stats_daily
    window_func_table = imps.c.get(date_window)

    # the where clause is an ANDed list of country, monthly|weekly, and year conditions
    where_elements = [imps.c.year >= year, window_func_table >= window_param]
    if country_code is not None:
        where_elements.append(imps.c.country_code == country_code)

    where_clause = and_(*where_elements)

    stmt = select(
        [
            imps.c.year,
            window_func_table,
            imps.c.country_code,
            imps.c.locale,
            func.sum(imps.c.newtabs),
        ]) \
        .where(where_clause) \
        .group_by(imps.c.year, window_func_table, imps.c.country_code, imps.c.locale) \
        .order_by(imps.c.year, window_func_table, imps.c.country_code, imps.c.locale)

    return ('year', date_window, 'country_code', 'locale', 'newtabs'), \
        connection.execute(stmt)


def _tile_summary_query(connection, start_date, date_window, country_code):
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

    # the where clause is an ANDed list of country, monthly|weekly, and year conditions
    where_elements = [imps.c.year >= year, window_func_table >= window_param, imps.c.tile_id == Tile.id]
    if country_code is not None:
        where_elements.append(imps.c.country_code == country_code)

    where_clause = and_(*where_elements)

    stmt = select(
        [
            imps.c.year,
            window_func_table,
            imps.c.tile_id,
            Tile.title,
            func.sum(imps.c.impressions),
            func.sum(imps.c.clicks),
            func.sum(imps.c.pinned),
            func.sum(imps.c.blocked),
            func.sum(imps.c.sponsored),
            func.sum(imps.c.sponsored_link),
        ]) \
        .where(where_clause) \
        .group_by(imps.c.year, window_func_table, imps.c.tile_id, Tile.title) \
        .order_by(imps.c.year, window_func_table, imps.c.tile_id)

    print "sql", str(stmt)
    return ('year', date_window, 'tile_id', 'tile_title',
            'impressions', 'clicks', 'pinned', 'blocked', 'sponsored', 'sponsored_link'), \
        connection.execute(stmt)


def _slot_summary_query(connection, start_date, date_window, country_code):
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

    # the where clause is an ANDed list of country, monthly|weekly, and year conditions
    where_elements = [imps.c.year >= year, window_func_table >= window_param]
    if country_code is not None:
        where_elements.append(imps.c.country_code == country_code)

    where_clause = and_(*where_elements)

    stmt = select(
        [
            imps.c.year,
            window_func_table,
            imps.c.position,
            func.sum(imps.c.impressions),
            func.sum(imps.c.clicks),
            func.sum(imps.c.pinned),
            func.sum(imps.c.blocked),
            func.sum(imps.c.sponsored),
            func.sum(imps.c.sponsored_link),
        ]) \
        .where(where_clause) \
        .group_by(imps.c.year, window_func_table, imps.c.position) \
        .order_by(imps.c.year, window_func_table, imps.c.position)
    return ('year', date_window, 'position',
            'impressions', 'clicks', 'pinned', 'blocked', 'sponsored', 'sponsored_link'), \
        connection.execute(stmt)


def tile_stats(connection, start_date, period='week', tile_id=None, country_code=None):
    """period = 'week' | 'month' | 'date'"""
    return _tile_query(connection, start_date, period, tile_id, country_code)


def tile_summary(connection, start_date, period='week', country_code=None):
    return _tile_summary_query(connection, start_date, period, country_code)


def newtab_stats(connection, start_date, period='week', country_code=None):
    """period = 'week' | 'month' | 'date'"""
    return _newtab_query(connection, start_date, period, country_code)


def slot_stats(connection, start_date, period='week', position=None, country_code=None):
    return _slot_query(connection, start_date, period, position, country_code)


def slot_summary(connection, start_date, period='week', country_code=None):
    return _slot_summary_query(connection, start_date, period, country_code)


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
