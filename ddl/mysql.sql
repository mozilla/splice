CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL
);

-- Running upgrade None -> ec84b5b14c2

CREATE TABLE distributions (
    id INTEGER NOT NULL AUTO_INCREMENT, 
    payload TEXT NOT NULL, 
    created_at DATETIME NOT NULL, 
    PRIMARY KEY (id)
);

CREATE INDEX ix_distributions_created_at ON distributions (created_at);

INSERT INTO alembic_version (version_num) VALUES ('ec84b5b14c2');

