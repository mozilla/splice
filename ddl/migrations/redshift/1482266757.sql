BEGIN;

CREATE TABLE activity_stream_masga (
    client_id VARCHAR(64) NOT NULL,
    tab_id VARCHAR(64) NOT NULL,
    addon_version VARCHAR(64) NOT NULL,
    source VARCHAR(64) NOT NULL,
    session_id VARCHAR(64),
    experiment_id VARCHAR(64),
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

CREATE TABLE ss_masga (
    client_id VARCHAR(64) NOT NULL,
    tab_id VARCHAR(64) NOT NULL,
    addon_version VARCHAR(64) NOT NULL,
    source VARCHAR(64) NOT NULL,
    session_id VARCHAR(64),
    experiment_id VARCHAR(64),
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

ALTER TABLE activity_stream_stats_daily ADD COLUMN highlights_size INTEGER;

ALTER TABLE ss_session ADD COLUMN highlights_size INTEGER;

COMMIT;
