import pytz
from splice.environment import Environment
from sqlalchemy.dialects.postgresql import DOUBLE_PRECISION


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


ping_centre_main = db.Table(
    'ping_centre_main',
    db.Column('client_id', db.String(64), nullable=False),
    db.Column('shield_id', db.String(256), nullable=False),
    db.Column('release_channel', db.String(32), nullable=False),
    db.Column('event', db.String(64), nullable=False),
    db.Column('value', db.String(256), nullable=False),
    db.Column('receive_at', db.DateTime, nullable=False),
    db.Column('date', db.Date, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(14), nullable=False),
    db.Column('profile_creation_date', db.Integer),
    info={'bind_key': 'stats'}
)

activity_stream_mobile_stats_daily = db.Table(
    'activity_stream_mobile_stats_daily',
    db.Column('client_id', db.String(64), nullable=False),
    db.Column('build', db.String(64), nullable=False),
    db.Column('app_version', db.String(64), nullable=False),
    db.Column('session_duration', db.Integer, nullable=False),
    db.Column('release_channel', db.String(32)),
    db.Column('receive_at', db.DateTime, nullable=False),
    db.Column('date', db.Date, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(14), nullable=False),
    info={'bind_key': 'stats'}
)

activity_stream_mobile_events_daily = db.Table(
    'activity_stream_mobile_events_daily',
    db.Column('client_id', db.String(64), nullable=False),
    db.Column('build', db.String(64), nullable=False),
    db.Column('app_version', db.String(64), nullable=False),
    db.Column('page', db.String(64), nullable=False),
    db.Column('action_position', db.String(16)),
    db.Column('source', db.String(64)),
    db.Column('release_channel', db.String(32)),
    db.Column('event', db.String(64), nullable=False),
    db.Column('receive_at', db.DateTime, nullable=False),
    db.Column('date', db.Date, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(14), nullable=False),
    info={'bind_key': 'stats'}
)

firefox_onboarding_sessions_daily = db.Table(
    'firefox_onboarding_sessions_daily',
    db.Column('client_id', db.String(64), nullable=False),
    db.Column('addon_version', db.String(64), nullable=False),
    db.Column('session_begin', db.BigInteger, nullable=False),
    db.Column('session_end', db.BigInteger, nullable=False),
    db.Column('session_id', db.String(64), nullable=False),
    db.Column('impression', db.Integer, nullable=False),
    db.Column('page', db.String(64), nullable=False),
    db.Column('event', db.String(64), nullable=False),
    db.Column('category', db.String(64), nullable=False),
    db.Column('tour_source', db.String(64), nullable=False),
    db.Column('receive_at', db.DateTime, nullable=False),
    db.Column('date', db.Date, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(14), nullable=False),
    db.Column('tour_type', db.String(64)),
    info={'bind_key': 'stats'}
)

firefox_onboarding_events_daily = db.Table(
    'firefox_onboarding_events_daily',
    db.Column('client_id', db.String(64), nullable=False),
    db.Column('addon_version', db.String(64), nullable=False),
    db.Column('session_id', db.String(64), nullable=False),
    db.Column('page', db.String(64), nullable=False),
    db.Column('event', db.String(64), nullable=False),
    db.Column('tour_id', db.String(64)),
    db.Column('impression', db.Integer, nullable=False),
    db.Column('category', db.String(64), nullable=False),
    db.Column('receive_at', db.DateTime, nullable=False),
    db.Column('date', db.Date, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(14), nullable=False),
    db.Column('tour_type', db.String(64)),
    db.Column('timestamp', db.BigInteger),
    db.Column('tour_source', db.String(64)),
    db.Column('bubble_state', db.String(64)),
    db.Column('notification_state', db.String(64)),
    info={'bind_key': 'stats'}
)

firefox_onboarding_sessions2_daily = db.Table(
    'firefox_onboarding_sessions2_daily',
    db.Column('client_id', db.String(64), nullable=False),
    db.Column('addon_version', db.String(64), nullable=False),
    db.Column('category', db.String(64), nullable=False),
    db.Column('page', db.String(64), nullable=False),
    db.Column('parent_session_id', db.String(64), nullable=False),
    db.Column('root_session_id', db.String(64), nullable=False),
    db.Column('session_begin', db.BigInteger, nullable=False),
    db.Column('session_end', db.BigInteger, nullable=False),
    db.Column('session_id', db.String(64), nullable=False),
    db.Column('tour_type', db.String(64), nullable=False),
    db.Column('type', db.String(64), nullable=False),
    db.Column('release_channel', db.String(16), nullable=False),
    db.Column('receive_at', db.DateTime, nullable=False),
    db.Column('date', db.Date, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(14), nullable=False),
    info={'bind_key': 'stats'}
)

firefox_onboarding_events2_daily = db.Table(
    'firefox_onboarding_events2_daily',
    db.Column('client_id', db.String(64), nullable=False),
    db.Column('addon_version', db.String(64), nullable=False),
    db.Column('bubble_state', db.String(16), nullable=False),
    db.Column('category', db.String(64), nullable=False),
    db.Column('current_tour_id', db.String(64), nullable=False),
    db.Column('logo_state', db.String(16), nullable=False),
    db.Column('notification_impression', db.Integer, nullable=False),
    db.Column('notification_state', db.String(16), nullable=False),
    db.Column('page', db.String(64), nullable=False),
    db.Column('parent_session_id', db.String(64), nullable=False),
    db.Column('root_session_id', db.String(64), nullable=False),
    db.Column('target_tour_id', db.String(64), nullable=False),
    db.Column('timestamp', db.BigInteger, nullable=False),
    db.Column('tour_type', db.String(16), nullable=False),
    db.Column('type', db.String(64), nullable=False),
    db.Column('width', db.Integer, nullable=False),
    db.Column('release_channel', db.String(16), nullable=False),
    db.Column('receive_at', db.DateTime, nullable=False),
    db.Column('date', db.Date, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(14), nullable=False),
    info={'bind_key': 'stats'}
)


assa_sessions_daily = db.Table(
    'assa_sessions_daily',
    db.Column('client_id', db.String(64), nullable=False),
    db.Column('addon_version', db.String(64), nullable=False),
    db.Column('page', db.String(64), nullable=False),
    db.Column('session_duration', db.Integer, nullable=False),
    db.Column('session_id', db.String(64), nullable=False),
    db.Column('load_trigger_type', db.String(64)),
    db.Column('load_trigger_ts', DOUBLE_PRECISION),
    db.Column('visibility_event_rcvd_ts', DOUBLE_PRECISION),
    db.Column('topsites_first_painted_ts', DOUBLE_PRECISION),
    db.Column('is_preloaded', db.Boolean),
    db.Column('is_prerendered', db.Boolean),
    db.Column('topsites_data_late_by_ms', db.Integer),
    db.Column('highlights_data_late_by_ms', db.Integer),
    db.Column('screenshot_with_icon', db.Integer),
    db.Column('screenshot', db.Integer),
    db.Column('tippytop', db.Integer),
    db.Column('rich_icon', db.Integer),
    db.Column('no_image', db.Integer),
    db.Column('custom_screenshot', db.Integer),
    db.Column('topsites_pinned', db.Integer),
    db.Column('topsites_search_shortcuts', db.Integer),
    db.Column('profile_creation_date', db.Integer),
    db.Column('client_region', db.String(5)),
    db.Column('receive_at', db.DateTime, nullable=False),
    db.Column('user_prefs', db.Integer),
    db.Column('release_channel', db.String(16)),
    db.Column('shield_id', db.String(256)),
    db.Column('date', db.Date, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(64), nullable=False),
    info={'bind_key': 'stats'}
)


assa_events_daily = db.Table(
    'assa_events_daily',
    db.Column('client_id', db.String(64), nullable=False),
    db.Column('addon_version', db.String(64), nullable=False),
    db.Column('source', db.String(64), nullable=False),
    db.Column('session_id', db.String(64), nullable=False),
    db.Column('page', db.String(64), nullable=False),
    db.Column('action_position', db.String(16), nullable=False),
    db.Column('event', db.String(64), nullable=False),
    db.Column('receive_at', db.DateTime, nullable=False),
    db.Column('user_prefs', db.Integer),
    db.Column('value', db.String(256)),
    db.Column('release_channel', db.String(16)),
    db.Column('shield_id', db.String(256)),
    db.Column('date', db.Date, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(64), nullable=False),
    db.Column('profile_creation_date', db.Integer),
    info={'bind_key': 'stats'}
)


assa_performance_daily = db.Table(
    'assa_performance_daily',
    db.Column('client_id', db.String(64), nullable=False),
    db.Column('addon_version', db.String(64), nullable=False),
    db.Column('source', db.String(64), nullable=False),
    db.Column('session_id', db.String(64)),
    db.Column('page', db.String(64), nullable=False),
    db.Column('event', db.String(64), nullable=False),
    db.Column('event_id', db.String(64), nullable=False),
    db.Column('value', db.Integer, nullable=False),
    db.Column('receive_at', db.DateTime, nullable=False),
    db.Column('user_prefs', db.Integer),
    db.Column('release_channel', db.String(16)),
    db.Column('shield_id', db.String(256)),
    db.Column('date', db.Date, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(64), nullable=False),
    info={'bind_key': 'stats'}
)


assa_masga_daily = db.Table(
    'assa_masga_daily',
    db.Column('client_id', db.String(64), nullable=False),
    db.Column('addon_version', db.String(64), nullable=False),
    db.Column('source', db.String(64), nullable=False),
    db.Column('session_id', db.String(64)),
    db.Column('page', db.String(64), nullable=False),
    db.Column('event', db.String(64), nullable=False),
    db.Column('value', db.Integer, nullable=False),
    db.Column('receive_at', db.DateTime, nullable=False),
    db.Column('user_prefs', db.Integer),
    db.Column('release_channel', db.String(16)),
    db.Column('shield_id', db.String(256)),
    db.Column('date', db.Date, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(64), nullable=False),
    info={'bind_key': 'stats'}
)


assa_impression_stats_daily = db.Table(
    'assa_impression_stats_daily',
    db.Column('client_id', db.String(64), nullable=False),
    db.Column('tile_id', db.Integer, nullable=False),
    db.Column('addon_version', db.String(64), nullable=False),
    db.Column('date', db.Date, nullable=False),
    db.Column('hour', db.Integer),
    db.Column('minute', db.Integer),
    db.Column('impressions', db.Integer, nullable=False, server_default="0"),
    db.Column('clicks', db.Integer, nullable=False, server_default="0"),
    db.Column('pinned', db.Integer, nullable=False, server_default="0"),
    db.Column('blocked', db.Integer, nullable=False, server_default="0"),
    db.Column('pocketed', db.Integer, nullable=False, server_default="0"),
    db.Column('position', db.Integer, nullable=False, server_default="0"),
    db.Column('page', db.String(64), nullable=False),
    db.Column('source', db.String(64), nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('client_region', db.String(5)),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(64), nullable=False),
    db.Column('blacklisted', db.Boolean, nullable=False, server_default="false"),
    db.Column('user_prefs', db.Integer),
    db.Column('release_channel', db.String(16)),
    db.Column('shield_id', db.String(256)),
    info={'bind_key': 'stats'}
)


assa_router_events_daily = db.Table(
    'assa_router_events_daily',
    db.Column('impression_id', db.String(64), nullable=False),
    db.Column('addon_version', db.String(64), nullable=False),
    db.Column('source', db.String(64), nullable=False),
    db.Column('event', db.String(64), nullable=False),
    db.Column('value', db.String(256)),
    db.Column('message_id', db.String(128), nullable=False),
    db.Column('receive_at', db.DateTime, nullable=False),
    db.Column('release_channel', db.String(16)),
    db.Column('shield_id', db.String(256)),
    db.Column('date', db.Date, nullable=False),
    db.Column('locale', db.String(14), nullable=False),
    db.Column('country_code', db.String(5), nullable=False),
    db.Column('os', db.String(64), nullable=False),
    db.Column('browser', db.String(64), nullable=False),
    db.Column('version', db.String(64), nullable=False),
    db.Column('device', db.String(64), nullable=False),
    info={'bind_key': 'stats'}
)


watchdog_proxy_events_daily = db.Table(
    'watchdog_proxy_events_daily',
    db.Column('receive_at', db.DateTime, nullable=False),
    db.Column('date', db.Date, nullable=False),
    db.Column('event', db.String(64), nullable=False),
    db.Column('consumer_name', db.String(128)),
    db.Column('watchdog_id', db.String(128)),
    db.Column('type', db.String(64)),
    db.Column('poller_id', db.String(128)),
    db.Column('items_in_queue', db.Integer),
    db.Column('items_in_progress', db.Integer),
    db.Column('items_in_waiting', db.Integer),
    db.Column('photodna_tracking_id', db.String(128)),
    db.Column('worker_id', db.String(128)),
    db.Column('is_match', db.Boolean),
    db.Column('is_error', db.Boolean),
    db.Column('timing_sent', db.Integer),
    db.Column('timing_received', db.Integer),
    db.Column('timing_submitted', db.Integer),
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
