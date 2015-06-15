ALTER TABLE adgroups ADD COLUMN channel_id INTEGER;
UPDATE adgroups SET channel_id = 1;
UPDATE adgroups SET channel_id = 2 WHERE id in (SELECT adgroup_id FROM tiles WHERE id in (529, 630, 631, 632));
ALTER TABLE adgroups ADD FOREIGN KEY(channel_id) REFERENCES channels (id);
ALTER TABLE channels ALTER COLUMN name TYPE VARCHAR(32);
INSERT INTO channels (name) VALUES ('desktop-prerelease');
