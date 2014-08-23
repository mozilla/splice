from datetime import datetime
import sqlalchemy
from sqlalchemy.types import *
from sqlalchemy.ext.declarative import declarative_base
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.sql.functions import current_date
from sqlalchemy.dialects.postgresql import ARRAY
from splice.environment import Environment

db = Environment.instance().db

class Country(db.Model):
    __tablename__ = "countries"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [0,1]})
    code = db.Column(db.String(5), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False, unique=True)

class Locale(db.Model):
    __tablename__ = "locales"
    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [0,1]})
    name = db.Column(db.String(14), unique=True)

class Company(db.Model):
    __tablename__ = "companies"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [0,1]})
    name = db.Column(db.String(255), unique=True)
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

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [0,1]})
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

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [0,1]})

    tile_id = db.Column(db.Integer(), db.ForeignKey("tiles.id"))
    list_id = db.Column(db.Integer(), db.ForeignKey("lists.id"))
    order_index = db.Column(db.Integer(), nullable=False, index=True)

class List(db.Model):
    __tablename__ = "lists"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [0,1]})
    name = db.Column(db.String(255), nullable=False)

    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)

class Tile(db.Model):
    __tablename__ = "tiles"

    TYPES = ["organic", "sponsored", "affiliate"]

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [0,1]})
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

class UniqueCountsDaily(db.Model):
    __tablename__ = "unique_counts_daily"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [0,1]})
    tile_id = db.Column(db.Integer(), db.ForeignKey("tiles.id"))

    date = db.Column(db.Date(), nullable=False, default=current_date, index=True)
    impression = db.Column(db.Boolean(), nullable=False, default=True)
    locale = db.Column(db.String(5), nullable=False, default="en-US", index=True)
    country_code = db.Column(db.String(2), nullable=False, default="US", index=True)

class UniqueHLL(db.Model):
    __tablename__ = "unique_hlls"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [0,1]})
    unique_counts_daily_id = db.Column(db.Integer(), db.ForeignKey("unique_counts_daily.id"))

    index = db.Column(db.SmallInteger(), nullable=False, index=True)
    value = db.Column(db.SmallInteger(), nullable=False, index=True)

impression_stats_daily = db.Table('impression_stats_daily',
        db.Column('tile_id', db.Integer, db.ForeignKey('tiles.id'), nullable = False),
        db.Column('date', db.Date, index = True, nullable = False),
        db.Column('impressions', db.Integer, nullable = False, server_default = "0"),
        db.Column('clicks', db.Integer, nullable = False, server_default = "0"),
        db.Column('pinned', db.Integer, nullable = False, server_default = "0"),
        db.Column('blocked', db.Integer, nullable = False, server_default = "0"),
        db.Column('sponsored_link', db.Integer, nullable = False, server_default = "0"),
        db.Column('sponsored', db.Integer, nullable = False, server_default = "0"),
        db.Column('position', db.Integer, nullable = False, server_default = "0"),
        db.Column('locale', db.String(5), index = True, nullable = False),
        db.Column('country_code', db.String(2), index = True, nullable = False),
        db.Column('os', db.String(64), index = True, nullable = False),
        db.Column('browser', db.String(64), index = True, nullable = False),
        db.Column('version', db.String(64), index = True, nullable = False),
        db.Column('device', db.String(64), index = True, nullable = False),
)
