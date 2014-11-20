BEGIN;

CREATE TABLE channels (
    id INTEGER IDENTITY(1,1) NOT NULL, 
    name VARCHAR(16) NOT NULL, 
    PRIMARY KEY (id)
);

ALTER TABLE distributions ADD COLUMN channel_id INTEGER;

INSERT INTO channels(name) VALUES ('desktop');

INSERT INTO channels(name) VALUES ('android');

UPDATE distributions SET channel_id = (SELECT id FROM channels WHERE name = 'desktop');

COMMIT;
