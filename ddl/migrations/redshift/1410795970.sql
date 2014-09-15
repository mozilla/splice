BEGIN;

ALTER TABLE impression_stats_daily ADD COLUMN month INTEGER NOT NULL;

ALTER TABLE impression_stats_daily ADD COLUMN week INTEGER NOT NULL;

ALTER TABLE impression_stats_daily ADD COLUMN year INTEGER NOT NULL;

COMMIT;