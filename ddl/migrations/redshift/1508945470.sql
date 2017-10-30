BEGIN;

ALTER TABLE assa_sessions_daily ADD COLUMN highlights_data_late_by_ms INTEGER;

ALTER TABLE assa_sessions_daily ADD COLUMN topsites_data_late_by_ms INTEGER;

ALTER TABLE assa_sessions_daily ADD COLUMN is_preloaded BOOLEAN;

ALTER TABLE assa_sessions_daily ADD COLUMN is_prerendered BOOLEAN;

ALTER TABLE assa_sessions_daily ADD COLUMN rich_icon INTEGER;

ALTER TABLE assa_sessions_daily ADD COLUMN screenshot INTEGER;

ALTER TABLE assa_sessions_daily ADD COLUMN screenshot_with_icon INTEGER;

ALTER TABLE assa_sessions_daily ADD COLUMN tippytop INTEGER;

ALTER TABLE assa_sessions_daily ADD COLUMN no_image INTEGER;

ALTER TABLE assa_impression_stats_daily ADD COLUMN hour INTEGER;

ALTER TABLE assa_impression_stats_daily ADD COLUMN minute INTEGER;

COMMIT;
