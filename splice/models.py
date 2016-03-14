import pytz
from splice.environment import Environment


db = Environment.instance().db
metadata = db.metadata


class Content(db.Model):
    __tablename__ = "contents"

    id = db.Column('id', db.Integer(), autoincrement=True, primary_key=True, info={"identity": [1, 1]})
    name = db.Column('name', db.String(length=255), nullable=False, unique=True)
    version = db.Column('version', db.Integer(), nullable=False)
    created_at = db.Column('created_at', db.DateTime(), server_default=db.func.now(), nullable=False)
    versions = db.relationship("Version", backref="content")


class Version(db.Model):
    __tablename__ = "versions"

    content_id = db.Column('content_id', db.Integer(), db.ForeignKey("contents.id"), primary_key=True)
    version = db.Column('version', db.Integer(), nullable=False, primary_key=True)
    signing_key = db.Column('signing_key', db.Text(), nullable=True)
    original_url = db.Column('original_url', db.Text(), nullable=False)
    original_hash = db.Column('original_hash', db.Text(), nullable=False)
    last_updated = db.Column('last_updated', db.DateTime(), server_default=db.func.now(), nullable=False)
    created_at = db.Column('created_at', db.DateTime(), server_default=db.func.now(), nullable=False)


class Account(db.Model):
    __tablename__ = "accounts"

    id = db.Column('id', db.Integer(), autoincrement=True, primary_key=True, info={"identity": [1, 1]})
    name = db.Column('name', db.String(length=255), nullable=False, unique=True)
    contact_name = db.Column('contact_name', db.String(length=255), nullable=True)
    contact_email = db.Column('contact_email', db.String(length=255), nullable=True)
    contact_phone = db.Column('contact_phone', db.String(length=255), nullable=True)
    created_at = db.Column('created_at', db.DateTime(), server_default=db.func.now(), nullable=False)
    campaigns = db.relationship("Campaign", backref="account")


class UTCAwareDateTime(db.TypeDecorator):
    '''UTC aware datetime, not naive ones.'''
    impl = db.DateTime

    def process_result_value(self, value, dialect):
        return value.replace(tzinfo=pytz.utc)


class Campaign(db.Model):
    __tablename__ = "campaigns"

    id = db.Column('id', db.Integer(), autoincrement=True, primary_key=True, info={"identity": [1, 1]})
    start_date = db.Column('start_date', UTCAwareDateTime(timezone=True), nullable=True)
    end_date = db.Column('end_date', UTCAwareDateTime(timezone=True), nullable=True)
    name = db.Column('name', db.String(length=255), nullable=False)
    paused = db.Column('paused', db.Boolean(), nullable=False, default=False)
    channel_id = db.Column('channel_id', db.Integer(), db.ForeignKey("channels.id"))
    account_id = db.Column('account_id', db.Integer(), db.ForeignKey("accounts.id"))
    created_at = db.Column('created_at', db.DateTime(), server_default=db.func.now(), nullable=False)
    __table_args__ = (db.UniqueConstraint('account_id', 'name', name="UQ_CAMPAIGN_ACCOUNT_ID_NAME"),)
    adgroups = db.relationship("Adgroup", backref="campaign")
    countries = db.relationship("CampaignCountry")


class Country(db.Model):
    __tablename__ = "countries"

    country_code = db.Column('country_code', db.String(length=255), primary_key=True)
    country_name = db.Column('country_name', db.String(length=255), nullable=True)


class CampaignCountry(db.Model):
    __tablename__ = "campaign_countries"

    country_code = db.Column('country_code', db.String(length=5), db.ForeignKey("countries.country_code"), primary_key=True)
    campaign_id = db.Column('campaign_id', db.Integer(), db.ForeignKey("campaigns.id"), primary_key=True)


class Channel(db.Model):
    __tablename__ = "channels"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [1, 1]})
    name = db.Column(db.String(32), nullable=False, unique=True)
    created_at = db.Column(db.DateTime(), server_default=db.func.now())
    adgroups = db.relationship("Adgroup", backref="channel")


class Distribution(db.Model):
    __tablename__ = "distributions"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [1, 1]})
    url = db.Column(db.Text(), nullable=False)
    channel_id = db.Column(db.Integer(), db.ForeignKey('channels.id'), nullable=False)
    deployed = db.Column(db.Boolean(), default=False)
    scheduled_start_date = db.Column(db.DateTime(), nullable=True)
    created_at = db.Column(db.DateTime(), nullable=False, server_default=db.func.now())


class Tile(db.Model):
    __tablename__ = "tiles"

    TYPES = {"organic", "sponsored", "affiliate"}
    STATUS = {"approved", "unapproved", "disapproved"}
    POSITION_PRIORITY = {"low": 0, "medium": 1, "high": 2}

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [1, 1]})
    target_url = db.Column(db.Text(), nullable=False)
    bg_color = db.Column(db.String(16), nullable=False)
    title_bg_color = db.Column(db.String(16), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(40), nullable=False)
    paused = db.Column('paused', db.Boolean(), nullable=False, default=False)
    adgroup_id = db.Column(db.Integer(), db.ForeignKey("adgroups.id"))

    image_uri = db.Column(db.Text(), nullable=False)
    enhanced_image_uri = db.Column(db.Text(), nullable=True)
    status = db.Column(db.String(16), nullable=False, server_default=u'unapproved')
    position_priority = db.Column(db.String(16), server_default=u'medium', nullable=False)

    created_at = db.Column(db.DateTime(), nullable=False, server_default=db.func.now())


class Adgroup(db.Model):
    __tablename__ = "adgroups"

    TYPE = {"directory", "suggested"}

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [1, 1]})
    locale = db.Column(db.String(14), nullable=False)

    type = db.Column(db.String(16))
    paused = db.Column('paused', db.Boolean(), nullable=False, default=False)
    frequency_cap_daily = db.Column(db.Integer())
    frequency_cap_total = db.Column(db.Integer())
    name = db.Column(db.String(255))
    explanation = db.Column(db.String(255))
    check_inadjacency = db.Column(db.Boolean(), nullable=False, default=False)
    # TODO(najiang@mozilla.com): channel_id is deprecated, leave it here only for backwards compatibility
    channel_id = db.Column(db.Integer(), db.ForeignKey("channels.id"))
    campaign_id = db.Column(db.Integer(), db.ForeignKey("campaigns.id"))
    created_at = db.Column(db.DateTime(), nullable=False, server_default=db.func.now())
    tiles = db.relationship("Tile", backref="adgroup")
    categories = db.relationship("AdgroupCategory")


class AdgroupSite(db.Model):
    __tablename__ = "adgroup_sites"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [1, 1]})
    adgroup_id = db.Column(db.Integer(), db.ForeignKey("adgroups.id"))
    active = db.Column(db.Boolean(), default=True)
    site = db.Column(db.String(1024), nullable=False)
    created_at = db.Column(db.DateTime(), nullable=False, server_default=db.func.now())


class AdgroupCategory(db.Model):
    __tablename__ = "adgroup_categories"

    adgroup_id = db.Column(db.Integer(), db.ForeignKey("adgroups.id"), primary_key=True)
    category = db.Column(db.String(255), primary_key=True)


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


activity_stream_stats_daily = db.Table(
    'activity_stream_stats_daily',
    db.Column('client_id', db.String(64), nullable=False),
    db.Column('tab_id', db.String(64), nullable=False),
    db.Column('addon_version', db.String(16), nullable=False),
    db.Column('load_reason', db.String(64), nullable=False),
    db.Column('source', db.String(64), nullable=False),
    db.Column('unload_reason', db.String(64), nullable=False),
    db.Column('max_scroll_depth', db.Integer, nullable=False),
    db.Column('load_latency', db.Integer, nullable=False),
    db.Column('click_position', db.String(16), nullable=False),
    db.Column('total_bookmarks', db.Integer, nullable=False),
    db.Column('total_history_size', db.Integer, nullable=False),
    db.Column('session_duration', db.Integer, nullable=False),
    db.Column('receive_at', db.DateTime, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(64), nullable=False),
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
