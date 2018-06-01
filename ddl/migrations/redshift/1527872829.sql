BEGIN;

ALTER TABLE ping_centre_main ADD COLUMN profile_creation_date INTEGER ENCODE ZSTD;

COMMIT;
