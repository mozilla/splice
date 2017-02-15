BEGIN;

CREATE TABLE ping_centre_test_pilot (
    client_id VARCHAR(64) NOT NULL, 
    event_type VARCHAR(64) NOT NULL, 
    object VARCHAR(64), 
    client_time INTEGER NOT NULL, 
    variants VARCHAR(64), 
    addon_id VARCHAR(64) NOT NULL, 
    addon_version VARCHAR(64) NOT NULL, 
    firefox_version VARCHAR(64) NOT NULL, 
    receive_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    date DATE NOT NULL, 
    os_name VARCHAR(64) NOT NULL, 
    os_version VARCHAR(64) NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    raw VARCHAR(16384) NOT NULL
);

CREATE TABLE activity_stream_mobile_events_daily (
    client_id VARCHAR(64) NOT NULL, 
    build VARCHAR(64) NOT NULL, 
    app_version VARCHAR(64) NOT NULL, 
    page VARCHAR(64) NOT NULL, 
    action_position VARCHAR(16), 
    source VARCHAR(64), 
    event VARCHAR(64) NOT NULL, 
    receive_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    date DATE NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    os VARCHAR(64) NOT NULL, 
    browser VARCHAR(64) NOT NULL, 
    version VARCHAR(64) NOT NULL, 
    device VARCHAR(14) NOT NULL
);

CREATE TABLE activity_stream_mobile_stats_daily (
    client_id VARCHAR(64) NOT NULL, 
    build VARCHAR(64) NOT NULL, 
    app_version VARCHAR(64) NOT NULL, 
    session_duration INTEGER NOT NULL, 
    receive_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    date DATE NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    os VARCHAR(64) NOT NULL, 
    browser VARCHAR(64) NOT NULL, 
    version VARCHAR(64) NOT NULL, 
    device VARCHAR(14) NOT NULL
);

COMMIT;
