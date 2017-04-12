BEGIN;

ALTER TABLE activity_stream_stats_daily ADD COLUMN topsites_lowresicon INTEGER;

ALTER TABLE activity_stream_stats_daily ADD COLUMN topsites_pinned INTEGER;

ALTER TABLE ss_session ADD COLUMN topsites_lowresicon INTEGER;

ALTER TABLE ss_session ADD COLUMN topsites_pinned INTEGER;

COMMIT;
