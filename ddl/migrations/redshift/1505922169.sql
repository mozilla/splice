BEGIN;

CREATE TABLE ping_centre_main (
    client_id VARCHAR(64) NOT NULL, 
    shield_id VARCHAR(256) NOT NULL, 
    release_channel VARCHAR(32) NOT NULL, 
    event VARCHAR(64) NOT NULL, 
    value VARCHAR(256) NOT NULL, 
    receive_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    date DATE NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    os VARCHAR(64) NOT NULL, 
    browser VARCHAR(64) NOT NULL, 
    version VARCHAR(64) NOT NULL, 
    device VARCHAR(14) NOT NULL
);

ALTER TABLE assa_events_daily ADD COLUMN shield_id VARCHAR(256);

ALTER TABLE assa_impression_stats_daily ADD COLUMN shield_id VARCHAR(256);

ALTER TABLE assa_masga_daily ADD COLUMN shield_id VARCHAR(256);

ALTER TABLE assa_performance_daily ADD COLUMN shield_id VARCHAR(256);

ALTER TABLE assa_sessions_daily ADD COLUMN shield_id VARCHAR(256);

COMMIT;
