-- =============================================
-- AUTH
-- =============================================

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

-- =============================================
-- CUSTOMER
-- =============================================

CREATE TABLE customers (
    id      BIGSERIAL   PRIMARY KEY,
    user_id BIGINT      NOT NULL UNIQUE REFERENCES users(id),
    cpf     VARCHAR(11) NOT NULL UNIQUE,
    phone   VARCHAR(15)
);

CREATE TABLE addresses (
    id          BIGSERIAL       PRIMARY KEY,
    customer_id BIGINT          NOT NULL REFERENCES customers(id),
    street      VARCHAR(200)    NOT NULL,
    number      VARCHAR(10)     NOT NULL,
    complement  VARCHAR(100),
    city        VARCHAR(100)    NOT NULL,
    state       VARCHAR(2)      NOT NULL,
    zip_code    VARCHAR(8)      NOT NULL
);

-- =============================================
-- CATALOG
-- =============================================

CREATE TABLE categories (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL UNIQUE,
    description VARCHAR(300)
);

CREATE TABLE products (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(150)    NOT NULL,
    description VARCHAR(500),
    price       NUMERIC(19, 2)  NOT NULL,
    status      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    category_id BIGINT          NOT NULL REFERENCES categories(id)
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status   ON products(status);

-- =============================================
-- STOCK
-- =============================================

CREATE TABLE stocks (
    id              BIGSERIAL   PRIMARY KEY,
    product_id      BIGINT      NOT NULL UNIQUE REFERENCES products(id),
    quantity        INTEGER     NOT NULL DEFAULT 0,
    min_quantity    INTEGER     NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING_COUNT',
    updated_at      TIMESTAMPTZ NOT NULL
);

CREATE TABLE stock_counts (
    id                  BIGSERIAL   PRIMARY KEY,
    stock_id            BIGINT      NOT NULL REFERENCES stocks(id),
    counted_by_user_id  BIGINT      NOT NULL REFERENCES users(id),
    counted_quantity    INTEGER     NOT NULL,
    counted_at          TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_stock_counts_stock ON stock_counts(stock_id);

-- =============================================
-- COMMERCE
-- =============================================

CREATE TABLE orders (
    id              BIGSERIAL       PRIMARY KEY,
    customer_id     BIGINT          NOT NULL REFERENCES customers(id),
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    total_amount    NUMERIC(19, 2)  NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status   ON orders(status);

CREATE TABLE order_items (
    id          BIGSERIAL       PRIMARY KEY,
    order_id    BIGINT          NOT NULL REFERENCES orders(id),
    product_id  BIGINT          NOT NULL REFERENCES products(id),
    quantity    INTEGER         NOT NULL,
    unit_price  NUMERIC(19, 2)  NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE payments (
    id              BIGSERIAL       PRIMARY KEY,
    order_id        BIGINT          NOT NULL UNIQUE REFERENCES orders(id),
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    method          VARCHAR(20)     NOT NULL,
    amount          NUMERIC(19, 2)  NOT NULL,
    transaction_id  VARCHAR(100)
);

CREATE TABLE deliveries (
    id                  BIGSERIAL       PRIMARY KEY,
    order_id            BIGINT          NOT NULL UNIQUE REFERENCES orders(id),
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    delivery_address    VARCHAR(400)    NOT NULL,
    tracking_code       VARCHAR(50),
    estimated_delivery  DATE
);
