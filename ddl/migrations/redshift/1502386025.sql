BEGIN;

ALTER TABLE assa_events_daily ADD COLUMN user_prefs INTEGER;

ALTER TABLE assa_masga_daily ADD COLUMN user_prefs INTEGER;

ALTER TABLE assa_performance_daily ADD COLUMN user_prefs INTEGER;

ALTER TABLE assa_sessions_daily ADD COLUMN user_prefs INTEGER;

COMMIT;
