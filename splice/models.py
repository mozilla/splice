from datetime import datetime
from sqlalchemy import text
from splice.environment import Environment

db = Environment.instance().db


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


blacklisted_ips = db.Table(
    'blacklisted_ips',
    db.Column('ip', db.String(64), nullable=False),
    db.Column('date', db.Date(), nullable=False),
    info={'bind_key': 'stats'}
)


impression_stats_daily = db.Table(
    'impression_stats_daily',
    db.Column('tile_id', db.Integer),
    db.Column('date', db.Date, nullable=False),
    db.Column('impressions', db.Integer, nullable=False, server_default="0"),
    db.Column('clicks', db.Integer, nullable=False, server_default="0"),
    db.Column('pinned', db.Integer, nullable=False, server_default="0"),
    db.Column('blocked', db.Integer, nullable=False, server_default="0"),
    db.Column('sponsored_link', db.Integer, nullable=False, server_default="0"),
    db.Column('sponsored', db.Integer, nullable=False, server_default="0"),
    db.Column('position', db.Integer, nullable=False, server_default="0"),
    db.Column('enhanced', db.Boolean, nullable=False, server_default="false"),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(64), nullable=False),
    db.Column('month', db.Integer, nullable=False),
    db.Column('week', db.Integer, nullable=False),
    db.Column('year', db.Integer, nullable=False),
    db.Column('blacklisted', db.Boolean, nullable=False, server_default="false"),
    info={'bind_key': 'stats'}
)


application_stats_daily = db.Table(
    'application_stats_daily',
    db.Column('date', db.Date, nullable=False),
    db.Column('month', db.Integer, nullable=False),
    db.Column('week', db.Integer, nullable=False),
    db.Column('year', db.Integer, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('action', db.String(255), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(64), nullable=False),
    db.Column('ver', db.String(16), nullable=False),
    db.Column('count', db.Integer, nullable=False),
    info={'bind_key': 'stats'}
)


site_stats_daily = db.Table(
    'site_stats_daily',
    db.Column('date', db.Date, nullable=False),
    db.Column('month', db.Integer, nullable=False),
    db.Column('week', db.Integer, nullable=False),
    db.Column('year', db.Integer, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('url', db.String(255), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(64), nullable=False),
    db.Column('impressions', db.Integer, nullable=False, server_default="0"),
    db.Column('clicks', db.Integer, nullable=False, server_default="0"),
    db.Column('pinned', db.Integer, nullable=False, server_default="0"),
    db.Column('blocked', db.Integer, nullable=False, server_default="0"),
    db.Column('sponsored_link', db.Integer, nullable=False, server_default="0"),
    db.Column('sponsored', db.Integer, nullable=False, server_default="0"),
    info={'bind_key': 'stats'}
)


newtab_stats_daily = db.Table(
    'newtab_stats_daily',
    db.Column('date', db.Date, nullable=False),
    db.Column('newtabs', db.Integer, nullable=False, server_default="0"),
    db.Column('month', db.Integer, nullable=False),
    db.Column('week', db.Integer, nullable=False),
    db.Column('year', db.Integer, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(64), nullable=False),
    info={'bind_key': 'stats'}
)
