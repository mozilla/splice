BEGIN;

ALTER TABLE adgroups ADD COLUMN channel_id INTEGER;
UPDATE adgroups SET channel_id = (SELECT MIN(id) FROM channels WHERE name = 'desktop');
UPDATE adgroups SET channel_id = (SELECT MIN(id) FROM channels WHERE name = 'android') WHERE id in (SELECT adgroup_id FROM tiles WHERE id in (529, 630, 631, 632));
ALTER TABLE adgroups ADD FOREIGN KEY(channel_id) REFERENCES channels (id);
ALTER TABLE channels RENAME COLUMN name TO name_short;
ALTER TABLE channels ADD COLUMN name VARCHAR(32) DEFAULT 'error' NOT NULL;
UPDATE channels SET name = name_short;
INSERT INTO channels (name, name_short, created_at) VALUES ('desktop-prerelease', 'error', SYSDATE);
ALTER TABLE channels DROP COLUMN name_short;

COMMIT;
