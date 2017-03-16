BEGIN;

ALTER TABLE activity_stream_events_daily ADD COLUMN user_prefs INTEGER;

ALTER TABLE activity_stream_masga ADD COLUMN user_prefs INTEGER;

ALTER TABLE activity_stream_performance_daily ADD COLUMN user_prefs INTEGER;

ALTER TABLE activity_stream_stats_daily ADD COLUMN topsites_screenshot INTEGER;

ALTER TABLE activity_stream_stats_daily ADD COLUMN topsites_size INTEGER;

ALTER TABLE activity_stream_stats_daily ADD COLUMN topsites_tippytop INTEGER;

ALTER TABLE activity_stream_stats_daily ADD COLUMN user_prefs INTEGER;

ALTER TABLE ss_event ADD COLUMN user_prefs INTEGER;

ALTER TABLE ss_masga ADD COLUMN user_prefs INTEGER;

ALTER TABLE ss_performance ADD COLUMN user_prefs INTEGER;

ALTER TABLE ss_session ADD COLUMN topsites_screenshot INTEGER;

ALTER TABLE ss_session ADD COLUMN topsites_size INTEGER;

ALTER TABLE ss_session ADD COLUMN topsites_tippytop INTEGER;

ALTER TABLE ss_session ADD COLUMN user_prefs INTEGER;

COMMIT;
