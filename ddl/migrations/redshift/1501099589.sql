BEGIN;

ALTER TABLE assa_sessions_daily ADD COLUMN topsites_first_painted_ts DOUBLE PRECISION;

COMMIT;
