BEGIN;

ALTER TABLE activity_stream_events_daily ADD COLUMN recommendation_url VARCHAR(255);

ALTER TABLE activity_stream_events_daily ADD COLUMN recommender_type VARCHAR(64);

COMMIT;
