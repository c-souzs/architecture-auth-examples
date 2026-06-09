-- =============================================
-- CUSTOMERS + ADDRESSES
-- user_id fixo: joao.silva=3, maria.souza=4 (ordem de inserção do auth-server V3)
-- =============================================

INSERT INTO customers (user_id, cpf, phone) VALUES
    (3, '12345678901', '11987654321'),
    (4, '98765432100', '21976543210');

INSERT INTO addresses (customer_id, street, number, complement, city, state, zip_code)
SELECT c.id, 'Rua das Flores', '123', 'Apto 42', 'São Paulo', 'SP', '01310100'
FROM customers c WHERE c.cpf = '12345678901';

INSERT INTO addresses (customer_id, street, number, complement, city, state, zip_code)
SELECT c.id, 'Av. Paulista', '1578', NULL, 'São Paulo', 'SP', '01310200'
FROM customers c WHERE c.cpf = '12345678901';

INSERT INTO addresses (customer_id, street, number, complement, city, state, zip_code)
SELECT c.id, 'Rua do Catete', '456', 'Bloco B', 'Rio de Janeiro', 'RJ', '22220010'
FROM customers c WHERE c.cpf = '98765432100';

-- =============================================
-- CATEGORIES
-- =============================================

INSERT INTO categories (name, description) VALUES
    ('Eletrônicos',    'Smartphones, notebooks, periféricos e acessórios tecnológicos'),
    ('Roupas',         'Vestuário masculino, feminino e infantil'),
    ('Alimentos',      'Produtos alimentícios e mercearia'),
    ('Bebidas',        'Bebidas alcoólicas e não alcoólicas'),
    ('Casa e Jardim',  'Decoração, utensílios domésticos e jardinagem');

-- =============================================
-- PRODUCTS
-- =============================================

INSERT INTO products (name, description, price, status, category_id)
SELECT 'Notebook Dell Inspiron 15', 'Intel i7, 16GB RAM, SSD 512GB, Windows 11', 3899.99, 'ACTIVE', id
FROM categories WHERE name = 'Eletrônicos';

INSERT INTO products (name, description, price, status, category_id)
SELECT 'Smartphone Samsung Galaxy S24', 'Tela 6.2", 256GB, câmera 50MP', 2499.90, 'ACTIVE', id
FROM categories WHERE name = 'Eletrônicos';

INSERT INTO products (name, description, price, status, category_id)
SELECT 'Fone Sony WH-1000XM5', 'Cancelamento de ruído ativo, Bluetooth 5.2', 1249.00, 'ACTIVE', id
FROM categories WHERE name = 'Eletrônicos';

INSERT INTO products (name, description, price, status, category_id)
SELECT 'Monitor LG 27" 4K', 'IPS, 144Hz, HDR400, USB-C', 2199.00, 'INACTIVE', id
FROM categories WHERE name = 'Eletrônicos';

INSERT INTO products (name, description, price, status, category_id)
SELECT 'Camiseta Algodão Premium', 'Algodão 100%, disponível em P, M, G, GG', 59.90, 'ACTIVE', id
FROM categories WHERE name = 'Roupas';

INSERT INTO products (name, description, price, status, category_id)
SELECT 'Calça Jeans Slim', 'Jeans elastano, corte slim fit', 149.90, 'ACTIVE', id
FROM categories WHERE name = 'Roupas';

INSERT INTO products (name, description, price, status, category_id)
SELECT 'Jaqueta Corta-Vento', 'Impermeável, capuz removível', 299.90, 'ACTIVE', id
FROM categories WHERE name = 'Roupas';

INSERT INTO products (name, description, price, status, category_id)
SELECT 'Arroz Branco Tipo 1 5kg', 'Arroz longo fino, tipo 1, pacote 5kg', 28.90, 'ACTIVE', id
FROM categories WHERE name = 'Alimentos';

INSERT INTO products (name, description, price, status, category_id)
SELECT 'Feijão Carioca 1kg', 'Feijão carioca selecionado, pacote 1kg', 9.90, 'ACTIVE', id
FROM categories WHERE name = 'Alimentos';

INSERT INTO products (name, description, price, status, category_id)
SELECT 'Macarrão Espaguete 500g', 'Massa de sêmola de trigo, 500g', 5.49, 'ACTIVE', id
FROM categories WHERE name = 'Alimentos';

INSERT INTO products (name, description, price, status, category_id)
SELECT 'Água Mineral 1.5L', 'Água mineral natural sem gás, 1.5 litros', 3.29, 'ACTIVE', id
FROM categories WHERE name = 'Bebidas';

INSERT INTO products (name, description, price, status, category_id)
SELECT 'Suco de Laranja Integral 1L', 'Suco 100% integral, sem adição de açúcar', 12.90, 'ACTIVE', id
FROM categories WHERE name = 'Bebidas';

INSERT INTO products (name, description, price, status, category_id)
SELECT 'Cerveja Artesanal IPA 355ml', 'IPA americana, lúpulo Cascade, 6.5% ABV', 18.90, 'ACTIVE', id
FROM categories WHERE name = 'Bebidas';

INSERT INTO products (name, description, price, status, category_id)
SELECT 'Luminária LED de Mesa', 'LED 12W, temperatura ajustável, USB', 89.90, 'ACTIVE', id
FROM categories WHERE name = 'Casa e Jardim';

INSERT INTO products (name, description, price, status, category_id)
SELECT 'Tapete Sala 2x3m', 'Pelo baixo, antiderrapante, lavável', 249.00, 'ACTIVE', id
FROM categories WHERE name = 'Casa e Jardim';

-- =============================================
-- STOCKS
-- =============================================

INSERT INTO stocks (product_id, quantity, min_quantity, status, updated_at)
SELECT id, 45,  5, 'REGULAR',       NOW() FROM products WHERE name = 'Notebook Dell Inspiron 15';

INSERT INTO stocks (product_id, quantity, min_quantity, status, updated_at)
SELECT id, 80, 10, 'REGULAR',       NOW() FROM products WHERE name = 'Smartphone Samsung Galaxy S24';

INSERT INTO stocks (product_id, quantity, min_quantity, status, updated_at)
SELECT id,  3,  5, 'LOW_STOCK',     NOW() FROM products WHERE name = 'Fone Sony WH-1000XM5';

INSERT INTO stocks (product_id, quantity, min_quantity, status, updated_at)
SELECT id,  0,  5, 'PENDING_COUNT', NOW() FROM products WHERE name = 'Monitor LG 27" 4K';

INSERT INTO stocks (product_id, quantity, min_quantity, status, updated_at)
SELECT id, 200, 20, 'REGULAR',  NOW() FROM products WHERE name = 'Camiseta Algodão Premium';

INSERT INTO stocks (product_id, quantity, min_quantity, status, updated_at)
SELECT id,  95, 15, 'REGULAR',  NOW() FROM products WHERE name = 'Calça Jeans Slim';

INSERT INTO stocks (product_id, quantity, min_quantity, status, updated_at)
SELECT id,   4, 10, 'LOW_STOCK', NOW() FROM products WHERE name = 'Jaqueta Corta-Vento';

INSERT INTO stocks (product_id, quantity, min_quantity, status, updated_at)
SELECT id, 500, 50, 'REGULAR', NOW() FROM products WHERE name = 'Arroz Branco Tipo 1 5kg';

INSERT INTO stocks (product_id, quantity, min_quantity, status, updated_at)
SELECT id, 350, 30, 'REGULAR', NOW() FROM products WHERE name = 'Feijão Carioca 1kg';

INSERT INTO stocks (product_id, quantity, min_quantity, status, updated_at)
SELECT id, 180, 25, 'REGULAR', NOW() FROM products WHERE name = 'Macarrão Espaguete 500g';

INSERT INTO stocks (product_id, quantity, min_quantity, status, updated_at)
SELECT id, 600, 100, 'REGULAR',   NOW() FROM products WHERE name = 'Água Mineral 1.5L';

INSERT INTO stocks (product_id, quantity, min_quantity, status, updated_at)
SELECT id,  12,  20, 'LOW_STOCK', NOW() FROM products WHERE name = 'Suco de Laranja Integral 1L';

INSERT INTO stocks (product_id, quantity, min_quantity, status, updated_at)
SELECT id, 240,  30, 'REGULAR',   NOW() FROM products WHERE name = 'Cerveja Artesanal IPA 355ml';

INSERT INTO stocks (product_id, quantity, min_quantity, status, updated_at)
SELECT id, 55, 10, 'REGULAR', NOW() FROM products WHERE name = 'Luminária LED de Mesa';

INSERT INTO stocks (product_id, quantity, min_quantity, status, updated_at)
SELECT id, 18,  5, 'REGULAR', NOW() FROM products WHERE name = 'Tapete Sala 2x3m';

-- =============================================
-- STOCK COUNTS
-- counted_by_user_id fixo: pedro.stock=5, ana.intern=6 (ordem de inserção do auth-server V3)
-- =============================================

INSERT INTO stock_counts (stock_id, counted_by_user_id, counted_quantity, counted_at)
SELECT s.id, 5, 45, NOW() - INTERVAL '2 days'
FROM stocks s JOIN products p ON s.product_id = p.id
WHERE p.name = 'Notebook Dell Inspiron 15';

INSERT INTO stock_counts (stock_id, counted_by_user_id, counted_quantity, counted_at)
SELECT s.id, 5, 3, NOW() - INTERVAL '1 day'
FROM stocks s JOIN products p ON s.product_id = p.id
WHERE p.name = 'Fone Sony WH-1000XM5';

INSERT INTO stock_counts (stock_id, counted_by_user_id, counted_quantity, counted_at)
SELECT s.id, 6, 200, NOW() - INTERVAL '5 days'
FROM stocks s JOIN products p ON s.product_id = p.id
WHERE p.name = 'Camiseta Algodão Premium';

-- =============================================
-- ORDERS — João Silva (customer_id=1, cpf=12345678901)
-- =============================================

-- Pedido 1: DELIVERED
INSERT INTO orders (customer_id, status, total_amount, created_at)
SELECT id, 'DELIVERED', 3959.89, NOW() - INTERVAL '15 days'
FROM customers WHERE cpf = '12345678901';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 3899.99
FROM orders o, products p, customers c
WHERE o.customer_id = c.id AND c.cpf = '12345678901'
  AND o.status = 'DELIVERED'
  AND p.name = 'Notebook Dell Inspiron 15';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 59.90
FROM orders o, products p, customers c
WHERE o.customer_id = c.id AND c.cpf = '12345678901'
  AND o.status = 'DELIVERED'
  AND p.name = 'Camiseta Algodão Premium';

INSERT INTO payments (order_id, status, method, amount, transaction_id)
SELECT o.id, 'CONFIRMED', 'CREDIT_CARD', 3959.89, 'TXN-2024-00001'
FROM orders o, customers c
WHERE o.customer_id = c.id AND c.cpf = '12345678901' AND o.status = 'DELIVERED';

INSERT INTO deliveries (order_id, status, delivery_address, tracking_code, estimated_delivery)
SELECT o.id, 'DELIVERED', 'Rua das Flores, 123, Apto 42 - São Paulo/SP - CEP 01310-100', 'BR123456789BR', NOW()::DATE - 2
FROM orders o, customers c
WHERE o.customer_id = c.id AND c.cpf = '12345678901' AND o.status = 'DELIVERED';

-- Pedido 2: SHIPPED
INSERT INTO orders (customer_id, status, total_amount, created_at)
SELECT id, 'SHIPPED', 2499.90, NOW() - INTERVAL '5 days'
FROM customers WHERE cpf = '12345678901';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 2499.90
FROM orders o, products p, customers c
WHERE o.customer_id = c.id AND c.cpf = '12345678901'
  AND o.status = 'SHIPPED'
  AND p.name = 'Smartphone Samsung Galaxy S24';

INSERT INTO payments (order_id, status, method, amount, transaction_id)
SELECT o.id, 'CONFIRMED', 'PIX', 2499.90, 'TXN-2024-00002'
FROM orders o, customers c
WHERE o.customer_id = c.id AND c.cpf = '12345678901' AND o.status = 'SHIPPED';

INSERT INTO deliveries (order_id, status, delivery_address, tracking_code, estimated_delivery)
SELECT o.id, 'SHIPPED', 'Av. Paulista, 1578 - São Paulo/SP - CEP 01310-200', 'BR987654321BR', NOW()::DATE + 3
FROM orders o, customers c
WHERE o.customer_id = c.id AND c.cpf = '12345678901' AND o.status = 'SHIPPED';

-- Pedido 3: PENDING
INSERT INTO orders (customer_id, status, total_amount, created_at)
SELECT id, 'PENDING', 338.70, NOW() - INTERVAL '1 hour'
FROM customers WHERE cpf = '12345678901';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 3, 9.90
FROM orders o, products p, customers c
WHERE o.customer_id = c.id AND c.cpf = '12345678901'
  AND o.status = 'PENDING'
  AND p.name = 'Feijão Carioca 1kg';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 10, 28.90
FROM orders o, products p, customers c
WHERE o.customer_id = c.id AND c.cpf = '12345678901'
  AND o.status = 'PENDING'
  AND p.name = 'Arroz Branco Tipo 1 5kg';

INSERT INTO deliveries (order_id, status, delivery_address, tracking_code, estimated_delivery)
SELECT o.id, 'PENDING', 'Rua das Flores, 123, Apto 42 - São Paulo/SP - CEP 01310-100', NULL, NULL
FROM orders o, customers c
WHERE o.customer_id = c.id AND c.cpf = '12345678901' AND o.status = 'PENDING';

-- =============================================
-- ORDERS — Maria Souza (customer_id=2, cpf=98765432100)
-- =============================================

-- Pedido 1: PAYMENT_CONFIRMED
INSERT INTO orders (customer_id, status, total_amount, created_at)
SELECT id, 'PAYMENT_CONFIRMED', 1338.90, NOW() - INTERVAL '2 days'
FROM customers WHERE cpf = '98765432100';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 1249.00
FROM orders o, products p, customers c
WHERE o.customer_id = c.id AND c.cpf = '98765432100'
  AND o.status = 'PAYMENT_CONFIRMED'
  AND p.name = 'Fone Sony WH-1000XM5';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 89.90
FROM orders o, products p, customers c
WHERE o.customer_id = c.id AND c.cpf = '98765432100'
  AND o.status = 'PAYMENT_CONFIRMED'
  AND p.name = 'Luminária LED de Mesa';

INSERT INTO payments (order_id, status, method, amount, transaction_id)
SELECT o.id, 'CONFIRMED', 'DEBIT_CARD', 1338.90, 'TXN-2024-00003'
FROM orders o, customers c
WHERE o.customer_id = c.id AND c.cpf = '98765432100' AND o.status = 'PAYMENT_CONFIRMED';

INSERT INTO deliveries (order_id, status, delivery_address, tracking_code, estimated_delivery)
SELECT o.id, 'PENDING', 'Rua do Catete, 456, Bloco B - Rio de Janeiro/RJ - CEP 22220-010', NULL, NOW()::DATE + 7
FROM orders o, customers c
WHERE o.customer_id = c.id AND c.cpf = '98765432100' AND o.status = 'PAYMENT_CONFIRMED';

-- Pedido 2: CANCELLED
INSERT INTO orders (customer_id, status, total_amount, created_at)
SELECT id, 'CANCELLED', 149.90, NOW() - INTERVAL '10 days'
FROM customers WHERE cpf = '98765432100';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 149.90
FROM orders o, products p, customers c
WHERE o.customer_id = c.id AND c.cpf = '98765432100'
  AND o.status = 'CANCELLED'
  AND p.name = 'Calça Jeans Slim';

INSERT INTO deliveries (order_id, status, delivery_address, tracking_code, estimated_delivery)
SELECT o.id, 'PENDING', 'Rua do Catete, 456, Bloco B - Rio de Janeiro/RJ - CEP 22220-010', NULL, NULL
FROM orders o, customers c
WHERE o.customer_id = c.id AND c.cpf = '98765432100' AND o.status = 'CANCELLED';
