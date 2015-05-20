BEGIN;

CREATE TABLE blacklisted_ips
(
    ip VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT SYSDATE NOT NULL
);

CREATE TABLE blacklist_stats_daily
(
    ip VARCHAR(64),
    date DATE NOT NULL,
    impressions INTEGER DEFAULT '0' NOT NULL,
    clicks INTEGER DEFAULT '0' NOT NULL,
    pinned INTEGER DEFAULT '0' NOT NULL,
    blocked INTEGER DEFAULT '0' NOT NULL,
    sponsored_link INTEGER DEFAULT '0' NOT NULL,
    sponsored INTEGER DEFAULT '0' NOT NULL,
    newtabs INTEGER DEFAULT '0' NOT NULL
);

COMMIT;
