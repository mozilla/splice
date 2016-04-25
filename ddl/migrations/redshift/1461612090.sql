BEGIN;

ALTER TABLE activity_stream_stats_daily ALTER COLUMN addon_version TYPE VARCHAR(64);

ALTER TABLE activity_stream_stats_daily ALTER COLUMN page TYPE VARCHAR(64);
UPDATE activity_stream_stats_daily SET page = 'TIMELINE_BOOKMARKS' where page = 'TIMELINE_BOOKMAR';

ALTER TABLE activity_stream_events_daily ALTER COLUMN addon_version TYPE VARCHAR(64);

ALTER TABLE activity_stream_events_daily ALTER COLUMN page TYPE VARCHAR(64);
UPDATE activity_stream_events_daily SET page = 'TIMELINE_BOOKMARKS' where page = 'TIMELINE_BOOKMAR';

COMMIT;
