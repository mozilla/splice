BEGIN;

CREATE TABLE domains (
    id INTEGER IDENTITY(1,1) NOT NULL,
    domain VARCHAR(64) NOT NULL,
    rank INTEGER NOT NULL,
    meta_description VARCHAR(512),
    title VARCHAR(512),
    PRIMARY KEY (id)
);

CREATE TYPE SITE_DATA_SOURCE ("SimilarSites", "Alexa");

CREATE TABLE related_domains (
    domain_id INTEGER, 
    related_id INTEGER,
    data_source SITE_DATA_SOURCE,
    weight FLOAT DEFAULT '1' NOT NULL,
    FOREIGN KEY(domain_id) REFERENCES domains (id),
    FOREIGN KEY(related_id) REFERENCES domains (id)
);

CREATE TABLE comscore (
    domain_id INTEGER,
    rank INTEGER NOT NULL,
    reach FLOAT NOT NULL,
    users FLOAT NOT NULL,
    visits FLOAT NOT NULL,
    pages FLOAT NOT NULL,
    FOREIGN KEY(domain_id) REFERENCES domains (id)
);

CREATE TYPE FIT_DATA_MODEL ("LogRegression");

CREATE TABLE model (
  model FIT_DATA_MODEL DEFAULT "LogRegression" NOT NULL,
  slope FLOAT NOT NULL,
  intercept FLOAT NOT NULL,
  r_value FLOAT NOT NULL,
  p_value FLOAT NOT NULL,
  std_er FLOAT NOT NULL
);

COMMIT;

