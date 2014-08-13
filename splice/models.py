from datetime import datetime
import sqlalchemy
from sqlalchemy.types import *
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.sql.functions import current_date
from sqlalchemy.dialects.postgresql import ARRAY
from splice.environment import Environment

db = Environment.instance().db

class Country(db.Model):
    __tablename__ = "countries"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True)
    code = db.Column(db.String(5), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False, unique=True)

class Locale(db.Model):
    __tablename__ = "locales"
    id = db.Column(db.Integer(), autoincrement=True, primary_key=True)
    name = db.Column(db.String(14), unique=True)

class Company(db.Model):
    __tablename__ = "companies"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True)
    name = db.Column(db.String(255))
    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)

    campaigns = db.relationship("Campaign")

class CampaignsLocales(db.Model):
    __tablename__ = "campaigns_locales"

    locale_id = db.Column(db.Integer(), db.ForeignKey("locales.id"), primary_key=True)
    campaign_id = db.Column(db.Integer(), db.ForeignKey("campaigns.id"), primary_key=True)

class CampaignsCountries(db.Model):
    __tablename__ = "campaigns_countries"

    country_id = db.Column(db.Integer(), db.ForeignKey("countries.id"), primary_key=True)
    campaign_id = db.Column(db.Integer(), db.ForeignKey("campaigns.id"), primary_key=True)

class Campaign(db.Model):
    __tablename__ = "campaigns"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True)
    company_id = db.Column(db.Integer(), db.ForeignKey("companies.id"))

    flight_date = db.Column(db.DateTime(), nullable=False, index=True)
    end_date = db.Column(db.DateTime(), nullable=True, index=True)
    impression_limit = db.Column(db.Integer(), nullable=False, default=-1)

    countries = db.relationship("Country", secondary="campaigns_countries",
                                backref=db.backref("campaigns", lazy="dynamic"))

    locales = db.relationship("Locale", secondary="campaigns_locales",
                                backref=db.backref("campaigns", lazy="dynamic"))

    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)

class TileList(db.Model):
    __tablename__ = "tiles_lists"

    tile_id = db.Column(db.Integer(), db.ForeignKey("tiles.id"), primary_key=True)
    list_id = db.Column(db.Integer(), db.ForeignKey("lists.id"), primary_key=True)
    order_index = db.Column(db.Integer(), nullable=False, index=True)

class List(db.Model):
    __tablename__ = "lists"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True)
    name = db.Column(db.String(255), nullable=False)

    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)

class Tile(db.Model):
    __tablename__ = "tiles"

    TYPES = ["organic", "sponsored", "affiliate"]

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True)
    campaign_id = db.Column(db.Integer(), db.ForeignKey("campaigns.id"))
    target_url = db.Column(db.String(255), nullable=False)
    bg_color = db.Column(db.String(16), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(40), nullable=False)

    image_uri = db.Column(db.Text(), nullable=False)
    enhanced_image_uri = db.Column(db.Text(), nullable=True)

    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)
    lists = db.relationship("List", secondary="tiles_lists",
                                backref=db.backref("tiles", lazy="dynamic"))

class ImpressionStatsDaily(db.Model):
    __tablename__ = "impression_stats_daily"

    tile_id = db.Column(db.Integer(), db.ForeignKey("tiles.id"), primary_key=True)
    day = db.Column(db.Date(), nullable=False, default=current_date, index=True, primary_key=True)

    impressions = db.Column(db.Integer(), nullable=False, default=0)
    clicks = db.Column(db.Integer(), nullable=False, default=0)
    pinned = db.Column(db.Integer(), nullable=False, default=0)
    blocked = db.Column(db.Integer(), nullable=False, default=0)

    position = db.Column(db.Integer(), nullable=False, default=-1, index=True)
    locale = db.Column(db.String(5), nullable=False, default="en-US", index=True)
    country_code = db.Column(db.String(2), nullable=False, default="US", index=True)
    os = db.Column(db.String(64), index=True)
    browser = db.Column(db.String(64), index=True)
    version = db.Column(db.String(64), index=True)
    device = db.Column(db.String(64), index=True)

class UniqueCountsDaily(db.Model):
    __tablename__ = "unique_counts_daily"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True)
    tile_id = db.Column(db.Integer(), db.ForeignKey("tiles.id"))

    day = db.Column(db.Date(), nullable=False, default=current_date, index=True)
    impression = db.Column(db.Boolean(), nullable=False, default=True)
    locale = db.Column(db.String(5), nullable=False, default="en-US", index=True)
    country_code = db.Column(db.String(2), nullable=False, default="US", index=True)

class UniqueHLL(db.Model):
    __tablename__ = "unique_hlls"

    unique_counts_daily_id = db.Column(db.Integer(), db.ForeignKey("unique_counts_daily.id"))

    index = db.Column(db.SmallInteger(), nullable=False, primary_key=True, index=True)
    value = db.Column(db.SmallInteger(), nullable=False, primary_key=True, index=True)
