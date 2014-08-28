BEGIN;

CREATE TABLE tiles (
    id INTEGER IDENTITY(0,0) NOT NULL, 
    target_url VARCHAR(255) NOT NULL, 
    bg_color VARCHAR(16) NOT NULL, 
    title VARCHAR(255) NOT NULL, 
    type VARCHAR(40) NOT NULL, 
    image_uri TEXT NOT NULL, 
    enhanced_image_uri TEXT, 
    locale VARCHAR(14) NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id)
);

CREATE INDEX ix_tiles_created_at ON tiles (created_at);

CREATE INDEX ix_tiles_locale ON tiles (locale);

CREATE TABLE impression_stats_daily (
    tile_id INTEGER, 
    date DATE NOT NULL, 
    impressions INTEGER DEFAULT '0' NOT NULL, 
    clicks INTEGER DEFAULT '0' NOT NULL, 
    pinned INTEGER DEFAULT '0' NOT NULL, 
    blocked INTEGER DEFAULT '0' NOT NULL, 
    sponsored_link INTEGER DEFAULT '0' NOT NULL, 
    sponsored INTEGER DEFAULT '0' NOT NULL, 
    position INTEGER DEFAULT '0' NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    os VARCHAR(64) NOT NULL, 
    browser VARCHAR(64) NOT NULL, 
    version VARCHAR(64) NOT NULL, 
    device VARCHAR(64) NOT NULL, 
    FOREIGN KEY(tile_id) REFERENCES tiles (id)
);

CREATE INDEX ix_impression_stats_daily_browser ON impression_stats_daily (browser);

CREATE INDEX ix_impression_stats_daily_country_code ON impression_stats_daily (country_code);

CREATE INDEX ix_impression_stats_daily_date ON impression_stats_daily (date);

CREATE INDEX ix_impression_stats_daily_device ON impression_stats_daily (device);

CREATE INDEX ix_impression_stats_daily_locale ON impression_stats_daily (locale);

CREATE INDEX ix_impression_stats_daily_os ON impression_stats_daily (os);

CREATE INDEX ix_impression_stats_daily_version ON impression_stats_daily (version);

CREATE TABLE unique_counts_daily (
    id INTEGER IDENTITY(0,0) NOT NULL, 
    tile_id INTEGER, 
    date DATE NOT NULL, 
    impression BOOLEAN NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(tile_id) REFERENCES tiles (id)
);

CREATE INDEX ix_unique_counts_daily_country_code ON unique_counts_daily (country_code);

CREATE INDEX ix_unique_counts_daily_date ON unique_counts_daily (date);

CREATE INDEX ix_unique_counts_daily_locale ON unique_counts_daily (locale);

CREATE TABLE unique_hlls (
    unique_counts_daily_id INTEGER, 
    index SMALLINT DEFAULT '0' NOT NULL, 
    value SMALLINT DEFAULT '0' NOT NULL, 
    FOREIGN KEY(unique_counts_daily_id) REFERENCES unique_counts_daily (id)
);

CREATE INDEX ix_unique_hlls_index ON unique_hlls (index);

CREATE INDEX ix_unique_hlls_value ON unique_hlls (value);

COMMIT;

