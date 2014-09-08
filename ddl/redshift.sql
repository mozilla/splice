BEGIN;

CREATE TABLE tiles (
    id INTEGER IDENTITY(1,1) NOT NULL,
    target_url TEXT NOT NULL,
    bg_color VARCHAR(16) NOT NULL, 
    title VARCHAR(255) NOT NULL, 
    type VARCHAR(40) NOT NULL, 
    image_uri TEXT NOT NULL, 
    enhanced_image_uri TEXT, 
    locale VARCHAR(14) NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id)
);

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
    enhanced BOOLEAN DEFAULT FALSE NOT NULL,
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    os VARCHAR(64) NOT NULL, 
    browser VARCHAR(64) NOT NULL, 
    version VARCHAR(64) NOT NULL, 
    device VARCHAR(64) NOT NULL, 
    FOREIGN KEY(tile_id) REFERENCES tiles (id)
);

CREATE TABLE unique_counts_daily (
    id INTEGER IDENTITY(1,1) NOT NULL,
    tile_id INTEGER, 
    date DATE NOT NULL, 
    impression BOOLEAN NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(tile_id) REFERENCES tiles (id)
);

CREATE TABLE unique_hlls (
    unique_counts_daily_id INTEGER, 
    index SMALLINT DEFAULT '0' NOT NULL, 
    value SMALLINT DEFAULT '0' NOT NULL, 
    FOREIGN KEY(unique_counts_daily_id) REFERENCES unique_counts_daily (id)
);

COMMIT;

