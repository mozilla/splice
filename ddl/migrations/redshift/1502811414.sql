BEGIN;

CREATE TABLE assa_impression_stats_daily (
    client_id VARCHAR(64) NOT NULL, 
    tile_id INTEGER NOT NULL, 
    addon_version VARCHAR(64) NOT NULL, 
    date DATE NOT NULL, 
    impressions INTEGER DEFAULT '0' NOT NULL, 
    clicks INTEGER DEFAULT '0' NOT NULL, 
    pinned INTEGER DEFAULT '0' NOT NULL, 
    blocked INTEGER DEFAULT '0' NOT NULL, 
    pocketed INTEGER DEFAULT '0' NOT NULL, 
    position INTEGER DEFAULT '0' NOT NULL, 
    page VARCHAR(64) NOT NULL, 
    source VARCHAR(64) NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    os VARCHAR(64) NOT NULL, 
    browser VARCHAR(64) NOT NULL, 
    version VARCHAR(64) NOT NULL, 
    device VARCHAR(64) NOT NULL, 
    blacklisted BOOLEAN DEFAULT 'false' NOT NULL, 
    user_prefs INTEGER
);

COMMIT;
