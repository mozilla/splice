from datetime import datetime
from sqlalchemy import text
from splice.environment import Environment

db = Environment.instance().db
db_stats = Environment.instance().db_stats
metadata = db.metadata
metadata_stats = db_stats.metadata


class Channel(db.Model):
    __tablename__ = "channels"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [1, 1]})
    name = db.Column(db.String(32), nullable=False, unique=True)
    created_at = db.Column(db.DateTime(), default=datetime.utcnow)


class Distribution(db.Model):
    __tablename__ = "distributions"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [1, 1]})
    url = db.Column(db.Text(), nullable=False)
    channel_id = db.Column(db.Integer(), db.ForeignKey('channels.id'), nullable=False)
    deployed = db.Column(db.Boolean(), default=False)
    scheduled_start_date = db.Column(db.DateTime(), nullable=True)
    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)


class Tile(db.Model):
    __tablename__ = "tiles"

    TYPES = {"organic", "sponsored", "affiliate"}

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [1, 1]})
    target_url = db.Column(db.Text(), nullable=False)
    bg_color = db.Column(db.String(16), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(40), nullable=False)
    locale = db.Column(db.String(14), nullable=False)
    adgroup_id = db.Column(db.Integer(), db.ForeignKey("adgroups.id"))

    image_uri = db.Column(db.Text(), nullable=False)
    enhanced_image_uri = db.Column(db.Text(), nullable=True)

    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)


class Adgroup(db.Model):
    __tablename__ = "adgroups"

    TYPE = {"directory", "suggested"}

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [1, 1]})
    locale = db.Column(db.String(14), nullable=False)
    type = db.Column(db.String(16))

    # we have both the string and datetime objects to allow for optional timezones on the client
    # the datetime objects are always UTC
    start_date = db.Column(db.String(30), nullable=True)
    end_date = db.Column(db.String(30), nullable=True)
    start_date_dt = db.Column(db.DateTime(timezone=False), nullable=True)
    end_date_dt = db.Column(db.DateTime(timezone=False), nullable=True)

    frequency_cap_daily = db.Column(db.Integer())
    frequency_cap_total = db.Column(db.Integer())
    name = db.Column(db.String(255))
    explanation = db.Column(db.String(255))
    check_inadjacency = db.Column(db.Boolean(), nullable=False, server_default=text('false'))
    channel_id = db.Column(db.Integer(), db.ForeignKey("channels.id"))
    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)
    tiles = db.relationship("Tile", backref="adgroup")


class AdgroupSite(db.Model):
    __tablename__ = "adgroup_sites"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [1, 1]})
    adgroup_id = db.Column(db.Integer(), db.ForeignKey("adgroups.id"))
    active = db.Column(db.Boolean(), default=True)
    site = db.Column(db.String(1024), nullable=False)
    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)


class Account(db.Model):
    __tablename__ = "accounts"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [1, 1]})
    name = db.Column(db.String(255), nullable=False, unique=True)
    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)
    # TODO (najiang@mozilla.com), support for multi-contacts?
    email = db.Column(db.String(64))
    phone = db.Column(db.String(32))
    campaigns = db.relationship('Campaign', backref='account')


class Campaign(db.Model):
    __tablename__ = "campaigns"

    STATUS = {"active", "inactive"}  # expect more options, e.g. "paused"
    TYPE = {"sponsored", "unsponsored"}

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [1, 1]})
    name = db.Column(db.String(255), nullable=False)
    country = db.Column(db.String(64))
    city = db.Column(db.String(64))
    region = db.Column(db.String(64))
    dma = db.Column(db.Integer)
    postal_code = db.Column(db.String(16))
    locale = db.Column(db.String(16))
    type = db.Column(db.String(16))
    # TODO (najiang@mozilla.com), missing budget, customize currency type here
    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)
    start_date = db.Column(db.String(30), nullable=True)
    end_date = db.Column(db.String(30), nullable=True)
    start_date_dt = db.Column(db.DateTime(timezone=False), nullable=True)
    end_date_dt = db.Column(db.DateTime(timezone=False), nullable=True)
    status = db.Column(db.String(16), nullable=False)
    channel_id = db.Column(db.Integer(), db.ForeignKey('channels.id'), nullable=False)
    account_id = db.Column(db.Integer(), db.ForeignKey("accounts.id"), nullable=False)


# Table definitions for the stats database (hosted in redshift)
# *NOTE* that it uses db_stats other than db, in order to
# support multiple databases migration.
# TODO (najiang@mozill.com), use two seperate models for each
# database to avoid this confusion

blacklisted_ips = db_stats.Table(
    'blacklisted_ips',
    db_stats.Column('ip', db_stats.String(64), nullable=False),
    db_stats.Column('date', db_stats.Date(), nullable=False),
    info={'bind_key': 'stats'}
)


impression_stats_daily = db_stats.Table(
    'impression_stats_daily',
    db_stats.Column('tile_id', db_stats.Integer),
    db_stats.Column('date', db_stats.Date, nullable=False),
    db_stats.Column('impressions', db_stats.Integer, nullable=False, server_default="0"),
    db_stats.Column('clicks', db_stats.Integer, nullable=False, server_default="0"),
    db_stats.Column('pinned', db_stats.Integer, nullable=False, server_default="0"),
    db_stats.Column('blocked', db_stats.Integer, nullable=False, server_default="0"),
    db_stats.Column('sponsored_link', db_stats.Integer, nullable=False, server_default="0"),
    db_stats.Column('sponsored', db_stats.Integer, nullable=False, server_default="0"),
    db_stats.Column('position', db_stats.Integer, nullable=False, server_default="0"),
    db_stats.Column('enhanced', db_stats.Boolean, nullable=False, server_default="false"),
    db_stats.Column('locale', db_stats.String(14), nullable=False),
    db_stats.Column('country_code', db_stats.String(5), nullable=False),
    db_stats.Column('os', db_stats.String(64), nullable=False),
    db_stats.Column('browser', db_stats.String(64), nullable=False),
    db_stats.Column('version', db_stats.String(64), nullable=False),
    db_stats.Column('device', db_stats.String(64), nullable=False),
    db_stats.Column('month', db_stats.Integer, nullable=False),
    db_stats.Column('week', db_stats.Integer, nullable=False),
    db_stats.Column('year', db_stats.Integer, nullable=False),
    db_stats.Column('blacklisted', db_stats.Boolean, nullable=False, server_default="false"),
    info={'bind_key': 'stats'}
)


application_stats_daily = db_stats.Table(
    'application_stats_daily',
    db_stats.Column('date', db_stats.Date, nullable=False),
    db_stats.Column('month', db_stats.Integer, nullable=False),
    db_stats.Column('week', db_stats.Integer, nullable=False),
    db_stats.Column('year', db_stats.Integer, nullable=False),
    db_stats.Column('locale', db_stats.String(14), nullable=False),
    db_stats.Column('action', db_stats.String(255), nullable=False),
    db_stats.Column('country_code', db_stats.String(5), nullable=False),
    db_stats.Column('os', db_stats.String(64), nullable=False),
    db_stats.Column('browser', db_stats.String(64), nullable=False),
    db_stats.Column('version', db_stats.String(64), nullable=False),
    db_stats.Column('device', db_stats.String(64), nullable=False),
    db_stats.Column('ver', db_stats.String(16), nullable=False),
    db_stats.Column('count', db_stats.Integer, nullable=False),
    info={'bind_key': 'stats'}
)


site_stats_daily = db_stats.Table(
    'site_stats_daily',
    db_stats.Column('date', db_stats.Date, nullable=False),
    db_stats.Column('month', db_stats.Integer, nullable=False),
    db_stats.Column('week', db_stats.Integer, nullable=False),
    db_stats.Column('year', db_stats.Integer, nullable=False),
    db_stats.Column('locale', db_stats.String(14), nullable=False),
    db_stats.Column('url', db_stats.String(255), nullable=False),
    db_stats.Column('country_code', db_stats.String(5), nullable=False),
    db_stats.Column('os', db_stats.String(64), nullable=False),
    db_stats.Column('browser', db_stats.String(64), nullable=False),
    db_stats.Column('version', db_stats.String(64), nullable=False),
    db_stats.Column('device', db_stats.String(64), nullable=False),
    db_stats.Column('impressions', db_stats.Integer, nullable=False, server_default="0"),
    db_stats.Column('clicks', db_stats.Integer, nullable=False, server_default="0"),
    db_stats.Column('pinned', db_stats.Integer, nullable=False, server_default="0"),
    db_stats.Column('blocked', db_stats.Integer, nullable=False, server_default="0"),
    db_stats.Column('sponsored_link', db_stats.Integer, nullable=False, server_default="0"),
    db_stats.Column('sponsored', db_stats.Integer, nullable=False, server_default="0"),
    info={'bind_key': 'stats'}
)


newtab_stats_daily = db_stats.Table(
    'newtab_stats_daily',
    db_stats.Column('date', db_stats.Date, nullable=False),
    db_stats.Column('newtabs', db_stats.Integer, nullable=False, server_default="0"),
    db_stats.Column('month', db_stats.Integer, nullable=False),
    db_stats.Column('week', db_stats.Integer, nullable=False),
    db_stats.Column('year', db_stats.Integer, nullable=False),
    db_stats.Column('locale', db_stats.String(14), nullable=False),
    db_stats.Column('country_code', db_stats.String(5), nullable=False),
    db_stats.Column('os', db_stats.String(64), nullable=False),
    db_stats.Column('browser', db_stats.String(64), nullable=False),
    db_stats.Column('version', db_stats.String(64), nullable=False),
    db_stats.Column('device', db_stats.String(64), nullable=False),
    info={'bind_key': 'stats'}
)
