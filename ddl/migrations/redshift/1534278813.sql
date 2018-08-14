BEGIN;

ALTER TABLE assa_sessions_daily ADD COLUMN topsites_search_shortcuts INTEGER ENCODE ZSTD;

ALTER TABLE assa_sessions_daily_by_client_id ADD COLUMN topsites_search_shortcuts INTEGER ENCODE ZSTD;

COMMIT;
