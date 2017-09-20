BEGIN;

ALTER TABLE assa_events_daily ADD COLUMN shield_id VARCHAR(256);

ALTER TABLE assa_impression_stats_daily ADD COLUMN shield_id VARCHAR(256);

ALTER TABLE assa_masga_daily ADD COLUMN shield_id VARCHAR(256);

ALTER TABLE assa_performance_daily ADD COLUMN shield_id VARCHAR(256);

ALTER TABLE assa_sessions_daily ADD COLUMN shield_id VARCHAR(256);

COMMIT;
