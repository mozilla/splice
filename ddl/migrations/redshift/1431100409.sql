BEGIN;

CREATE TABLE blacklisted_ips
(
    ip VARCHAR(64) NOT NULL,
    date DATE NOT NULL
);

ALTER TABLE impression_stats_daily ADD COLUMN blacklisted BOOLEAN DEFAULT FALSE;

COMMIT;
