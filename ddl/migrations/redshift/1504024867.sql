BEGIN;

CREATE TABLE firefox_onboarding_events_daily (
    client_id VARCHAR(64) NOT NULL, 
    addon_version VARCHAR(64) NOT NULL, 
    session_id VARCHAR(64) NOT NULL, 
    page VARCHAR(64) NOT NULL, 
    event VARCHAR(64) NOT NULL, 
    tour_id VARCHAR(64), 
    impression INTEGER NOT NULL, 
    category VARCHAR(64) NOT NULL, 
    tour_source VARCHAR(64) NOT NULL, 
    receive_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    date DATE NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    os VARCHAR(64) NOT NULL, 
    browser VARCHAR(64) NOT NULL, 
    version VARCHAR(64) NOT NULL, 
    device VARCHAR(14) NOT NULL
);

CREATE TABLE firefox_onboarding_sessions_daily (
    client_id VARCHAR(64) NOT NULL, 
    addon_version VARCHAR(64) NOT NULL, 
    session_begin BIGINT NOT NULL, 
    session_end BIGINT NOT NULL, 
    session_id VARCHAR(64) NOT NULL, 
    impression INTEGER NOT NULL, 
    page VARCHAR(64) NOT NULL, 
    event VARCHAR(64) NOT NULL, 
    category VARCHAR(64) NOT NULL, 
    tour_source VARCHAR(64) NOT NULL, 
    receive_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    date DATE NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    os VARCHAR(64) NOT NULL, 
    browser VARCHAR(64) NOT NULL, 
    version VARCHAR(64) NOT NULL, 
    device VARCHAR(14) NOT NULL
);

ALTER TABLE assa_events_daily ADD COLUMN release_channel VARCHAR(16);

ALTER TABLE assa_impression_stats_daily ADD COLUMN release_channel VARCHAR(16);

ALTER TABLE assa_masga_daily ADD COLUMN release_channel VARCHAR(16);

ALTER TABLE assa_performance_daily ADD COLUMN release_channel VARCHAR(16);

ALTER TABLE assa_sessions_daily ADD COLUMN release_channel VARCHAR(16);

COMMIT;
