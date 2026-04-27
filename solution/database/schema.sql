-- ============================================================
-- скрипт создания базы данных обувного магазина (sqlite)
-- ============================================================

-- таблица ролей
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    password_hash VARCHAR(255) NOT NULL
);

-- таблица категорий товаров
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- таблица производителей
CREATE TABLE IF NOT EXISTS manufacturers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- таблица поставщиков
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- таблица товаров
CREATE TABLE IF NOT EXISTS products (
    article VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    manufacturer_id INTEGER NOT NULL REFERENCES manufacturers(id),
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    category_id INTEGER NOT NULL REFERENCES categories(id),
    unit VARCHAR(50) NOT NULL DEFAULT 'шт',
    price NUMERIC(10,2) NOT NULL,
    discount_percent INTEGER NOT NULL DEFAULT 0,
    stock_count INTEGER NOT NULL DEFAULT 0,
    image_path VARCHAR(500)
);

-- таблица заказов
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at DATE NOT NULL,
    delivery_date DATE NOT NULL,
    pickup_code INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new'
);

-- таблица позиций заказа
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_article VARCHAR(50) NOT NULL REFERENCES products(article),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL
);

-- индексы для ускорения запросов
CREATE INDEX IF NOT EXISTS idx_users_login ON users(login);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_article);
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
