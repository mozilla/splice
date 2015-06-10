ALTER TABLE adgroups ADD COLUMN channel_id INTEGER;
ALTER TABLE adgroups ADD FOREIGN KEY(channel_id) REFERENCES channels (id);
