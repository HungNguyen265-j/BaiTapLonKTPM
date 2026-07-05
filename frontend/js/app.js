let state = { currentScreen: "dashboard", loginVisible: false, productsPage: 1, productsPageSize: 12, orderSearch: "", orderStatus: "All", productSearch: "", productFilter: "All", customerSearch: "", shipmentSearch: "" };

function formatMoney(v) { return Number(v).toLocaleString('vi-VN') + '₫'; }
function formatDate(d) { return new Date(d).toLocaleDateString('vi-VN'); }
function getStatusColor(s) { return { 'Active':'bg-green-100 text-green-800','Draft':'bg-yellow-100 text-yellow-800','Archived':'bg-gray-100 text-gray-600','connected':'bg-green-100 text-green-800','disconnected':'bg-red-100 text-red-800','Pending':'bg-yellow-100 text-yellow-800','Confirmed':'bg-blue-100 text-blue-800','Processing':'bg-indigo-100 text-indigo-800','Shipped':'bg-purple-100 text-purple-800','Delivered':'bg-green-100 text-green-800','Cancelled':'bg-red-100 text-red-800','Returned':'bg-orange-100 text-orange-800','Picked Up':'bg-blue-100 text-blue-800','In Transit':'bg-indigo-100 text-indigo-800','Out for Delivery':'bg-purple-100 text-purple-800','Delivered':'bg-green-100 text-green-800','Failed':'bg-red-100 text-red-800','inactive':'bg-red-100 text-red-800','expired':'bg-gray-100 text-gray-600','VIP':'bg-purple-100 text-purple-800','Thường':'bg-blue-100 text-blue-800','Tiềm năng':'bg-teal-100 text-teal-800'}[s]||'bg-gray-100 text-gray-800'; }

function showScreen(id) {
  state.currentScreen = id;
  document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
  document.getElementById(`screen-${id}`).classList.remove('hidden');
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('bg-indigo-50', 'text-indigo-700', 'border-indigo-600'));
  const sel = document.querySelector(`.sidebar-item[data-screen="${id}"]`);
  if (sel) sel.classList.add('bg-indigo-50', 'text-indigo-700', 'border-indigo-600');
  const labels = { dashboard:"Dashboard", products:"Products", channels:"Channels", inventory:"Inventory", orders:"Orders", shipping:"Shipping", promotions:"Promotions", customers:"Customers", reports:"Reports", settings:"Settings" };
  const t = document.getElementById('screen-title');
  if (t) t.textContent = labels[id] || id;
  renderScreen(id);
}

function renderScreen(id) {
  const fns = { dashboard: renderDashboard, products: renderProducts, channels: renderChannels, inventory: renderInventory, orders: renderOrders, shipping: renderShipping, promotions: renderPromotions, customers: renderCustomers, reports: renderReports, settings: renderSettings };
  if (fns[id]) fns[id]();
}

function renderDashboard() {
  const d = salehubData.reports.summary;
  document.getElementById('stat-total-revenue').textContent = formatMoney(d.totalRevenue);
  document.getElementById('stat-total-orders').textContent = d.totalOrders.toLocaleString();
  document.getElementById('stat-avg-order').textContent = formatMoney(d.avgOrderValue);
  document.getElementById('stat-conversion').textContent = d.conversionRate + '%';
  const tbody = document.getElementById('recent-orders-body');
  tbody.innerHTML = '';
  salehubData.orders.slice(0, 8).forEach(o => {
    tbody.innerHTML += `<tr class="border-b hover:bg-gray-50"><td class="p-3 text-sm font-medium">${o.id}</td><td class="p-3 text-sm">${o.customer}</td><td class="p-3 text-sm">${o.channel}</td><td class="p-3 text-sm">${formatMoney(o.total)}</td><td class="p-3"><span class="px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(o.status)}">${o.status}</span></td><td class="p-3 text-sm">${formatDate(o.createdAt)}</td></tr>`;
  });
  renderChart();
  renderChannelChart();
}

let chart1 = null, chart2 = null;
function renderChart() {
  if (chart1) { chart1.destroy(); chart1 = null; }
  const ctx = document.getElementById('salesChart');
  if (!ctx) return;
  const labels = salehubData.reports.dailySales.map(d => d.date.slice(8));
  const data = salehubData.reports.dailySales.map(d => d.revenue);
  chart1 = new Chart(ctx, { type:'line', data:{ labels, datasets:[{ label:'Doanh thu (VND)', data, borderColor:'#4f46e5', backgroundColor:'rgba(79,70,229,0.1)', fill:true, tension:0.4 }] }, options:{ responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ ticks:{ callback:v=>v>=1000000?(v/1000000)+'M':v>=1000?(v/1000)+'K':v } } } } });
}

function renderChannelChart() {
  if (chart2) { chart2.destroy(); chart2 = null; }
  const ctx = document.getElementById('channelChart');
  if (!ctx) return;
  const labels = salehubData.reports.channelBreakdown.map(d => d.channel);
  const data = salehubData.reports.channelBreakdown.map(d => d.revenue);
  chart2 = new Chart(ctx, { type:'doughnut', data:{ labels, datasets:[{ data, backgroundColor:['#4f46e5','#06b6d4','#22c55e','#f59e0b','#ef4444'] }] }, options:{ responsive:true, plugins:{ legend:{ position:'right' } } } });
}

function renderProducts() {
  const search = state.productSearch.toLowerCase();
  const filter = state.productFilter;
  let items = salehubData.products.filter(p => {
    const m = !search || p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search);
    const f = filter === 'All' || p.status === filter;
    return m && f;
  });
  const totalPages = Math.ceil(items.length / state.productsPageSize);
  const page = Math.min(state.productsPage, totalPages) || 1;
  state.productsPage = page;
  const start = (page - 1) * state.productsPageSize;
  const pageItems = items.slice(start, start + state.productsPageSize);
  const tbody = document.getElementById('products-body');
  tbody.innerHTML = '';
  pageItems.forEach(p => {
    tbody.innerHTML += `<tr class="border-b hover:bg-gray-50 cursor-pointer" onclick="showProductDetail(${p.id})"><td class="p-3"><div class="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">IMG</div></td><td class="p-3"><div class="font-medium text-sm">${p.name}</div><div class="text-xs text-gray-500">${p.sku}</div></td><td class="p-3 text-sm">${p.category}</td><td class="p-3 text-sm">${formatMoney(p.price)}</td><td class="p-3 text-sm">${p.stock}</td><td class="p-3"><span class="px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(p.status)}">${p.status}</span></td></tr>`;
  });
  document.getElementById('products-info').textContent = `Showing ${start + 1}-${Math.min(start + state.productsPageSize, items.length)} of ${items.length}`;
  document.getElementById('products-prev').disabled = page <= 1;
  document.getElementById('products-next').disabled = page >= totalPages;
  document.getElementById('products-page').textContent = page;
}

function showProductDetail(id) {
  const p = salehubData.products.find(x => x.id === id);
  if (!p) return;
  const el = document.getElementById('product-detail-panel');
  el.innerHTML = `<div class="fixed inset-0 z-50 flex justify-end"><div class="absolute inset-0 bg-black/30" onclick="closeProductDetail()"></div><div class="relative bg-white w-full max-w-lg shadow-xl p-6 overflow-y-auto"><div class="flex justify-between items-center mb-6"><h2 class="text-xl font-bold">${p.name}</h2><button onclick="closeProductDetail()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button></div><div class="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-400 mb-4">Product Image</div><div class="grid grid-cols-2 gap-4"><div><label class="text-xs text-gray-500">SKU</label><p class="font-medium">${p.sku}</p></div><div><label class="text-xs text-gray-500">Category</label><p class="font-medium">${p.category}</p></div><div><label class="text-xs text-gray-500">Price</label><p class="font-medium">${formatMoney(p.price)}</p></div><div><label class="text-xs text-gray-500">Cost</label><p class="font-medium">${formatMoney(p.cost)}</p></div><div><label class="text-xs text-gray-500">Stock</label><p class="font-medium">${p.stock}</p></div><div><label class="text-xs text-gray-500">Status</label><p><span class="px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(p.status)}">${p.status}</span></p></div></div><div class="mt-4"><label class="text-xs text-gray-500">Created</label><p class="text-sm">${formatDate(p.createdAt)}</p></div></div></div>`;
  el.classList.remove('hidden');
}

function closeProductDetail() { document.getElementById('product-detail-panel').classList.add('hidden'); }

function openAddProductModal() { document.getElementById('add-product-modal').classList.remove('hidden'); }
function closeAddProductModal() { document.getElementById('add-product-modal').classList.add('hidden'); }

function renderOrders() {
  const search = state.orderSearch.toLowerCase();
  const status = state.orderStatus;
  let items = salehubData.orders.filter(o => {
    const m = !search || o.id.toLowerCase().includes(search) || o.customer.toLowerCase().includes(search);
    const f = status === 'All' || o.status === status;
    return m && f;
  });
  const tbody = document.getElementById('orders-body');
  tbody.innerHTML = '';
  items.forEach(o => {
    tbody.innerHTML += `<tr class="border-b hover:bg-gray-50 cursor-pointer" onclick="showOrderDetail('${o.id}')"><td class="p-3 text-sm font-medium">${o.id}</td><td class="p-3 text-sm">${o.customer}</td><td class="p-3 text-sm">${o.channel}</td><td class="p-3 text-sm">${o.items.length} items</td><td class="p-3 text-sm font-medium">${formatMoney(o.total)}</td><td class="p-3"><span class="px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(o.status)}">${o.status}</span></td><td class="p-3 text-sm">${formatDate(o.createdAt)}</td></tr>`;
  });
  if (!items.length) tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-gray-400">No orders found</td></tr>';
}

function showOrderDetail(id) {
  const o = salehubData.orders.find(x => x.id === id);
  if (!o) return;
  const el = document.getElementById('order-detail-panel');
  let itemsHtml = '';
  o.items.forEach(it => { itemsHtml += `<tr class="border-b"><td class="p-2 text-sm">${it.productName}</td><td class="p-2 text-sm text-center">${it.quantity}</td><td class="p-2 text-sm text-right">${formatMoney(it.price)}</td><td class="p-2 text-sm text-right">${formatMoney(it.quantity * it.price)}</td></tr>`; });
  el.innerHTML = `<div class="fixed inset-0 z-50 flex justify-end"><div class="absolute inset-0 bg-black/30" onclick="closeOrderDetail()"></div><div class="relative bg-white w-full max-w-lg shadow-xl p-6 overflow-y-auto"><div class="flex justify-between items-center mb-6"><h2 class="text-xl font-bold">Order ${o.id}</h2><button onclick="closeOrderDetail()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button></div><div class="mb-4"><span class="px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(o.status)}">${o.status}</span></div><div class="grid grid-cols-2 gap-4 mb-4"><div><label class="text-xs text-gray-500">Customer</label><p class="font-medium">${o.customer}</p></div><div><label class="text-xs text-gray-500">Channel</label><p class="font-medium">${o.channel}</p></div><div><label class="text-xs text-gray-500">Email</label><p class="text-sm">${o.email}</p></div><div><label class="text-xs text-gray-500">Phone</label><p class="text-sm">${o.phone}</p></div></div><div class="mb-4"><label class="text-xs text-gray-500">Shipping Address</label><p class="text-sm">${o.address}</p></div>${o.note ? `<div class="mb-4"><label class="text-xs text-gray-500">Note</label><p class="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">${o.note}</p></div>` : ''}<table class="w-full text-sm mb-4"><thead><tr class="border-b text-gray-500"><th class="p-2 text-left">Product</th><th class="p-2 text-center">Qty</th><th class="p-2 text-right">Price</th><th class="p-2 text-right">Total</th></tr></thead><tbody>${itemsHtml}</tbody><tfoot><tr><td colspan="3" class="p-2 text-right font-bold">Total:</td><td class="p-2 text-right font-bold">${formatMoney(o.total)}</td></tr></tfoot></table><div class="text-xs text-gray-400">Created: ${formatDate(o.createdAt)}${o.updatedAt ? ' | Updated: '+formatDate(o.updatedAt) : ''}</div></div></div>`;
  el.classList.remove('hidden');
}

function closeOrderDetail() { document.getElementById('order-detail-panel').classList.add('hidden'); }

function renderChannels() {
  const container = document.getElementById('channels-container');
  container.innerHTML = '';
  salehubData.channels.forEach(ch => {
    container.innerHTML += `<div class="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow"><div class="flex justify-between items-start mb-3"><div><h3 class="font-semibold text-lg">${ch.name}</h3><span class="text-xs text-gray-500 capitalize">${ch.type}</span></div><span class="px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(ch.status)}">${ch.status}</span></div><div class="grid grid-cols-2 gap-3 mt-4"><div><div class="text-2xl font-bold text-indigo-600">${ch.orders.toLocaleString()}</div><div class="text-xs text-gray-500">Orders</div></div><div><div class="text-2xl font-bold text-green-600">${formatMoney(ch.revenue)}</div><div class="text-xs text-gray-500">Revenue</div></div></div><div class="mt-3 text-xs text-gray-400">Connected: ${ch.connectedAt}</div></div>`;
  });
}

function renderInventory() {
  const container = document.getElementById('inventory-container');
  container.innerHTML = '';
  salehubData.products.slice(0, 20).forEach(p => {
    const invItems = salehubData.inventory.filter(i => i.productId === p.id);
    const totalStock = invItems.reduce((s, i) => s + i.quantity, 0);
    const lowStock = invItems.some(i => i.quantity <= i.minStock);
    container.innerHTML += `<div class="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"><div class="flex justify-between items-start mb-2"><h4 class="font-medium text-sm">${p.name}</h4><span class="text-xs text-gray-500">${p.sku}</span></div><div class="flex items-center gap-2"><div class="flex-1 bg-gray-200 rounded-full h-2"><div class="bg-indigo-600 rounded-full h-2 transition-all" style="width:${Math.min(100, (totalStock / (p.stock || 1)) * 100)}%"></div></div><span class="text-sm font-semibold ${lowStock ? 'text-red-600' : 'text-gray-700'}">${totalStock}</span></div><div class="mt-2 flex flex-wrap gap-1">${invItems.map(i => `<span class="text-xs ${i.quantity <= i.minStock ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'} px-2 py-1 rounded">${i.warehouse.split('-')[0].trim()}: ${i.quantity}</span>`).join('')}</div></div>`;
  });
}

function renderShipping() {
  const tbody = document.getElementById('shipments-body');
  tbody.innerHTML = '';
  const items = salehubData.shipments;
  items.forEach(s => {
    tbody.innerHTML += `<tr class="border-b hover:bg-gray-50"><td class="p-3 text-sm font-medium">${s.id}</td><td class="p-3 text-sm">${s.orderId}</td><td class="p-3 text-sm">${s.carrier}</td><td class="p-3 text-sm font-mono text-xs">${s.trackingCode}</td><td class="p-3"><span class="px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(s.status)}">${s.status}</span></td><td class="p-3 text-sm">${s.weight}</td><td class="p-3 text-sm">${formatMoney(s.fee)}</td><td class="p-3 text-sm">${formatDate(s.estimatedDelivery)}</td></tr>`;
  });
  const cc = document.getElementById('carrier-cards');
  cc.innerHTML = '';
  salehubData.carriers.forEach(c => {
    cc.innerHTML += `<div class="bg-white rounded-xl border p-4"><div class="flex justify-between items-center mb-3"><h4 class="font-semibold">${c.name}</h4><span class="px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(c.status)}">${c.status}</span></div><div class="grid grid-cols-3 gap-2 text-center"><div><div class="text-lg font-bold text-indigo-600">${c.shippedToday}</div><div class="text-xs text-gray-500">Today</div></div><div><div class="text-lg font-bold">${c.shippedTotal.toLocaleString()}</div><div class="text-xs text-gray-500">Total</div></div><div><div class="text-lg font-bold">${c.avgDelivery}d</div><div class="text-xs text-gray-500">Avg</div></div></div></div>`;
  });
}

function renderPromotions() {
  const tbody = document.getElementById('promotions-body');
  tbody.innerHTML = '';
  salehubData.promotions.forEach(p => {
    const typeLabels = { percentage: p.value + '%', fixed: formatMoney(p.value), freeship: 'Free Ship ' + formatMoney(p.value) };
    tbody.innerHTML += `<tr class="border-b hover:bg-gray-50"><td class="p-3"><div class="font-medium text-sm">${p.name}</div><div class="text-xs text-gray-500">${p.code}</div></td><td class="p-3 text-sm">${typeLabels[p.type] || p.value}</td><td class="p-3 text-sm">${formatMoney(p.minOrder)}</td><td class="p-3 text-sm">${p.used}/${p.limit}</td><td class="p-3 w-32"><div class="bg-gray-200 rounded-full h-2"><div class="bg-indigo-600 rounded-full h-2" style="width:${(p.used/p.limit*100).toFixed(0)}%"></div></div></td><td class="p-3"><span class="px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(p.status)}">${p.status}</span></td><td class="p-3 text-xs">${p.startDate} ~ ${p.endDate}</td></tr>`;
  });
}

function renderCustomers() {
  const search = state.customerSearch.toLowerCase();
  let items = salehubData.customers.filter(c => !search || c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search) || c.phone.includes(search));
  const tbody = document.getElementById('customers-body');
  tbody.innerHTML = '';
  items.forEach(c => {
    tbody.innerHTML += `<tr class="border-b hover:bg-gray-50"><td class="p-3"><div class="flex items-center gap-3"><div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">${c.name.split(' ').pop()[0]}</div><div><div class="font-medium text-sm">${c.name}</div><div class="text-xs text-gray-500">${c.email}</div></div></div></td><td class="p-3 text-sm">${c.phone}</td><td class="p-3 text-sm">${c.totalOrders}</td><td class="p-3 text-sm font-medium">${formatMoney(c.totalSpent)}</td><td class="p-3"><span class="px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(c.segment)}">${c.segment}</span></td><td class="p-3 text-sm">${formatDate(c.lastOrder)}</td></tr>`;
  });
  if (!items.length) tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-gray-400">No customers found</td></tr>';
}

let chart3 = null, chart4 = null;
function renderReports() {
  const s = salehubData.reports.summary;
  document.getElementById('report-revenue').textContent = formatMoney(s.totalRevenue);
  document.getElementById('report-orders').textContent = s.totalOrders.toLocaleString();
  document.getElementById('report-avg').textContent = formatMoney(s.avgOrderValue);
  document.getElementById('report-returning').textContent = s.returningRate + '%';
  const tbody = document.getElementById('top-products-body');
  tbody.innerHTML = '';
  salehubData.reports.topProducts.forEach((p, i) => {
    tbody.innerHTML += `<tr class="border-b"><td class="p-3 text-sm font-medium text-gray-500">${i + 1}</td><td class="p-3 text-sm font-medium">${p.name}</td><td class="p-3 text-sm">${p.sold}</td><td class="p-3 text-sm font-medium">${formatMoney(p.revenue)}</td></tr>`;
  });
  const cb = document.getElementById('channel-breakdown');
  cb.innerHTML = '';
  salehubData.reports.channelBreakdown.forEach(ch => {
    const g = ch.growth >= 0;
    cb.innerHTML += `<div class="flex items-center justify-between p-3 border-b last:border-0"><div><div class="font-medium text-sm">${ch.channel}</div><div class="text-xs text-gray-500">${ch.orders} orders</div></div><div class="text-right"><div class="font-medium text-sm">${formatMoney(ch.revenue)}</div><div class="text-xs ${g ? 'text-green-600' : 'text-red-600'}">${g ? '+' : ''}${ch.growth}%</div></div></div>`;
  });
  const labels = salehubData.reports.dailySales.map(d => d.date.slice(8));
  const data1 = salehubData.reports.dailySales.map(d => d.revenue);
  if (chart3) { chart3.destroy(); chart3 = null; }
  const ctx3 = document.getElementById('reports-sales-chart');
  if (ctx3) chart3 = new Chart(ctx3, { type:'line', data:{ labels, datasets:[{ label:'Doanh thu (VND)', data:data1, borderColor:'#4f46e5', backgroundColor:'rgba(79,70,229,0.1)', fill:true, tension:0.4 }] }, options:{ responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ ticks:{ callback:v=>v>=1000000?(v/1000000)+'M':v>=1000?(v/1000)+'K':v } } } } });
  const labels2 = salehubData.reports.channelBreakdown.map(d => d.channel);
  const data2 = salehubData.reports.channelBreakdown.map(d => d.revenue);
  if (chart4) { chart4.destroy(); chart4 = null; }
  const ctx4 = document.getElementById('reports-channel-chart');
  if (ctx4) chart4 = new Chart(ctx4, { type:'doughnut', data:{ labels:labels2, datasets:[{ data:data2, backgroundColor:['#4f46e5','#06b6d4','#22c55e','#f59e0b','#ef4444'] }] }, options:{ responsive:true, plugins:{ legend:{ position:'right' } } } });
}

function renderSettings() {
  const s = salehubData.settings;
  document.getElementById('settings-store-name').value = s.storeName;
  document.getElementById('settings-email').value = s.email;
  document.getElementById('settings-phone').value = s.phone;
  document.getElementById('settings-address').value = s.address;
  document.getElementById('settings-currency').value = s.currency;
  document.getElementById('settings-timezone').value = s.timezone;
  document.getElementById('settings-low-stock').value = s.lowStockThreshold;
  document.getElementById('settings-auto-sync').checked = s.autoSyncOrders;
  document.getElementById('settings-notify-email').checked = s.notificationEmail;
  document.getElementById('settings-notify-sms').checked = s.notificationSMS;
}

function handleLogin(e) {
  if (e) e.preventDefault();
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('app-shell').classList.remove('hidden');
  showScreen('dashboard');
}

function handleLogout() {
  document.getElementById('app-shell').classList.add('hidden');
  document.getElementById('login-page').classList.remove('hidden');
}

function initApp() {
  document.querySelectorAll('.sidebar-item').forEach(el => {
    el.addEventListener('click', function() { showScreen(this.dataset.screen); });
  });
  document.querySelectorAll('.tab-btn').forEach(el => {
    el.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-active'));
      this.classList.add('tab-active');
    });
  });
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('products-search').addEventListener('input', function() { state.productSearch = this.value; state.productsPage = 1; renderProducts(); });
  document.getElementById('products-filter').addEventListener('change', function() { state.productFilter = this.value; state.productsPage = 1; renderProducts(); });
  document.getElementById('products-prev').addEventListener('click', function() { if (state.productsPage > 1) { state.productsPage--; renderProducts(); } });
  document.getElementById('products-next').addEventListener('click', function() { state.productsPage++; renderProducts(); });
  document.getElementById('orders-search').addEventListener('input', function() { state.orderSearch = this.value; renderOrders(); });
  document.getElementById('orders-status-filter').addEventListener('change', function() { state.orderStatus = this.value; renderOrders(); });
  document.getElementById('customers-search').addEventListener('input', function() { state.customerSearch = this.value; renderCustomers(); });
  document.getElementById('shipments-search').addEventListener('input', function() { state.shipmentSearch = this.value; });
  document.getElementById('add-product-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('new-product-name').value;
    const sku = document.getElementById('new-product-sku').value;
    const price = parseFloat(document.getElementById('new-product-price').value);
    const stock = parseInt(document.getElementById('new-product-stock').value);
    const category = document.getElementById('new-product-category').value;
    if (name && sku && price) {
      const maxId = Math.max(...salehubData.products.map(p => p.id), 0);
      salehubData.products.push({ id: maxId + 1, name, sku, category: category || 'General', price, cost: price * 0.6, stock: stock || 0, status: 'Active', image: null, createdAt: new Date().toISOString() });
      closeAddProductModal();
      renderProducts();
      this.reset();
    }
  });
  document.getElementById('settings-save-btn').addEventListener('click', function() {
    const s = salehubData.settings;
    s.storeName = document.getElementById('settings-store-name').value;
    s.email = document.getElementById('settings-email').value;
    s.phone = document.getElementById('settings-phone').value;
    s.address = document.getElementById('settings-address').value;
    s.currency = document.getElementById('settings-currency').value;
    s.timezone = document.getElementById('settings-timezone').value;
    s.lowStockThreshold = parseInt(document.getElementById('settings-low-stock').value) || 10;
    s.autoSyncOrders = document.getElementById('settings-auto-sync').checked;
    s.notificationEmail = document.getElementById('settings-notify-email').checked;
    s.notificationSMS = document.getElementById('settings-notify-sms').checked;
    alert('Settings saved successfully!');
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initApp();
  handleLogin(null);
});
