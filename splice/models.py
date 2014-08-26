from datetime import datetime
import sqlalchemy
from sqlalchemy.types import *
from sqlalchemy.ext.declarative import declarative_base
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.sql.functions import current_date
from sqlalchemy.dialects.postgresql import ARRAY
from splice.environment import Environment

db = Environment.instance().db

class Tile(db.Model):
    __tablename__ = "tiles"

    TYPES = {"organic", "sponsored", "affiliate"}

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [0,1]})
    target_url = db.Column(db.String(255), nullable=False)
    bg_color = db.Column(db.String(16), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(40), nullable=False)

    image_uri = db.Column(db.Text(), nullable=False)
    enhanced_image_uri = db.Column(db.Text(), nullable=True)

    locale = db.Column(db.String(14), nullable=False, index=True)
    country_code = db.Column(db.String(5), nullable=False, index=True)

    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)

class UniqueCountsDaily(db.Model):
    __tablename__ = "unique_counts_daily"

    id = db.Column(db.Integer(), autoincrement=True, primary_key=True, info={"identity": [0,1]})
    tile_id = db.Column(db.Integer(), db.ForeignKey("tiles.id"))

    date = db.Column(db.Date(), nullable=False, default=current_date, index=True)
    impression = db.Column(db.Boolean(), nullable=False, default=True)
    locale = db.Column(db.String(14), nullable=False, default="en-US", index=True)
    country_code = db.Column(db.String(5), nullable=False, default="US", index=True)

unique_hlls = db.Table('unique_hlls',
    db.Column('unique_counts_daily_id', db.Integer, db.ForeignKey('unique_counts_daily.id')),
    db.Column('index', db.SmallInteger, nullable = False, server_default = "0", index=True),
    db.Column('value', db.SmallInteger, nullable = False, server_default = "0", index=True),
)

impression_stats_daily = db.Table('impression_stats_daily',
        db.Column('tile_id', db.Integer, db.ForeignKey('tiles.id')),
        db.Column('date', db.Date, index = True, nullable = False),
        db.Column('impressions', db.Integer, nullable = False, server_default = "0"),
        db.Column('clicks', db.Integer, nullable = False, server_default = "0"),
        db.Column('pinned', db.Integer, nullable = False, server_default = "0"),
        db.Column('blocked', db.Integer, nullable = False, server_default = "0"),
        db.Column('sponsored_link', db.Integer, nullable = False, server_default = "0"),
        db.Column('sponsored', db.Integer, nullable = False, server_default = "0"),
        db.Column('position', db.Integer, nullable = False, server_default = "0"),
        db.Column('locale', db.String(14), index = True, nullable = False),
        db.Column('country_code', db.String(5), index = True, nullable = False),
        db.Column('os', db.String(64), index = True, nullable = False),
        db.Column('browser', db.String(64), index = True, nullable = False),
        db.Column('version', db.String(64), index = True, nullable = False),
        db.Column('device', db.String(64), index = True, nullable = False),
)
