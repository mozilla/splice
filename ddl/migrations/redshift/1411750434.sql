BEGIN;

ALTER TABLE impression_stats_daily ADD COLUMN newtabs INTEGER DEFAULT 0;

COMMIT;
