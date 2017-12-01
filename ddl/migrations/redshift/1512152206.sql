BEGIN;

CREATE TABLE firefox_onboarding_events2_daily (
    client_id VARCHAR(64) NOT NULL, 
    addon_version VARCHAR(64) NOT NULL, 
    bubble_state VARCHAR(16) NOT NULL, 
    category VARCHAR(64) NOT NULL, 
    current_tour_id VARCHAR(64) NOT NULL, 
    logo_state VARCHAR(16) NOT NULL, 
    notification_impression INTEGER NOT NULL, 
    notification_state VARCHAR(16) NOT NULL, 
    page VARCHAR(64) NOT NULL, 
    parent_session_id VARCHAR(64) NOT NULL, 
    root_session_id VARCHAR(64) NOT NULL, 
    target_tour_id VARCHAR(64) NOT NULL, 
    timestamp BIGINT NOT NULL, 
    tour_type VARCHAR(16) NOT NULL, 
    type VARCHAR(64) NOT NULL, 
    width INTEGER NOT NULL, 
    release_channel VARCHAR(16) NOT NULL, 
    receive_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    date DATE NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    country_code VARCHAR(5) NOT NULL, 
    os VARCHAR(64) NOT NULL, 
    browser VARCHAR(64) NOT NULL, 
    version VARCHAR(64) NOT NULL, 
    device VARCHAR(14) NOT NULL
);

CREATE TABLE firefox_onboarding_sessions2_daily (
    client_id VARCHAR(64) NOT NULL, 
    addon_version VARCHAR(64) NOT NULL, 
    category VARCHAR(64) NOT NULL, 
    page VARCHAR(64) NOT NULL, 
    parent_session_id VARCHAR(64) NOT NULL, 
    root_session_id VARCHAR(64) NOT NULL, 
    session_begin BIGINT NOT NULL, 
    session_end BIGINT NOT NULL, 
    session_id VARCHAR(64) NOT NULL, 
    tour_type VARCHAR(64) NOT NULL, 
    type VARCHAR(64) NOT NULL, 
    release_channel VARCHAR(16) NOT NULL, 
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
