BEGIN;

CREATE TABLE ss_event (
    client_id VARCHAR(64) NOT NULL, 
    tab_id VARCHAR(64) NOT NULL, 
    addon_version VARCHAR(64) NOT NULL, 
    source VARCHAR(64) NOT NULL, 
    session_id VARCHAR(64), 
    shield_variant VARCHAR(64), 
    page VARCHAR(64) NOT NULL, 
    experiment_id VARCHAR(64), 
    action_position VARCHAR(16) NOT NULL, 
    event VARCHAR(16) NOT NULL, 
    recommendation_url VARCHAR(255), 
    recommender_type VARCHAR(64), 
    highlight_type VARCHAR(64), 
    share_provider VARCHAR(64), 
    metadata_source VARCHAR(64), 
    receive_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    date DATE NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    os VARCHAR(64) NOT NULL, 
    browser VARCHAR(64) NOT NULL, 
    version VARCHAR(64) NOT NULL, 
    device VARCHAR(64) NOT NULL
);

CREATE TABLE ss_performance (
    client_id VARCHAR(64) NOT NULL, 
    tab_id VARCHAR(64) NOT NULL, 
    addon_version VARCHAR(64) NOT NULL, 
    source VARCHAR(64) NOT NULL, 
    session_id VARCHAR(64), 
    shield_variant VARCHAR(64), 
    experiment_id VARCHAR(64), 
    event VARCHAR(64) NOT NULL, 
    event_id VARCHAR(64) NOT NULL, 
    metadata_source VARCHAR(64), 
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

CREATE TABLE ss_session (
    client_id VARCHAR(64) NOT NULL, 
    tab_id VARCHAR(64) NOT NULL, 
    addon_version VARCHAR(64) NOT NULL, 
    load_reason VARCHAR(64) NOT NULL, 
    page VARCHAR(64) NOT NULL, 
    unload_reason VARCHAR(64) NOT NULL, 
    experiment_id VARCHAR(64), 
    max_scroll_depth INTEGER NOT NULL, 
    load_latency INTEGER NOT NULL, 
    total_bookmarks INTEGER NOT NULL, 
    total_history_size INTEGER NOT NULL, 
    session_duration INTEGER NOT NULL, 
    session_id VARCHAR(64), 
    shield_variant VARCHAR(64), 
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
