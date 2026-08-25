-- Indexes used by the list APIs (sv = lospuentes, sf = terralta).
CREATE INDEX IF NOT EXISTS movies_sv_true_idx ON movies (publish_date DESC) WHERE sv = true;
CREATE INDEX IF NOT EXISTS movies_sf_true_idx ON movies (publish_date DESC) WHERE sf = true;

ALTER TABLE movies DROP CONSTRAINT IF EXISTS movies_modified_check;
ALTER TABLE movies ADD CONSTRAINT movies_modified_check
  CHECK (modified IN ('yes', 'no', 'unsuitable'));

ALTER TABLE movies DROP CONSTRAINT IF EXISTS movies_type_check;
ALTER TABLE movies ADD CONSTRAINT movies_type_check
  CHECK (type IN ('movie', 'series'));

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_scope_check;
ALTER TABLE users ADD CONSTRAINT users_scope_check
  CHECK (scope IN ('lospuentes', 'terralta', 'admin'));
