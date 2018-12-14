BEGIN;

ALTER TABLE assa_events_daily ADD COLUMN profile_creation_date INTEGER ENCODE ZSTD;

COMMIT;
