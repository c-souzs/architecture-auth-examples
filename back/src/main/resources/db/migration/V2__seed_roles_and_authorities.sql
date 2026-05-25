-- =============================================
-- AUTHORITIES
-- =============================================

INSERT INTO authorities (name) VALUES
    ('user:read'),
    ('user:write'),
    ('user:delete'),
    ('product:read'),
    ('product:write'),
    ('product:delete'),
    ('category:read'),
    ('category:write'),
    ('category:delete'),
    ('order:read'),
    ('order:write'),
    ('order:cancel'),
    ('order:manage'),
    ('payment:read'),
    ('payment:manage'),
    ('delivery:read'),
    ('delivery:manage'),
    ('customer:read'),
    ('customer:write'),
    ('customer:delete'),
    ('stock:read'),
    ('stock:write'),
    ('stock:count'),
    ('stock:validate'),
    ('report:read'),
    ('product:catalog'),
    ('order:own');

-- =============================================
-- ROLES
-- =============================================

INSERT INTO roles (name) VALUES
    ('ADMIN'),
    ('MANAGER'),
    ('CUSTOMER'),
    ('STOCK_MANAGER'),
    ('STOCK_INTERN');

-- =============================================
-- ROLE → AUTHORITIES
-- =============================================

-- ADMIN: todas as authorities
INSERT INTO role_authorities (role_id, authority_id)
SELECT r.id, a.id FROM roles r CROSS JOIN authorities a
WHERE r.name = 'ADMIN';

-- MANAGER
INSERT INTO role_authorities (role_id, authority_id)
SELECT r.id, a.id FROM roles r, authorities a
WHERE r.name = 'MANAGER' AND a.name IN (
    'product:read', 'product:write', 'product:delete',
    'category:read', 'category:write', 'category:delete',
    'order:read', 'order:manage',
    'payment:read', 'payment:manage',
    'delivery:read', 'delivery:manage',
    'stock:read',
    'report:read'
);

-- CUSTOMER
INSERT INTO role_authorities (role_id, authority_id)
SELECT r.id, a.id FROM roles r, authorities a
WHERE r.name = 'CUSTOMER' AND a.name IN (
    'product:catalog',
    'order:own',
    'payment:read',
    'delivery:read'
);

-- STOCK_MANAGER
INSERT INTO role_authorities (role_id, authority_id)
SELECT r.id, a.id FROM roles r, authorities a
WHERE r.name = 'STOCK_MANAGER' AND a.name IN (
    'product:read', 'product:write',
    'category:read', 'category:write', 'category:delete',
    'stock:read', 'stock:write', 'stock:validate'
);

-- STOCK_INTERN
INSERT INTO role_authorities (role_id, authority_id)
SELECT r.id, a.id FROM roles r, authorities a
WHERE r.name = 'STOCK_INTERN' AND a.name IN (
    'stock:read', 'stock:count'
);
