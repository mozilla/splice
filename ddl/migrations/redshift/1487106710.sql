BEGIN;

CREATE TABLE ping_centre_test_pilot (
    client_id VARCHAR(64) NOT NULL, 
    event_type VARCHAR(64) NOT NULL, 
    object VARCHAR(64), 
    client_time INTEGER NOT NULL, 
    variants VARCHAR(64), 
    addon_id VARCHAR(64) NOT NULL, 
    addon_version VARCHAR(64) NOT NULL, 
    firefox_version VARCHAR(64) NOT NULL, 
    receive_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    date DATE NOT NULL, 
    os_name VARCHAR(64) NOT NULL, 
    os_version VARCHAR(64) NOT NULL, 
    locale VARCHAR(14) NOT NULL, 
    raw VARCHAR(4096) NOT NULL
);

COMMIT;
