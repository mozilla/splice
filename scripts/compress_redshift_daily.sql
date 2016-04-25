begin transaction;

--  impression_stats_daily
create temp table temp_imp_stats (like impression_stats_daily);
insert into temp_imp_stats (tile_id, date, position, enhanced, locale, country_code, os,
                            browser, version, device, month, week, year, blacklisted,
                            impressions, clicks, pinned, blocked, sponsored_link, sponsored)
    (select tile_id, date, position, enhanced, locale, country_code, os, browser, version,
     device, month, week, year, blacklisted, sum(impressions), sum(clicks), sum(pinned), sum(blocked),
     sum(sponsored_link), sum(sponsored)
     from impression_stats_daily
     where date = (TRUNC(GETDATE())-1)
     group by tile_id, date, position, enhanced, locale, country_code, os, browser, version,
     device, month, week, year, blacklisted);

delete from impression_stats_daily where date = (TRUNC(GETDATE())-1);
insert into impression_stats_daily select * from temp_imp_stats;
drop table temp_imp_stats;

-- application_stats_daily
create temp table temp_app_stats (like application_stats_daily);
insert into temp_app_stats
    (date, month, week, year, locale, action, country_code, os, browser, version, device, ver, count)
    (select date, month, week, year, locale, action, country_code, os, browser, version,
     device, ver, sum(count)
     from application_stats_daily
     where date = (TRUNC(GETDATE())-1)
     group by date, month, week, year, locale, action, country_code, os, browser, version, device, ver);

delete from application_stats_daily where date = (TRUNC(GETDATE())-1);
insert into application_stats_daily select * from temp_app_stats;
drop table temp_app_stats;

end transaction;
