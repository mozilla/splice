BEGIN;

ALTER TABLE activity_stream_events_daily ADD COLUMN highlight_type VARCHAR(64);

COMMIT;
