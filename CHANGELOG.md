2.1.5
=====
Bugfixes:
* force to start a new content from version 1
* add data validation for manifest.json

2.1.4
=====
Alter schema for activity_stream_stats_daily
* change tab_id to integer
* change click_position to integer
* add load_latency
__note__: no migration was created for the changes above, modify the previous migration in ddl/migrations/redshift/1457402851

2.1.3
=====
Fix variour issues:
* use stronger checksum for the original content
* use new signing service endpoint
* start tracking signing public key in the database

2.1.2
=====
Add redshift table: activity_stream_stats_daily

__note__:
* Include a new migration: migrations/versions/171b15035012_.py
* Include a new schema: ddl/migrations/redshift/1457402851

2.1.1
=====
* Fix the hardcoded HAwK user id
* Upgrade gevent to 1.1rc5

2.1.0
=====
Add content signing APIs

__note__:
* Include new database migration in migrations/versions/456611d35239_.py
* Add a few configuration items, including: two new s3 buckets, detail of signing service, and app control

2.0.8
=====
Fix a bug that will create invalid image field in tile assest

2.0.7
=====
Add prerelease/hello/android to the index walker
Upgrade Babel-eslint to 4.1.7

2.0.6
=====
Fix the build script for Linux

2.0.5
=====
Fix various issues:
* missing static files for front end
* add campaign "Get Smart on Surveillance"
* fix the issue when handling raw image hashes

2.0.4
=====
Fix bundle/deploy script for distribution viewer.

2.0.3
=====
Add position priority for directory tiles

__note__:
* Include new database migration in migrations/versions/137eeadf84cb_.py

2.0.2
=====
Lock the package for the front_end and ui

2.0.1
=====
Fix various bugs in the migration script

2.0.0
=====
Initial Commit of 2.0.0

1.1.37
======
* Update the bundle.js. Otherwise, same as 1.1.36.

1.1.36
======
* Properly set the bgColor of tiles from the tile field. 

1.1.35
======
* Issue #113 - Port existing Splice UI to new redux stack

1.1.34
=====
 * Bug 1205832 - Splice's tile_index_crawl.py script doesn't work with SNI
 * Upgrade AngularJs to 1.4.5

1.1.33
=====
 * Bug 1197962 - ingest tiles with adgroup_categories field

__note__:
 * This release depends on the database change in 1.1.32

1.1.32
======

* Bug 1197962 - Add adgroup_categories table
* Bug 1182241 - Remove table locking on insert
* Bug 1188051 - Add title_bg_color to tiles table

__note__:
* Include new database migration in migrations/versions/d8d5541170a_.py

1.1.31
======

* cherry-pick commit for adding test for 'hello' channel
* cherry-pick commit for adding connection pool for tile_index_crawl
* make SPLICE_IGNORE_REDSHIFT checking more explicit

1.1.30
======

* upgrade Flask-Migrate to 1.5

1.1.29
======

* changing setup.py to install rs_to_pg script

1.1.28
======

* Bug 1181640 - Move campaign data to RDS (postgres)

1.1.27
======

* Bug 1181659 - Create Alembic migrations for new RDS campaign database (postgres)

1.1.26
======

* Bug 1181652 - Splice changes to support dual (reporting, campaign) databases

1.1.25
======

* Bug 1169300 - Ensure Tile immutability for table stakes features

1.1.24
======

* Bug 1167761 - Implement asset re-use in ingestion format for splice

1.1.23
======

* update default channels to index crawl

1.1.22
======

* fix redshift migration sql script for schema changes

__note__:
* modifies the existing schema change/migration
 * ddl/migrations/redshift/1433974555.sql

1.1.21
======

* fix cache key to include channel id in distribution.js

1.1.20
======

* Bug 1171116 - Add Firefox prerelease channel and add tracking per channel

__note__:
* includes schema change/migration
 * ddl/migrations/redshift/1433974555.sql

1.1.19
======

* Make time limits JS regex friendly (json-schema)

1.1.18
======

* migrations to support IP blacklist / fraud detection

1.1.17
======
 * Bug 1161197 - Accept inputs of start/stop times in Splice

__note__:
* includes schema change/migration
 * ddl/migrations/redshift/1432589405.sql

1.1.16
======
 * Bug 1167404 - Allow for custom explanation with optional replacement targets

1.1.15
======
 * Bug 1161192 - Implement frequency cap in splice
 * Bug 1161201 - Accept input of negative adjacency inclusion in Splice
 * Fix FK issue in distributions table for alembic migrations
 * set exit non-zero on errors for tile_index_crawl.py
 * fix index crawl channels for tile_index_crawl.py
 * Bug 1161196 - Add custom explanation in splice

__note__:
* includes schema change/migration
 * ddl/migrations/redshift/1431479872.sql
 * ddl/migrations/redshift/1431545807.sql
 * ddl/migrations/redshift/1432220165.sql

1.1.14
======
 * disable urllib3 warnings in tile_index_crawl.py
 * fix tile_index_crawl.py default cdn

1.1.13
======

* adds __heartbeat__ verification

1.1.12
======

* Fix scoping bug in generate_artifacts

1.1.11
======

* UI to preview Adgroups
* Index crawl script

1.1.10
======

* lose scheme in JSON schema for frecent sites

1.1.9
=====

* keep locales in Tiles table

1.1.8
=====

* added Related Tiles database migration for RedShift

1.1.7
=====

* added Related Tiles 
* requires database migration 

1.1.6
=====

* authoring publish success UI now with upload status
* CI tests now on PostgresQL

1.1.5
=====

* fix bug 1146028: old tiles being served
* travis performance improvement: pypi packages are now cached

1.1.4
=====

* new authoring feature: ability to schedule tile distributions in the future
* new authoring UI: upcoming, to be able to view and cancel scheduled deployments of distributions
* requires a cron job to be created. The cronjob is to be run every 15 mins, starting as close as possible to the zeroth minute
* model definitions for tables created in earlier version

__note__:
* includes schema change/migration. new column: scheduled_start_date added to table distributions
* requires a cron job for scheduling feature to work

1.1.2
=====

* new table / migration: countries is a static dimension table containing countries and their iso codes

1.1.1
=====

* new table / migration: application_stats_daily is a Redshift table to track 'fetch' application events

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
