BEGIN;

ALTER TABLE activity_stream_events_daily ADD COLUMN highlight_type VARCHAR(64);

ALTER TABLE activity_stream_events_daily ADD COLUMN share_provider VARCHAR(64);

COMMIT;
