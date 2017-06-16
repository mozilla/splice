BEGIN;

CREATE TABLE assa_events_daily (
    client_id VARCHAR(64) NOT NULL, 
    addon_version VARCHAR(64) NOT NULL, 
    source VARCHAR(64) NOT NULL, 
    session_id VARCHAR(64) NOT NULL, 
    page VARCHAR(64) NOT NULL, 
    action_position VARCHAR(16) NOT NULL, 
    event VARCHAR(64) NOT NULL, 
    receive_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    date DATE NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    os VARCHAR(64) NOT NULL, 
    browser VARCHAR(64) NOT NULL, 
    version VARCHAR(64) NOT NULL, 
    device VARCHAR(64) NOT NULL
);

CREATE TABLE assa_masga_daily (
    client_id VARCHAR(64) NOT NULL, 
    addon_version VARCHAR(64) NOT NULL, 
    source VARCHAR(64) NOT NULL, 
    session_id VARCHAR(64), 
    page VARCHAR(64) NOT NULL, 
    event VARCHAR(64) NOT NULL, 
    value INTEGER NOT NULL, 
    receive_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    date DATE NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    os VARCHAR(64) NOT NULL, 
    browser VARCHAR(64) NOT NULL, 
    version VARCHAR(64) NOT NULL, 
    device VARCHAR(64) NOT NULL
);

CREATE TABLE assa_performance_daily (
    client_id VARCHAR(64) NOT NULL, 
    addon_version VARCHAR(64) NOT NULL, 
    source VARCHAR(64) NOT NULL, 
    session_id VARCHAR(64), 
    page VARCHAR(64) NOT NULL, 
    event VARCHAR(64) NOT NULL, 
    event_id VARCHAR(64) NOT NULL, 
    value INTEGER NOT NULL, 
    receive_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    date DATE NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    os VARCHAR(64) NOT NULL, 
    browser VARCHAR(64) NOT NULL, 
    version VARCHAR(64) NOT NULL, 
    device VARCHAR(64) NOT NULL
);

CREATE TABLE assa_sessions_daily (
    client_id VARCHAR(64) NOT NULL, 
    addon_version VARCHAR(64) NOT NULL, 
    page VARCHAR(64) NOT NULL, 
    session_duration INTEGER NOT NULL, 
    session_id VARCHAR(64) NOT NULL, 
    load_trigger_type VARCHAR(64), 
    load_trigger_ts DOUBLE PRECISION, 
    visibility_event_rcvd_ts DOUBLE PRECISION, 
    receive_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    date DATE NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    os VARCHAR(64) NOT NULL, 
    browser VARCHAR(64) NOT NULL, 
    version VARCHAR(64) NOT NULL, 
    device VARCHAR(64) NOT NULL
);

COMMIT;
