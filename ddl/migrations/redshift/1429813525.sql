BEGIN;

CREATE TABLE adgroups
(
    id INTEGER IDENTITY(1,1) NOT NULL,
    created_at TIMESTAMP DEFAULT SYSDATE NOT NULL,
    locale VARCHAR(14) NOT NULL,
    PRIMARY KEY (id)

);

CREATE TABLE adgroup_sites
(
    id INTEGER IDENTITY(1,1) NOT NULL,
    site VARCHAR(1024) NOT NULL,
    adgroup_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT SYSDATE NOT NULL,
    FOREIGN KEY (adgroup_id) REFERENCES adgroups (id),
    PRIMARY KEY (id)

);

ALTER TABLE tiles ADD COLUMN adgroup_id INT;
ALTER TABLE tiles ADD FOREIGN KEY (adgroup_id) REFERENCES adgroups (id);

-- initialize the adgroups table
INSERT INTO adgroups (locale) SELECT locale FROM tiles ORDER BY id;
UPDATE tiles SET adgroup_id = id;

COMMIT;
