-- migrate:up

CREATE TABLE IF NOT EXISTS telegram_users (
    id BIGINT NOT NULL UNIQUE PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    telegram_user BIGINT NOT NULL REFERENCES telegram_users(id) ON DELETE CASCADE,
    tag TEXT NOT NULL
);

-- migrate:down

DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS telegram_users;
