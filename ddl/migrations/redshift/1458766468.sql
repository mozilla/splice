BEGIN;

ALTER TABLE activity_stream_stats_daily ADD COLUMN date DATE;
UPDATE activity_stream_stats_daily SET date = TRUNC(receive_at);
ALTER TABLE activity_stream_stats_daily ALTER COLUMN date SET NOT NULL;

COMMIT;
