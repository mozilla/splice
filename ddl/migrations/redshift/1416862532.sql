BEGIN;

CREATE TABLE temp_impression_stats_daily (
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
    FOREIGN KEY(tile_id) REFERENCES tiles (id),
    month INTEGER DEFAULT '0' NOT NULL,
    week INTEGER DEFAULT '0' NOT NULL,
    year INTEGER DEFAULT '0' NOT NULL
);

CREATE TABLE temp_newtab_stats_daily
(
    date DATE NOT NULL,
    newtabs INT DEFAULT 0 NOT NULL,
    month INT DEFAULT 0 NOT NULL,
    week INT DEFAULT 0 NOT NULL,
    year INT DEFAULT 0 NOT NULL,
    locale VARCHAR(14) NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    os VARCHAR(64) NOT NULL,
    browser VARCHAR(64) NOT NULL,
    version VARCHAR(64) NOT NULL,
    device VARCHAR(64) NOT NULL
);

COMMIT;