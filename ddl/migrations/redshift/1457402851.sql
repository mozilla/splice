BEGIN;

DROP TABLE IF EXISTS activity_stream_stats_daily;

CREATE TABLE activity_stream_stats_daily (
    client_id VARCHAR(64) NOT NULL, 
    tab_id VARCHAR(64) NOT NULL,
    addon_version VARCHAR(16) NOT NULL, 
    load_reason VARCHAR(64) NOT NULL, 
    source VARCHAR(64) NOT NULL, 
    unload_reason VARCHAR(64) NOT NULL, 
    max_scroll_depth INTEGER NOT NULL, 
    load_latency INTEGER NOT NULL,
    click_position INTEGER NOT NULL,
    total_bookmarks INTEGER NOT NULL, 
    total_history_size INTEGER NOT NULL, 
    session_duration INTEGER NOT NULL, 
    receive_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    os VARCHAR(64) NOT NULL, 
    browser VARCHAR(64) NOT NULL, 
    version VARCHAR(64) NOT NULL, 
    device VARCHAR(64) NOT NULL
);

COMMIT;

