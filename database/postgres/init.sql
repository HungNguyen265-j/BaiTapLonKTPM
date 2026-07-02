-- Create databases for each microservice
CREATE DATABASE salehub;

\c salehub;

-- =============================================
-- Product Service Schema
-- =============================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    image VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo VARCHAR(500),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    brand_id UUID REFERENCES brands(id),
    base_price DECIMAL(15,0) NOT NULL,
    sale_price DECIMAL(15,0),
    unit VARCHAR(20) DEFAULT 'cái',
    weight DECIMAL(10,2),
    images JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'DRAFT',
    channel_settings JSONB DEFAULT '{}',
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 0
);

CREATE TABLE product_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    channel VARCHAR(20) NOT NULL,
    channel_product_id VARCHAR(255),
    channel_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    sync_status VARCHAR(20) DEFAULT 'PENDING',
    last_sync_at TIMESTAMP,
    channel_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, channel)
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('simple', name));
CREATE INDEX idx_product_channels_product ON product_channels(product_id);
CREATE INDEX idx_product_channels_channel ON product_channels(channel);

-- =============================================
-- Inventory Service Schema
-- =============================================

CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    sku VARCHAR(50) NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    quantity_on_hand INTEGER DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    quantity_available INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    location_bin VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    version INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, warehouse_id)
);

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    sku VARCHAR(50) NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    transaction_type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(20),
    reference_id UUID,
    note TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    sku VARCHAR(50) NOT NULL,
    warehouse_id UUID REFERENCES warehouses(id),
    alert_type VARCHAR(20) NOT NULL,
    threshold INTEGER,
    current_quantity INTEGER,
    status VARCHAR(20) DEFAULT 'PENDING',
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventories_product ON inventories(product_id);
CREATE INDEX idx_inventories_warehouse ON inventories(warehouse_id);
CREATE INDEX idx_inventories_sku ON inventories(sku);
CREATE INDEX idx_inventory_transactions_product ON inventory_transactions(product_id);

-- =============================================
-- Order Service Schema
-- =============================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    source VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    channel_order_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    subtotal DECIMAL(15,0) DEFAULT 0,
    discount_amount DECIMAL(15,0) DEFAULT 0,
    shipping_fee DECIMAL(15,0) DEFAULT 0,
    tax_amount DECIMAL(15,0) DEFAULT 0,
    total_amount DECIMAL(15,0) DEFAULT 0,
    payment_method VARCHAR(20),
    payment_status VARCHAR(20) DEFAULT 'UNPAID',
    notes TEXT,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    product_id UUID,
    sku VARCHAR(50) NOT NULL,
    product_name VARCHAR(500) NOT NULL,
    image_url VARCHAR(500),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,0) NOT NULL,
    discount_amount DECIMAL(15,0) DEFAULT 0,
    total_price DECIMAL(15,0) NOT NULL,
    attributes JSONB DEFAULT '{}'
);

CREATE TABLE order_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by VARCHAR(100),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    payment_method VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(255),
    amount DECIMAL(15,0) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    paid_at TIMESTAMP,
    gateway_response JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_code ON orders(order_code);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_source ON orders(source);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- =============================================
-- Customer Service Schema
-- =============================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    gender VARCHAR(10),
    birthday DATE,
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    avatar VARCHAR(500),
    tier VARCHAR(20) DEFAULT 'BRONZE',
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(15,0) DEFAULT 0,
    total_returns INTEGER DEFAULT 0,
    source VARCHAR(20) DEFAULT 'MANUAL',
    tags JSONB DEFAULT '[]',
    notes TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    label VARCHAR(50),
    receiver_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    type VARCHAR(20) NOT NULL,
    content TEXT,
    channel VARCHAR(20),
    handled_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_tier ON customers(tier);
CREATE INDEX idx_customers_status ON customers(status);

-- =============================================
-- Promotion Service Schema
-- =============================================

CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(15,0),
    max_discount DECIMAL(15,0),
    min_order_value DECIMAL(15,0) DEFAULT 0,
    usage_limit INTEGER DEFAULT 0,
    usage_per_customer INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    applicable_channels JSONB DEFAULT '[]',
    applicable_products JSONB DEFAULT '[]',
    applicable_categories JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'DRAFT',
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 0
);

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID REFERENCES promotions(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID,
    assigned_at TIMESTAMP,
    used_at TIMESTAMP,
    used_in_order_id UUID,
    status VARCHAR(20) DEFAULT 'AVAILABLE'
);

CREATE TABLE flash_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_status ON promotions(status);
CREATE INDEX idx_promotions_date ON promotions(start_date, end_date);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_customer ON coupons(customer_id);

-- =============================================
-- Shipping Service Schema
-- =============================================

CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    order_code VARCHAR(50) NOT NULL,
    carrier VARCHAR(30) NOT NULL,
    tracking_code VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING',
    sender_name VARCHAR(255),
    sender_phone VARCHAR(20),
    sender_address TEXT,
    receiver_name VARCHAR(255) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    receiver_address TEXT NOT NULL,
    from_city VARCHAR(100),
    from_district VARCHAR(100),
    to_city VARCHAR(100) NOT NULL,
    to_district VARCHAR(100),
    weight DECIMAL(10,2),
    cod_amount DECIMAL(15,0) DEFAULT 0,
    shipping_fee DECIMAL(15,0) DEFAULT 0,
    estimated_delivery DATE,
    actual_delivery DATE,
    note TEXT,
    carrier_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE carrier_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier VARCHAR(30) NOT NULL UNIQUE,
    api_key TEXT,
    api_secret TEXT,
    endpoint_url VARCHAR(500),
    callback_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    config_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_code);
CREATE INDEX idx_shipments_carrier_status ON shipments(carrier, status);

-- =============================================
-- Report Service Schema
-- =============================================

CREATE TABLE revenue_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE NOT NULL,
    channel VARCHAR(20) NOT NULL,
    revenue DECIMAL(15,0) DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    product_count INTEGER DEFAULT 0,
    average_order_value DECIMAL(15,0) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(report_date, channel)
);

CREATE TABLE top_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID,
    product_name VARCHAR(500),
    sku VARCHAR(50),
    channel VARCHAR(20),
    quantity_sold INTEGER DEFAULT 0,
    revenue DECIMAL(15,0) DEFAULT 0,
    report_date DATE NOT NULL
);

CREATE INDEX idx_revenue_reports_date ON revenue_reports(report_date);
CREATE INDEX idx_revenue_reports_channel ON revenue_reports(channel);
CREATE INDEX idx_top_products_date ON top_products(report_date);
