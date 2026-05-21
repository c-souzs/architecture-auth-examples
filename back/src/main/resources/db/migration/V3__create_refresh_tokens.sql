CREATE TABLE refresh_tokens (
    id          BIGSERIAL       PRIMARY KEY,
    token_hash  VARCHAR(64)     NOT NULL UNIQUE,
    user_id     BIGINT          NOT NULL REFERENCES users(id),
    family      UUID            NOT NULL,
    used        BOOLEAN         NOT NULL DEFAULT FALSE,
    revoked     BOOLEAN         NOT NULL DEFAULT FALSE,
    expires_at  TIMESTAMPTZ     NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL
);

CREATE INDEX idx_refresh_tokens_family_revoked  ON refresh_tokens(family, revoked);
CREATE INDEX idx_refresh_tokens_user_revoked    ON refresh_tokens(user_id, revoked);
