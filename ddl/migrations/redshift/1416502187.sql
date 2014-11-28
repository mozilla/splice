BEGIN;

CREATE TABLE channels (
    id INTEGER IDENTITY(1,1) NOT NULL, 
    name VARCHAR(16) NOT NULL, 
    PRIMARY KEY (id)
);

ALTER TABLE distributions ADD COLUMN channel_id INTEGER;

INSERT INTO channels(name, created_at) VALUES ('desktop', '2014-11-21 15:40:0.000000');

INSERT INTO channels(name, created_at) VALUES ('android', '2014-11-21 15:40:0.000001');

UPDATE distributions SET channel_id = (SELECT id FROM channels WHERE name = 'desktop');

ALTER TABLE distributions ADD COLUMN deployed BOOLEAN;

UPDATE distributions SET deployed = true;

COMMIT;
