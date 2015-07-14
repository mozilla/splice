BEGIN;

INSERT INTO channels (name, created_at) VALUES ('hello', SYSDATE);

COMMIT;
