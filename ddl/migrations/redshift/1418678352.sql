BEGIN;

CREATE TABLE application_stats_daily
(
    date DATE NOT NULL,
    month INT DEFAULT 0 NOT NULL,
    week INT DEFAULT 0 NOT NULL,
    year INT DEFAULT 0 NOT NULL,
    locale VARCHAR(14) NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    os VARCHAR(64) NOT NULL,
    browser VARCHAR(64) NOT NULL,
    version VARCHAR(64) NOT NULL,
    device VARCHAR(64) NOT NULL,
    ver VARCHAR(16) NOT NULL,
    count INT DEFAULT 0 NOT NULL
);

COMMIT;
