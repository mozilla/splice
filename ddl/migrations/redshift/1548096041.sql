BEGIN;

ALTER TABLE assa_impression_stats_daily ADD COLUMN receive_at TIMESTAMP WITHOUT TIME ZONE ENCODE ZSTD;

COMMIT;
