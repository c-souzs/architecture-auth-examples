CREATE TABLE authorities (
    id      BIGSERIAL    PRIMARY KEY,
    name    VARCHAR(50)  NOT NULL UNIQUE
);

CREATE TABLE roles (
    id      BIGSERIAL    PRIMARY KEY,
    name    VARCHAR(30)  NOT NULL UNIQUE
);

CREATE TABLE role_authorities (
    role_id         BIGINT NOT NULL REFERENCES roles(id),
    authority_id    BIGINT NOT NULL REFERENCES authorities(id),
    PRIMARY KEY (role_id, authority_id)
);

CREATE TABLE users (
    id          BIGSERIAL       PRIMARY KEY,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    name        VARCHAR(100)    NOT NULL,
    enabled     BOOLEAN         NOT NULL DEFAULT TRUE,
    locked      BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ     NOT NULL
);

CREATE TABLE user_roles (
    user_id     BIGINT NOT NULL REFERENCES users(id),
    role_id     BIGINT NOT NULL REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);
