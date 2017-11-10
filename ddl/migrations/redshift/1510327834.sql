BEGIN;

ALTER TABLE firefox_onboarding_events_daily ADD COLUMN bubble_state VARCHAR(64);

ALTER TABLE firefox_onboarding_events_daily ADD COLUMN notification_state VARCHAR(64);

ALTER TABLE firefox_onboarding_events_daily ADD COLUMN timestamp BIGINT;

ALTER TABLE firefox_onboarding_events_daily ADD COLUMN tour_source VARCHAR(64);

ALTER TABLE firefox_onboarding_events_daily ADD COLUMN tour_type VARCHAR(64);

ALTER TABLE firefox_onboarding_sessions_daily ADD COLUMN tour_type VARCHAR(64);

COMMIT;
