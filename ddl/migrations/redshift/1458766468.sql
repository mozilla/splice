BEGIN;

ALTER TABLE activity_stream_stats_daily ADD COLUMN date DATE;
UPDATE activity_stream_stats_daily SET date = TRUNC(receive_at);
ALTER TABLE activity_stream_stats_daily ALTER COLUMN date SET NOT NULL;

ALTER TABLE activity_stream_stats_daily ADD COLUMN page VARCHAR(16) NOT NULL;

ALTER TABLE activity_stream_stats_daily DROP COLUMN click_position;

ALTER TABLE activity_stream_stats_daily DROP COLUMN source;

CREATE TABLE activity_stream_events_daily (
    client_id VARCHAR(64) NOT NULL,
    tab_id VARCHAR(64) NOT NULL,
    addon_version VARCHAR(16) NOT NULL,
    source VARCHAR(64) NOT NULL,
    page VARCHAR(16) NOT NULL,
    action_position VARCHAR(16) NOT NULL,
    event VARCHAR(16) NOT NULL,
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
