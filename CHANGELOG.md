2.1.51
======
* Change encoding for boolean types in watchdog_proxy_events_daily

2.1.50
======
* Add watchdog_proxy_events_daily

__note__:
* Include a new migration: migrations/versions/332da7ae51f3_.py
* Include a new schema: ddl/migrations/redshift/1534527018.sql

2.1.49
======
* Add topsites_search_shortcuts to assa_sessions_daily and assa_sessions_daily_by_client_id

__note__:
* Include a new migration: /migrations/versions/2a9ca56929cc_.py
* Include a new schema: ddl/migrations/redshift/1534278813.sql

2.1.48
======
* Add profile_creation_date to ping_centre_main

__note__:
* Include a new migration: migrations/versions/159a3bd70527_.py
* Include a new schema: ddl/migrations/redshift/1527872829.sql

2.1.47
======
* Add a new table assa_router_events_daily

__note__:
* Include a new migration: migrations/versions/599fe459913b_.py
* Include a new schema: ddl/migrations/redshift/1526998293.sql

2.1.46
======
* Add a column "value" to assa_events_daily

__note__:
* Include a new migration: migrations/versions/4b94f1530fa8_.py
* Include a new schema: ddl/migrations/redshift/1519755317.sql

2.1.45
======
* Drop various unused tables

__note__:
* Include a new migration: migration/version/4cf6cb2e2309_.py
* Include a new schema: ddl/migrations/redshift/1517416472.sql

2.1.44
======
* Add various columns to activity stream

__note__:
* Include a new migration: migrations/versions/3e454722b821_.py
* Include a new schema: ddl/migrations/redshift/1516031096.sql

2.1.43
======
* Add table schema for firefox onboarding v2

__note__:
* Include a new migration: migrations/versions/11352353f786_.py
* Include a new schema: ddl/migrations/redshift/1512152206.sql

2.1.42
======
* Add various columns to firefox onboarding tables

__note__:
* Include a new migration: migrations/versions/1766adfa8fd_.py
* Include a new schema: ddl/migrations/redshift/1510327834.sql

2.1.41
======
Add no_image to assa_session_daily
In-place change based on 2.1.40, no new schema created

2.1.40
======
* Add is_preloaded, is_prerendered, topsites_data_late_by_ms, highlights_data_by_ms
screenshot_with_icon, screenshot, tipppytop, and rich_icon to assa_session_daily
* Add hour and minute to assa_impression_stats_daily

__note__:
* Include a new migration: migrations/versions/14abd58d84f5_.py
* Include a new schema: ddl/migrations/redshift/1508945470.sql

2.1.39
======
Add a new table ping_centre_main
In-place change based on 2.1.38, no new schema created

2.1.38
======
Add shield_id to all the activity stream tables

__note__:
* Include a new migration: migrations/versions/153663fadcdb_.py
* Include a new schema: ddl/migrations/redshift/1505922169.sql

2.1.37
======
Alter schema to drop tour_source column for firefox_onboarding_events_daily
In-place change based on 2.1.35, no new schema created

2.1.36
======
Alter schema for Firefox Onboarding
In-place change based on 2.1.35, no new schema created

2.1.35
======
Table schema for Activity Stream system addon and Firefox onboarding
* Add a release_channel for all the Activity Stream tables
* Create new tables for Firefox onboarding

__note__:
* Include a new migration: migrations/versions/386a01af44c_.py
* Include a new schema: ddl/migrations/redshift/1504024867.sql

2.1.34
======
Table schema for Activity Stream system addon
* Add assa_impression_stats_daily

__note__:
* Include a new migration: migrations/versions/49387f326d6a_.py
* Include a new schema: ddl/migrations/redshift/1502811414.sql

2.1.33
======
Table schema change for all assa tables
* Add user_prefs

__note__:
* Include a new migration: migration/version/2809b3efc07e_.py
* Include a new schema: ddl/migrations/redshift/1502386025.sql

2.1.32
======
Bump PyOpenSSL to 17.2.0

2.1.31
======
Table schema change for assa_session_daily
* Add topsites_first_painted_ts

__note__:
* Include a new migration: migration/version/90123954ee7_.py
* Include a new schema: ddl/migrations/redshift/1501099589.sql

2.1.30
======
Table schema changes for Activity Stream system addon
* Add assa_sessions_daily
* Add assa_events_daily
* Add assa_performance_daily
* Add assa_masga_daily

_note__:
* Include a new migration: migration/version/55df5c7c41fd_.py
* Include a new schema: ddl/migrations/redshift/1497554727.sql

2.1.29
======
Tweak the last schema change to remove "receive_at" of activity_stream_impression_daily

2.1.28
======
Table schema changes for Activity Stream
* Add activity_stream_impression_daily
* Add tp_version to ss_masga

__note__:
* Include a new migration: migration/version/25c409de54cc_.py
* Include a new schema: ddl/migrations/redshift/1493213710.sql


2.1.27
======
Table schema changes for Activity Stream
* Add topsites_pinned, topsites_lowresicon

__note__:
* Include a new migration: migration/version/556e52d3d14b_.py
* Include a new schema: ddl/migrations/redshift/1492003954.sql

2.1.26
======
Table schema changes for Activity Stream
* Add topsites_size, topsites_tippytop, topsites_screenshot for session table
* Add user_prefs for all tables

__note__:
* Include a new migration: migration/versions/18b96423fcf0_.py
* Include a new schema: ddl/migrations/redshift/1489612009.sql

2.1.25
======
Fix the Redshift DDL by rename the "raw" field
Add a "release_channel" for A-S mobile tables

2.1.24
======
Table schema changes for Ping-centre
* Add ping_centre_test_pilot table
* Add activity_stream_mobile_stats_daily table
* Add activity_stream_events_daily table

__note__:
* Include a new migration: migrations/versions/3473e3069558_.py
* Include a new schema: ddl/migrations/redshift/1487106710.sql

2.1.23
======
Table schema changes for Activity Stream
* Add highlights_size for the session and shield study session tables
* Add a new table activity_stream_masga to track the undesired states

__note__:
* Include a new migration: migrations/versions/4aada554f5e4_.py
* Include a new schema: ddl/migrations/redshift/1482266757.sql

2.1.22
======
Table schema changes for Activity Stream Shield Study
* Add tp_version for ss_session, ss_event, and ss_performance

__note__:
* Include a new migration: migrations/versions/3addd85ccbc9_.py
* Include a new schema: ddl/migrations/redshift/1478097203.sql

2.1.21
======
Table schema changes for Activity Stream
* Add tables: ss_session, ss_event, and ss_performance for A-S shield study

__note__:
* Include a new migration: migrations/versions/5614f34b9d8b_.py
* Include a new schema: ddl/migrations/redshift/1477592326.sql

2.1.20
======
* Fix the adgroup type for suggested tiles
* Fix the default exports in the front end

2.1.19
======
Table schema changes for Activity Stream
* Add metadata_source for activity_stream_events_daily and activity_stream_performance_daily

__note__:
* Include a new migration: migrations/versions/c662f052956_.py
* Include a new schema: ddl/migrations/redshift/1472479343.sql

2.1.18
======
Table schema changes for Activity Stream
* Add share_provider and highlight_type for activity_stream_events_daily

__note__:
* Include a new migration: migrations/versions/52c5946188c4_.py
* Include a new schema: ddl/migrations/redshift/1470674567.sql

2.1.17
======
Table schema changes for Activity Stream
* Add recommendation_url and recommender_type for activity_stream_events_daily

__note__:
* Include a new migration: migrations/versions/410f1493e84b_.py
* Include a new schema: ddl/migrations/redshift/1469217681.sql

2.1.16
======
* Add missing deps in requirements.txt for fabric

2.1.15
======
Table schema changes for Activity Stream
* Add activity_stream_performance_daily table
* Add experiment_id and session_id for all activity_stream tables

__note__:
* Include a new migration: migrations/versions/31e24c646a0a_.py
* Include a new schema: ddl/migrations/redshift/1464292273.sql

2.1.14
======
* Fix the last db migration - reorder the SQL statements

2.1.13
======
* Fix the db migration script in 2.1.12, replace ALTER COLUMN with a workaround script

2.1.12
======
* Fix the truncation issues by changing table schemas for activity stream

__note__:
* Include a new migration: migrations/versions/11b247298d4_.py
* Include a new schema: ddl/migrations/redshift/1461612090.sql

2.1.11
======
* Fix an issue in 2.1.10 - add the SQL to the setup.py

2.1.10
======
* Add SQL for compressing redshift daily tables

2.1.9
=====
* Lock the UI deps and use absolute path for build script

2.1.8
=====
* Add a script to expire data in redshift

2.1.7
=====
Fix the migration script for Redshift
* Use CURRENT_DATE as default for the 'date' column 'activity_stream_stats_daily'
* Use 'newtab' as default for the 'page' column in 'activity_stream_stats_daily'

2.1.6
=====
Alter table schemas for activity stream

__note__:
* Include a new migration: migrations/versions/44fe26926437_.py
* Include a new schema: ddl/migrations/redshift/1458766468.sql

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
* Include a new schema: ddl/migrations/redshift/1457402851.sql

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
