-- =============================================
-- Seed Data for Multi-Channel Sales Management
-- =============================================

\c salehub;

-- =============================================
-- Warehouses
-- =============================================
INSERT INTO warehouses (id, name, code, address, city, district, ward, contact_person, contact_phone, status) VALUES
    (gen_random_uuid(), 'Kho Hà Nội', 'HN-001', 'Số 123 Nguyễn Trãi, Quận Thanh Xuân', 'Hà Nội', 'Thanh Xuân', 'Phường Hạ Đình', 'Nguyễn Văn A', '0987654321', 'ACTIVE'),
    (gen_random_uuid(), 'Kho TP. HCM', 'HCM-001', 'Số 456 Lê Văn Việt, Quận 9', 'TP. Hồ Chí Minh', 'Quận 9', 'Phường Tăng Nhơn Phú A', 'Trần Thị B', '0987654322', 'ACTIVE'),
    (gen_random_uuid(), 'Kho Đà Nẵng', 'DN-001', 'Số 789 Nguyễn Hữu Thọ, Quận Cẩm Lệ', 'Đà Nẵng', 'Cẩm Lệ', 'Phường Khuê Trung', 'Lê Văn C', '0987654323', 'ACTIVE');

-- =============================================
-- Categories
-- =============================================
INSERT INTO categories (id, name, slug, description, sort_order, status) VALUES
    (gen_random_uuid(), 'Thời trang', 'thoi-trang', 'Quần áo, trang phục thời trang nam nữ', 1, 'ACTIVE'),
    (gen_random_uuid(), 'Giày dép', 'giay-dep', 'Giày, dép, sandal các loại', 2, 'ACTIVE'),
    (gen_random_uuid(), 'Phụ kiện', 'phu-kien', 'Phụ kiện thời trang, túi xách, đồng hồ', 3, 'ACTIVE'),
    (gen_random_uuid(), 'Điện tử', 'dien-tu', 'Thiết bị điện tử, phụ kiện công nghệ', 4, 'ACTIVE');

-- =============================================
-- Brands
-- =============================================
INSERT INTO brands (id, name, slug, description, status) VALUES
    (gen_random_uuid(), 'Brand A', 'brand-a', 'Thương hiệu thời trang cao cấp Brand A', 'ACTIVE'),
    (gen_random_uuid(), 'Brand B', 'brand-b', 'Thương hiệu phụ kiện và giày dép Brand B', 'ACTIVE');

-- =============================================
-- Products
-- =============================================
INSERT INTO products (id, sku, name, slug, description, category_id, brand_id, base_price, sale_price, unit, weight, images, tags, status, channel_settings) VALUES
    (
        gen_random_uuid(), 'SP0001', 'Áo thun nam cổ tròn tay ngắn', 'ao-thun-nam-co-tron-tay-ngan',
        'Áo thun nam chất liệu cotton 100% cao cấp, thấm hút mồ hôi tốt, phù hợp mặc hàng ngày',
        (SELECT id FROM categories WHERE slug = 'thoi-trang'),
        (SELECT id FROM brands WHERE slug = 'brand-a'),
        199000, 149000, 'cái', 0.25,
        '[]', '["áo thun", "thời trang nam", "cotton"]', 'ACTIVE',
        '{"shopee": {"enable": true}, "tiktok": {"enable": false}}'
    ),
    (
        gen_random_uuid(), 'SP0002', 'Quần jeans nam ống slim', 'quan-jeans-nam-ong-slim',
        'Quần jeans nam phong cách Hàn Quốc, ống slim ôm nhẹ, co giãn thoải mái',
        (SELECT id FROM categories WHERE slug = 'thoi-trang'),
        (SELECT id FROM brands WHERE slug = 'brand-a'),
        450000, 379000, 'cái', 0.45,
        '[]', '["quần jeans", "thời trang nam", "slim fit"]', 'ACTIVE',
        '{"shopee": {"enable": true}, "tiktok": {"enable": true}}'
    ),
    (
        gen_random_uuid(), 'SP0003', 'Giày thể thao nam nữ', 'giay-the-thao-nam-nu',
        'Giày thể thao unisex phong cách năng động, đế êm chống trượt, phù hợp đi chơi và tập luyện',
        (SELECT id FROM categories WHERE slug = 'giay-dep'),
        (SELECT id FROM brands WHERE slug = 'brand-b'),
        550000, 429000, 'đôi', 0.60,
        '[]', '["giày thể thao", "unisex", "năng động"]', 'ACTIVE',
        '{"shopee": {"enable": true}, "tiktok": {"enable": true}}'
    ),
    (
        gen_random_uuid(), 'SP0004', 'Sandal nữ quai ngang', 'sandal-nu-quai-ngang',
        'Sandal nữ thời trang, quai ngang mảnh, đế bệt êm chân, phù hợp dạo phố',
        (SELECT id FROM categories WHERE slug = 'giay-dep'),
        (SELECT id FROM brands WHERE slug = 'brand-b'),
        280000, 219000, 'đôi', 0.30,
        '[]', '["sandal", "thời trang nữ", "đế bệt"]', 'ACTIVE',
        '{"shopee": {"enable": true}, "tiktok": {"enable": false}}'
    ),
    (
        gen_random_uuid(), 'SP0005', 'Túi đeo chéo nam nữ thời trang', 'tui-deo-cheo-nam-nu',
        'Túi đeo chéo đa năng, chất liệu vải dù chống thấm, nhiều ngăn tiện lợi',
        (SELECT id FROM categories WHERE slug = 'phu-kien'),
        (SELECT id FROM brands WHERE slug = 'brand-b'),
        350000, 279000, 'cái', 0.35,
        '[]', '["túi đeo chéo", "phụ kiện", "đa năng"]', 'ACTIVE',
        '{"shopee": {"enable": true}, "tiktok": {"enable": true}}'
    ),
    (
        gen_random_uuid(), 'SP0006', 'Tai nghe Bluetooth không dây', 'tai-nghe-bluetooth-khong-day',
        'Tai nghe Bluetooth 5.3 chống ồn, pin 30 giờ, âm thanh Hi-Fi, phù hợp nghe nhạc và đàm thoại',
        (SELECT id FROM categories WHERE slug = 'dien-tu'),
        (SELECT id FROM brands WHERE slug = 'brand-a'),
        890000, 699000, 'cái', 0.08,
        '[]', '["tai nghe", "bluetooth", "không dây", "công nghệ"]', 'ACTIVE',
        '{"shopee": {"enable": true}, "tiktok": {"enable": true}}'
    );

-- =============================================
-- Product-Channel Mappings
-- =============================================
WITH product_list AS (
    SELECT id, sku FROM products
)
INSERT INTO product_channels (product_id, channel, status, sync_status)
SELECT id, 'SHOPEE', 'ACTIVE', 'SYNCED' FROM product_list WHERE sku IN ('SP0001', 'SP0002', 'SP0003', 'SP0005', 'SP0006')
UNION ALL
SELECT id, 'TIKTOK', 'ACTIVE', 'PENDING' FROM product_list WHERE sku IN ('SP0002', 'SP0003', 'SP0005', 'SP0006');

-- =============================================
-- Carrier Configs
-- =============================================
INSERT INTO carrier_configs (id, carrier, api_key, api_secret, endpoint_url, callback_url, status) VALUES
    (
        gen_random_uuid(), 'GHN',
        'ghn_mock_api_key_abc123xyz',
        'ghn_mock_api_secret_def456uvw',
        'https://dev-online-gateway.ghn.vn/api/v1',
        'https://api.salehub.vn/webhook/ghn',
        'ACTIVE'
    ),
    (
        gen_random_uuid(), 'GHTK',
        'ghtk_mock_api_key_ghi789rst',
        'ghtk_mock_api_secret_jkl012mno',
        'https://services.ghtklab.com/api',
        'https://api.salehub.vn/webhook/ghtk',
        'ACTIVE'
    );
