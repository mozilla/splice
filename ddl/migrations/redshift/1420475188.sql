BEGIN;

CREATE TABLE site_stats_daily
(
    date DATE NOT NULL,
    month INT DEFAULT 0 NOT NULL,
    week INT DEFAULT 0 NOT NULL,
    year INT DEFAULT 0 NOT NULL,
    locale VARCHAR(14) NOT NULL,
    url VARCHAR(255) NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    os VARCHAR(64) NOT NULL,
    browser VARCHAR(64) NOT NULL,
    version VARCHAR(64) NOT NULL,
    device VARCHAR(64) NOT NULL,
    impressions INTEGER DEFAULT '0' NOT NULL,
    clicks INTEGER DEFAULT '0' NOT NULL,
    pinned INTEGER DEFAULT '0' NOT NULL,
    blocked INTEGER DEFAULT '0' NOT NULL,
    sponsored_link INTEGER DEFAULT '0' NOT NULL,
    sponsored INTEGER DEFAULT '0' NOT NULL
);

COMMIT;