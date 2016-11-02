BEGIN;

ALTER TABLE ss_event ADD COLUMN tp_version VARCHAR(64);

ALTER TABLE ss_performance ADD COLUMN tp_version VARCHAR(64);

ALTER TABLE ss_session ADD COLUMN tp_version VARCHAR(64);

COMMIT;
