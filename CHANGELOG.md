1.1.0
=====

* new feature: channels. the ability to have different distribution channels
* new feature: ability to ingest tiles without deploying (new default behavior)

__note__:
* includes schema changes 
* requires reconfiguration of onyx, because we now have different channels

1.0.14
======

* bugfix: better client caching and less uploads in tile ingestion

1.0.13
======

* fixes utf-8 errors in reporting API

1.0.12
======

Bugfix release for tile insertions: RedShift has no constraints therefore allows
the possibility for duplicate tiles to be inserted due to our way of testing for
existence and inserting tiles.

* bugfix: inserts of tiles lock database to prevent concurrency issues in RedShift
* in case of duplicate tiles (condition prior to bugfix above), use a consistent duplicate

1.0.10
======

* Reporting API extended to have country_code and locale as query params
* newtab_stats_daily table and reporting API
* tile descriptions in reporting API
* ingestion splits images into separate files and uploads them to S3 for cloudfront distribution

Requires a database migration in sync with infernyx
