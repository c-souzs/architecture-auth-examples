-- pgcrypto: crypt() com Blowfish gera hash $2a$12$... compatível com BCryptPasswordEncoder
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- USERS  (senha: senha123)
-- IDs gerados na ordem: admin=1, manager=2, joao=3, maria=4, pedro=5, ana=6
-- =============================================

INSERT INTO users (email, password, name, enabled, locked, created_at) VALUES
    ('admin@test.com',        crypt('senha123', gen_salt('bf', 12)), 'Admin Sistema',    true, false, NOW()),
    ('manager@test.com',      crypt('senha123', gen_salt('bf', 12)), 'Carlos Gerente',   true, false, NOW()),
    ('joao.silva@test.com',   crypt('senha123', gen_salt('bf', 12)), 'João Silva',        true, false, NOW()),
    ('maria.souza@test.com',  crypt('senha123', gen_salt('bf', 12)), 'Maria Souza',       true, false, NOW()),
    ('pedro.stock@test.com',  crypt('senha123', gen_salt('bf', 12)), 'Pedro Estoque',    true, false, NOW()),
    ('ana.intern@test.com',   crypt('senha123', gen_salt('bf', 12)), 'Ana Internista',   true, false, NOW());

-- =============================================
-- USER → ROLES
-- =============================================

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE
    (u.email = 'admin@test.com'       AND r.name = 'ADMIN')         OR
    (u.email = 'manager@test.com'     AND r.name = 'MANAGER')       OR
    (u.email = 'joao.silva@test.com'  AND r.name = 'CUSTOMER')      OR
    (u.email = 'maria.souza@test.com' AND r.name = 'CUSTOMER')      OR
    (u.email = 'pedro.stock@test.com' AND r.name = 'STOCK_MANAGER') OR
    (u.email = 'ana.intern@test.com'  AND r.name = 'STOCK_INTERN');
