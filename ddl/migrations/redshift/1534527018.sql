BEGIN;

CREATE TABLE watchdog_proxy_events_daily (
    receive_at TIMESTAMP WITHOUT TIME ZONE NOT NULL ENCODE ZSTD, 
    date DATE NOT NULL ENCODE ZSTD, 
    event VARCHAR(64) NOT NULL ENCODE ZSTD, 
    consumer_name VARCHAR(128) ENCODE ZSTD, 
    watchdog_id VARCHAR(128) ENCODE ZSTD, 
    type VARCHAR(64) ENCODE ZSTD, 
    poller_id VARCHAR(128) ENCODE ZSTD, 
    items_in_queue INTEGER ENCODE ZSTD, 
    items_in_progress INTEGER ENCODE ZSTD, 
    items_in_waiting INTEGER ENCODE ZSTD, 
    photodna_tracking_id VARCHAR(128) ENCODE ZSTD, 
    worker_id VARCHAR(128) ENCODE ZSTD, 
    is_match BOOLEAN ENCODE BYTEDICT, 
    is_error BOOLEAN ENCODE BYTEDICT, 
    timing_sent INTEGER ENCODE ZSTD, 
    timing_received INTEGER ENCODE ZSTD, 
    timing_submitted INTEGER ENCODE ZSTD,
    sample_id SMALLINT NOT NULL DEFAULT (random() * 100) ENCODE ZSTD
)
SORTKEY (date, event);

COMMIT;
