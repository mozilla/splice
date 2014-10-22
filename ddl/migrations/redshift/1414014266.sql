BEGIN;

CREATE TABLE newtab_stats_daily
(
    date DATE NOT NULL,
    newtabs INT DEFAULT 0 NOT NULL,
    month INT DEFAULT 0 NOT NULL,
    week INT DEFAULT 0 NOT NULL,
    year INT DEFAULT 0 NOT NULL,
    locale VARCHAR(14) NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    os VARCHAR(64) NOT NULL,
    browser VARCHAR(64) NOT NULL,
    version VARCHAR(64) NOT NULL,
    device VARCHAR(64) NOT NULL
);

insert into newtab_stats_daily(date, newtabs, month, week, year, locale, country_code, os, browser, version, device)
    select date, sum(newtabs), month, week, year, locale, country_code, os, browser, version, device
      from impression_stats_daily
      where tile_id = -1
      group by date, month, week, year, locale, country_code, os, browser, version, device;

delete from impression_stats_daily where tile_id = -1;

alter table impression_stats_daily drop column newtabs;

COMMIT;
