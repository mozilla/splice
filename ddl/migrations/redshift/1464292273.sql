BEGIN;

ALTER TABLE activity_stream_events_daily ADD COLUMN experiment_id VARCHAR(64);
ALTER TABLE activity_stream_stats_daily ADD COLUMN experiment_id VARCHAR(64);

COMMIT;
