BEGIN;

ALTER TABLE assa_impression_stats_daily ADD COLUMN client_region VARCHAR(5);

ALTER TABLE assa_sessions_daily ADD COLUMN client_region VARCHAR(5);

ALTER TABLE assa_sessions_daily ADD COLUMN profile_creation_date INTEGER;

ALTER TABLE assa_sessions_daily ADD COLUMN topsites_pinned INTEGER;

ALTER TABLE assa_sessions_daily ADD COLUMN custom_screenshot INTEGER;

COMMIT;
