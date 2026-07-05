const PROD_NAMES = ["iPhone 15 Pro Max","Samsung Galaxy S24 Ultra","MacBook Pro 16 M3","AirPods Pro 2","iPad Air M2","Apple Watch Ultra 2","Dell XPS 15","Sony WH-1000XM5","Logitech MX Master 3S","Samsung 49\" Odyssey OLED","Nintendo Switch OLED","PlayStation 5 Slim","Xbox Series X","ASUS ROG Ally","Meta Quest 3","GoPro Hero 12 Black","DJI Mini 4 Pro","Bose QuietComfort Ultra","Razer DeathAdder V3","SteelSeries Apex Pro","Canon EOS R6 Mark II","Sony A7 IV","Fujifilm X-T5","Nikon Z8","LG C3 65\" OLED","Samsung QN90C 75\"","Sonos Arc","Marshall Stanmore III","JBL Flip 6","Dyson V15 Detect","Roomba j7+","Nespresso Vertuo Next","KitchenAid Artisan 5KSM175","Weber Spirit II E-310","Trek Domane SL 5","Giant TCR Advanced 2","Specialized Tarmac SL7","Cannondale Synapse Carbon","Santa Cruz Hightower","Trek Fuel EX 8","Patagonia Better Sweater","The North Face Nuptse 1996","Arc'teryx Beta AR","Canada Goose Langford","Moncler Maya","Ralph Lauren Polo Bear","Levi's 501 Original","Nike Air Force 1"];
const PROD_CATS = ["Electronics","Electronics","Electronics","Audio","Tablets","Wearables","Laptops","Audio","Accessories","Monitors","Gaming","Gaming","Gaming","Gaming","VR","Cameras","Drones","Audio","Gaming","Gaming","Cameras","Cameras","Cameras","Cameras","TV","TV","Audio","Audio","Audio","Home","Home","Kitchen","Kitchen","Outdoor","Cycling","Cycling","Cycling","Cycling","Cycling","Cycling","Clothing","Clothing","Clothing","Clothing","Clothing","Clothing","Clothing","Shoes"];
const PROD_PRICES = [1199,1299,2499,249,599,799,1899,349,99,1799,299,449,499,699,499,399,759,429,149,199,2499,2499,1699,3999,1499,1999,899,379,129,749,699,179,499,899,2799,3299,4499,2599,5299,3499,149,279,599,1495,1850,198,98,110];
const PROD_COSTS = [800,900,1800,140,380,500,1300,200,60,1100,200,320,350,480,320,250,520,260,80,120,1700,1700,1100,2800,900,1200,500,200,70,450,450,110,300,550,1800,2100,3000,1700,3500,2300,80,150,350,900,1100,100,50,60];
const PROD_STOCKS = [150,120,45,300,180,90,35,200,500,25,60,80,55,40,30,75,45,100,350,200,25,30,20,15,40,30,50,80,300,60,45,120,90,35,10,8,12,7,5,6,200,150,75,60,45,180,300,400];
const PROD_STATUSES = ["Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Draft","Active","Active","Draft","Active","Active","Active","Active","Active","Active","Active","Draft","Active","Archived","Active","Active","Draft","Active","Draft","Active","Active","Active","Active","Active","Draft","Active","Active","Active"];
const CUST_NAMES = ["Nguyen Van A","Tran Thi B","Le Van C","Pham Thi D","Hoang Van E","Mai Thi F","Vo Van G","Dang Thi H","Bui Van I","Do Thi K","Nguyen Thi L","Tran Van M","Le Thi N","Pham Van O","Hoang Thi P","Mai Van Q","Vo Thi R","Dang Van S","Bui Thi T","Do Van U","Nguyen Van V","Tran Thi W","Le Van X","Pham Thi Y","Hoang Van Z","Mai Thi AA","Vo Van BB","Dang Thi CC","Bui Van DD","Do Thi EE","Nguyen Van FF","Tran Thi GG","Le Van HH","Pham Thi II","Hoang Van JJ"];
const CUST_SEGMENTS = ["VIP","Thường","VIP","Thường","Tiềm năng","Thường","VIP","Tiềm năng","Thường","Thường","Thường","Tiềm năng","Thường","VIP","Thường","Tiềm năng","Thường","Thường","VIP","Thường","Tiềm năng","Thường","Thường","VIP","Thường","Tiềm năng","Thường","VIP","Thường","Thường","Thường","Tiềm năng","Thường","VIP","Thường"];

const salehubData = {
  users: [
    { id: 1, name: "Admin User", email: "admin@salehub.com", avatar: null, role: "admin" },
    { id: 2, name: "Sales Manager", email: "sales@salehub.com", avatar: null, role: "manager" }
  ],
  products: Array.from({ length: 48 }, (_, i) => ({
    id: i + 1, name: PROD_NAMES[i], sku: `SKU-${String(i + 1).padStart(4, '0')}`,
    category: PROD_CATS[i], price: PROD_PRICES[i], cost: PROD_COSTS[i],
    stock: PROD_STOCKS[i], status: PROD_STATUSES[i], image: null,
    createdAt: new Date(2024, 0, i + 1).toISOString()
  })),
  channels: [
    { id: 1, name: "Shopee Mall", type: "shopee", status: "connected", orders: 1240, revenue: 89200000, connectedAt: "2024-01-15" },
    { id: 2, name: "Lazada Flagship", type: "lazada", status: "connected", orders: 890, revenue: 64500000, connectedAt: "2024-02-01" },
    { id: 3, name: "Tiki Trading", type: "tiki", status: "connected", orders: 560, revenue: 41200000, connectedAt: "2024-03-10" },
    { id: 4, name: "TikTok Shop", type: "tiktok", status: "connected", orders: 2100, revenue: 156000000, connectedAt: "2024-04-20" },
    { id: 5, name: "Facebook Marketplace", type: "facebook", status: "disconnected", orders: 340, revenue: 18900000, connectedAt: "2024-05-01" },
    { id: 6, name: "Website Store", type: "web", status: "connected", orders: 780, revenue: 56700000, connectedAt: "2024-01-01" }
  ],
  inventory: [
    { id: 1, productId: 1, warehouse: "HCM - District 1", quantity: 85, minStock: 20, maxStock: 200, lastChecked: "2024-12-10" },
    { id: 2, productId: 1, warehouse: "HN - Cau Giay", quantity: 65, minStock: 15, maxStock: 150, lastChecked: "2024-12-09" },
    { id: 3, productId: 3, warehouse: "HCM - District 1", quantity: 30, minStock: 10, maxStock: 80, lastChecked: "2024-12-10" },
    { id: 4, productId: 3, warehouse: "HN - Cau Giay", quantity: 15, minStock: 10, maxStock: 60, lastChecked: "2024-12-08" },
    { id: 5, productId: 7, warehouse: "HCM - District 1", quantity: 3, minStock: 10, maxStock: 50, lastChecked: "2024-12-10" },
    { id: 6, productId: 12, warehouse: "HN - Cau Giay", quantity: 120, minStock: 30, maxStock: 300, lastChecked: "2024-12-09" },
    { id: 7, productId: 20, warehouse: "HCM - District 1", quantity: 150, minStock: 50, maxStock: 400, lastChecked: "2024-12-10" },
    { id: 8, productId: 30, warehouse: "HCM - District 1", quantity: 12, minStock: 15, maxStock: 100, lastChecked: "2024-12-07" },
    { id: 9, productId: 33, warehouse: "HN - Cau Giay", quantity: 55, minStock: 20, maxStock: 150, lastChecked: "2024-12-09" },
    { id: 10, productId: 40, warehouse: "DN - Hai Chau", quantity: 2, minStock: 5, maxStock: 20, lastChecked: "2024-12-06" }
  ],
  orders: Array.from({ length: 50 }, (_, i) => {
    const statuses = ["Pending","Confirmed","Processing","Shipped","Delivered","Cancelled","Returned"];
    const status = statuses[i % statuses.length];
    const items = [];
    const itemCount = (i % 4) + 1;
    for (let j = 0; j < itemCount; j++) {
      const idx = (i * 3 + j * 7) % 48;
      items.push({ productId: idx + 1, productName: PROD_NAMES[idx], quantity: (i % 3) + 1, price: PROD_PRICES[idx] });
    }
    const total = items.reduce((s, it) => s + it.quantity * it.price, 0);
    const channels = ["Shopee Mall","Lazada Flagship","Tiki Trading","TikTok Shop","Website Store"];
    const customers = ["Nguyen Van A","Tran Thi B","Le Van C","Pham Thi D","Hoang Van E","Mai Thi F","Vo Van G","Dang Thi H","Bui Van I","Do Thi K"];
    const emails = ["nguyenvana@gmail.com","tranthib@gmail.com","levanc@gmail.com","phamthid@gmail.com","hoangvane@gmail.com","maithif@gmail.com","vovang@gmail.com","dangthih@gmail.com","buivani@gmail.com","dothik@gmail.com"];
    const addrs = ["123 Nguyen Hue, Q1, HCMC","456 Le Loi, Q1, HCMC","789 Hoan Kiem, Hanoi","321 Hai Ba Trung, Da Nang","111 Tran Phu, Hai Phong"];
    return {
      id: `ORD-${String(1000 + i)}`, customer: customers[i % 10], email: emails[i % 10],
      phone: `09${String(10000000 + i * 1234567).slice(0, 8)}`, items, total,
      totalFormatted: total.toLocaleString('vi-VN') + '₫', status, channel: channels[i % 5],
      address: addrs[i % 5], note: i % 4 === 0 ? "Giao hàng giờ hành chính" : "",
      createdAt: new Date(2024, 10, 25 + (i % 30)).toISOString(),
      updatedAt: new Date(2024, 11, 1 + (i % 15)).toISOString()
    };
  }),
  carriers: [
    { id: 1, name: "GHN", status: "active", shippedToday: 45, shippedTotal: 12340, avgDelivery: 2.5 },
    { id: 2, name: "GHTK", status: "active", shippedToday: 32, shippedTotal: 9870, avgDelivery: 3.0 },
    { id: 3, name: "Viettel Post", status: "active", shippedToday: 28, shippedTotal: 7650, avgDelivery: 2.8 },
    { id: 4, name: "J&T Express", status: "inactive", shippedToday: 0, shippedTotal: 4560, avgDelivery: 3.5 },
    { id: 5, name: "Best Express", status: "active", shippedToday: 18, shippedTotal: 3200, avgDelivery: 3.2 }
  ],
  shipments: Array.from({ length: 30 }, (_, i) => ({
    id: `SHIP-${String(2000 + i)}`, orderId: `ORD-${String(1000 + i)}`,
    carrier: ["GHN","GHTK","Viettel Post","J&T Express","Best Express"][i % 5],
    trackingCode: `VNB${String(Math.floor(100000000 + Math.random() * 900000000))}`,
    status: ["Pending","Picked Up","In Transit","Out for Delivery","Delivered","Failed"][i % 6],
    estimatedDelivery: new Date(2024, 11, 5 + (i % 20)).toISOString(),
    actualDelivery: i % 3 === 0 ? new Date(2024, 11, 3 + (i % 15)).toISOString() : null,
    origin: "HCM - District 1",
    destination: ["123 Nguyen Hue, Q1, HCMC","456 Le Loi, Q1, HCMC","789 Hoan Kiem, Hanoi","321 Hai Ba Trung, Da Nang"][i % 4],
    weight: (Math.random() * 5 + 0.5).toFixed(1) + " kg", fee: Math.floor(Math.random() * 50000 + 20000)
  })),
  promotions: [
    { id: 1, name: "Flash Sale 12.12", type: "percentage", value: 30, code: "FLASH30", minOrder: 200000, maxDiscount: 500000, used: 450, limit: 1000, status: "active", startDate: "2024-12-01", endDate: "2024-12-12", channel: "All" },
    { id: 2, name: "Free Ship 50K", type: "freeship", value: 50000, code: "FREESHIP50", minOrder: 0, maxDiscount: 50000, used: 1200, limit: 2000, status: "active", startDate: "2024-12-01", endDate: "2024-12-31", channel: "Shopee Mall" },
    { id: 3, name: "Giảm 200K cho đơn >1tr", type: "fixed", value: 200000, code: "GIAM200", minOrder: 1000000, maxDiscount: 200000, used: 180, limit: 500, status: "active", startDate: "2024-11-15", endDate: "2024-12-15", channel: "All" },
    { id: 4, name: "Black Week Deal", type: "percentage", value: 15, code: "BLACK15", minOrder: 500000, maxDiscount: 300000, used: 670, limit: 1000, status: "expired", startDate: "2024-11-20", endDate: "2024-11-30", channel: "All" },
    { id: 5, name: "TikTok Exclusive", type: "percentage", value: 10, code: "TIKTOK10", minOrder: 100000, maxDiscount: 100000, used: 890, limit: 1500, status: "active", startDate: "2024-12-01", endDate: "2024-12-31", channel: "TikTok Shop" },
    { id: 6, name: "Deal Sốc Cuối Tuần", type: "fixed", value: 50000, code: "CUOITUAN50", minOrder: 300000, maxDiscount: 50000, used: 340, limit: 500, status: "active", startDate: "2024-12-06", endDate: "2024-12-08", channel: "All" }
  ],
  customers: Array.from({ length: 35 }, (_, i) => ({
    id: i + 1, name: CUST_NAMES[i],
    email: `customer${i + 1}@gmail.com`,
    phone: `09${String(10000000 + i * 2345678).slice(0, 8)}`,
    totalOrders: (i % 10) + 1,
    totalSpent: Math.floor(Math.random() * 5000000 + 200000),
    segment: CUST_SEGMENTS[i],
    registeredAt: new Date(2024, (i % 11), (i % 28) + 1).toISOString(),
    lastOrder: new Date(2024, 11, (i % 20) + 1).toISOString(),
    interactions: (i % 5) + 1
  })),
  reports: {
    dailySales: Array.from({ length: 30 }, (_, i) => ({ date: `2024-11-${String(i + 1).padStart(2, '0')}`, revenue: Math.floor(Math.random() * 8000000 + 3000000), orders: Math.floor(Math.random() * 40 + 10) })),
    topProducts: Array.from({ length: 10 }, (_, i) => ({ name: ["iPhone 15 Pro Max","AirPods Pro 2","MacBook Pro 16","Samsung Galaxy S24","iPad Air M2","Apple Watch Ultra 2","Sony WH-1000XM5","Dell XPS 15","Nintendo Switch OLED","Logitech MX Master"][i], sold: Math.floor(Math.random() * 200 + 50), revenue: Math.floor(Math.random() * 200000000 + 50000000) })),
    channelBreakdown: [
      { channel: "Shopee Mall", revenue: 89200000, orders: 1240, growth: 15 },
      { channel: "Lazada", revenue: 64500000, orders: 890, growth: 8 },
      { channel: "Tiki", revenue: 41200000, orders: 560, growth: -3 },
      { channel: "TikTok Shop", revenue: 156000000, orders: 2100, growth: 45 },
      { channel: "Website", revenue: 56700000, orders: 780, growth: 12 }
    ],
    summary: { totalRevenue: 407510000, totalOrders: 5570, avgOrderValue: 73160, conversionRate: 3.8, returningRate: 45 }
  },
  settings: {
    storeName: "SaleHub Store", email: "admin@salehub.com", phone: "0901234567",
    address: "123 Nguyen Hue, District 1, HCMC", currency: "VND",
    timezone: "Asia/Ho_Chi_Minh", lowStockThreshold: 10,
    autoSyncOrders: true, notificationEmail: true, notificationSMS: false
  }
};
