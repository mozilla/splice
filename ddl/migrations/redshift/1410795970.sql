BEGIN;

ALTER TABLE impression_stats_daily ADD COLUMN month INTEGER;
UPDATE impression_stats_daily SET month = date_part('month', date);

ALTER TABLE impression_stats_daily ADD COLUMN week INTEGER;
UPDATE impression_stats_daily SET week = date_part('week', date);

ALTER TABLE impression_stats_daily ADD COLUMN year INTEGER;
UPDATE impression_stats_daily SET year = date_part('year', date);

COMMIT;
