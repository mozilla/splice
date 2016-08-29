BEGIN;

ALTER TABLE activity_stream_events_daily ADD COLUMN metadata_source VARCHAR(64);

ALTER TABLE activity_stream_performance_daily ADD COLUMN metadata_source VARCHAR(64);

COMMIT;
