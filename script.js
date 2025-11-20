// Data Storage
let products = [
  {
    id: 1,
    name: "Bakso Urat",
    price: 25000,
    description: "Bakso dengan campuran urat sapi yang kenyal dan gurih",
    image: "https://images.pexels.com/photos/8477598/pexels-photo-8477598.jpeg?auto=compress&cs=tinysrgb&w=400&search_term=meatball,soup,food",
  },
  {
    id: 2,
    name: "Bakso Jumbo",
    price: 30000,
    description: "Bakso ukuran besar dengan isian telur puyuh di dalamnya",
    image: "https://images.pexels.com/photos/4518590/pexels-photo-4518590.jpeg?auto=compress&cs=tinysrgb&w=400&search_term=meatball,asian,food",
  },
  {
    id: 3,
    name: "Bakso Original",
    price: 20000,
    description: "Bakso klasik dengan daging sapi pilihan dan kuah kaldu segar",
    image: "https://images.pexels.com/photos/3887985/pexels-photo-3887985.jpeg?auto=compress&cs=tinysrgb&w=400&search_term=soup,meatball,asian",
  },
  {
    id: 4,
    name: "Bakso Halus",
    price: 22000,
    description: "Bakso dengan tekstur halus dan lembut di mulut",
    image: "https://images.pexels.com/photos/8477610/pexels-photo-8477610.jpeg?auto=compress&cs=tinysrgb&w=400&search_term=food,soup,asian",
  },
  {
    id: 5,
    name: "Bakso Beranak",
    price: 28000,
    description: "Bakso besar berisi bakso kecil di dalamnya, unik dan lezat",
    image: "https://images.pexels.com/photos/5409011/pexels-photo-5409011.jpeg?auto=compress&cs=tinysrgb&w=400&search_term=meatball,food,asian",
  },
  {
    id: 6,
    name: "Bakso Keju",
    price: 32000,
    description: "Bakso dengan isian keju mozzarella yang meleleh saat digigit",
    image: "https://images.pexels.com/photos/4518598/pexels-photo-4518598.jpeg?auto=compress&cs=tinysrgb&w=400&search_term=food,soup,noodle",
  },
];

let cart = [];
let orders = [];
let customerOrders = [];
let nextOrderId = 1;
let isAdminLoggedIn = false;
let isCustomerLoggedIn = false;
let currentAdmin = null;
let currentCustomer = null;

// Credentials
const adminCredentials = {
  username: "admin",
  password: "admin123",
};

const customerCredentials = {
  username: "customer",
  password: "customer123",
};

// Page Management
function showPage(pageName) {
  // Check admin access
  if (pageName === "admin" && !isAdminLoggedIn) {
    showPage("login");
    return;
  }

  // Check customer profile access
  if (pageName === "customer-profile" && !isCustomerLoggedIn) {
    showPage("customer-login");
    return;
  }

  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => page.classList.remove("active"));
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => link.classList.remove("active"));
  if (pageName === "customer") {
    document.getElementById("customer-page").classList.add("active");
    if (navLinks[0]) navLinks[0].classList.add("active");
  } else if (pageName === "menu") {
    document.getElementById("menu-page").classList.add("active");
    if (navLinks[1]) navLinks[1].classList.add("active");
    renderMenu();
  } else if (pageName === "customer-login") {
    document.getElementById("customer-login-page").classList.add("active");
  } else if (pageName === "customer-profile") {
    document.getElementById("customer-profile-page").classList.add("active");
    renderCustomerProfile();
  } else if (pageName === "login") {
    document.getElementById("login-page").classList.add("active");
  } else if (pageName === "admin") {
    document.getElementById("admin-page").classList.add("active");
    renderAdminDashboard();
  }
}

// Update Navigation Based on Login Status
function updateNavigation() {
  const customerNav = document.getElementById("customer_navigation");
  const customerNavLoggedIn = document.getElementById("customer_navigation_logged_in");
  if (isCustomerLoggedIn) {
    customerNav.style.display = "none";
    customerNavLoggedIn.style.display = "block";
    updateCustomerUsername();
  } else {
    customerNav.style.display = "block";
    customerNavLoggedIn.style.display = "none";
  }
}

// Customer Login Functions
document.addEventListener("DOMContentLoaded", function () {
  const customerLoginForm = document.getElementById("customer-login-form");
  if (customerLoginForm) {
    customerLoginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleCustomerLogin();
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleLogin();
    });
  }
  showPage("customer");
  updateCartCount();
  updateNavigation();
});

function handleCustomerLogin() {
  const username = document.getElementById("customer-username").value;
  const password = document.getElementById("customer-password").value;
  if (username === customerCredentials.username && password === customerCredentials.password) {
    isCustomerLoggedIn = true;
    currentCustomer = username;
    alert("Login berhasil! Selamat datang, " + username);
    updateNavigation();
    showPage("customer");
  } else {
    alert("Username atau password salah!");
  }
}

function updateCustomerUsername() {
  if (isCustomerLoggedIn && currentCustomer) {
    const usernameElement = document.getElementById("customer-username-nav");
    if (usernameElement) {
      usernameElement.textContent = "Halo, " + currentCustomer;
    }
  }
}

function logoutCustomer() {
  if (confirm("Apakah Anda yakin ingin logout?")) {
    isCustomerLoggedIn = false;
    currentCustomer = null;
    alert("Anda telah logout");
    updateNavigation();
    showPage("customer");
  }
}

// Customer Profile
function renderCustomerProfile() {
  if (!isCustomerLoggedIn) {
    showPage("customer-login");
    return;
  }

  const profileUsername = document.getElementById("profile-username");
  if (profileUsername) {
    profileUsername.textContent = currentCustomer;
  }

  const ordersList = document.getElementById("customer-orders-list");
  if (!ordersList) return;

  if (customerOrders.length === 0) {
    ordersList.innerHTML = `
      <div class="empty-orders">
        <div class="empty-orders-icon">📦</div>
        <h3>Belum ada pesanan</h3>
        <p>Anda belum melakukan pemesanan. Silakan pesan bakso favorit Anda!</p>
      </div>
    `;
    return;
  }

  ordersList.innerHTML = "";
  customerOrders.forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.className = "order-card";
    const itemsList = order.items.map((item) => `${item.name} (${item.quantity}x) - Rp ${(item.price * item.quantity).toLocaleString()}`).join("<br>");
    const statusBadge = order.status === "pending" ? "badge-pending" : order.status === "completed" ? "badge-completed" : "badge-cancelled";
    orderCard.innerHTML = `
      <div class="order-header">
        <div>
          <div class="order-id">Pesanan #${order.id}</div>
          <div class="order-date">${order.date}</div>
        </div>
        <span class="badge ${statusBadge}">${order.status}</span>
      </div>
      <div class="order-items">
        <p><strong>Items:</strong></p>
        <p>${itemsList}</p>
      </div>
      <div class="order-footer">
        <div class="order-total">Total: Rp ${order.total.toLocaleString()}</div>
      </div>
    `;
    ordersList.appendChild(orderCard);
  });
}

// Admin Login Functions
function handleLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  if (username === adminCredentials.username && password === adminCredentials.password) {
    isAdminLoggedIn = true;
    currentAdmin = username;
    alert("Login berhasil! Selamat datang, " + username);
    showPage("admin");
    updateAdminUsername();
  } else {
    alert("Username atau password salah!");
  }
}

function updateAdminUsername() {
  if (isAdminLoggedIn && currentAdmin) {
    const usernameElement = document.getElementById("admin-username");
    if (usernameElement) {
      usernameElement.textContent = "Halo, " + currentAdmin;
    }
  }
}

function logout() {
  if (confirm("Apakah Anda yakin ingin logout?")) {
    isAdminLoggedIn = false;
    currentAdmin = null;
    alert("Anda telah logout");
    showPage("customer");
  }
}

// Menu Functions
function renderMenu() {
  const menuGrid = document.getElementById("menu-grid");
  menuGrid.innerHTML = "";
  products.forEach((product) => {
    const menuCard = document.createElement("div");
    menuCard.className = "menu-card";
    menuCard.id = `menu-card-${product.id}`;
    menuCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="menu-image">
      <div class="menu-info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="menu-price">Rp ${product.price.toLocaleString()}</div>
        <div class="menu-actions">
          <div class="qty-control">
            <button class="qty-btn" onclick="decreaseQty(${product.id})">-</button>
            <input type="number" class="qty-input" id="qty-${product.id}" value="1" min="1" readonly>
            <button class="qty-btn" onclick="increaseQty(${product.id})">+</button>
          </div>
          <button class="btn-add-cart" onclick="addToCart(${product.id})">Tambah</button>
        </div>
      </div>
    `;
    menuGrid.appendChild(menuCard);
  });
}

function increaseQty(productId) {
  const qtyInput = document.getElementById(`qty-${productId}`);
  qtyInput.value = parseInt(qtyInput.value) + 1;
}

function decreaseQty(productId) {
  const qtyInput = document.getElementById(`qty-${productId}`);
  if (parseInt(qtyInput.value) > 1) {
    qtyInput.value = parseInt(qtyInput.value) - 1;
  }
}

// Cart Functions
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  const qty = parseInt(document.getElementById(`qty-${productId}`).value);
  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: product.image,
    });
  }
  updateCartCount();
  alert(`${product.name} berhasil ditambahkan ke keranjang!`);
  document.getElementById(`qty-${productId}`).value = 1;
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.getElementById("cart-count");
  const cartCountLogged = document.getElementById("cart-count-logged");
  if (cartCount) cartCount.textContent = totalItems;
  if (cartCountLogged) cartCountLogged.textContent = totalItems;
}

function showCart() {
  renderCart();
  document.getElementById("cart-modal").classList.add("active");
}

function closeCart() {
  document.getElementById("cart-modal").classList.remove("active");
}

function renderCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart">Keranjang Anda kosong</div>';
    document.getElementById("cart-total").textContent = "Rp 0";
    return;
  }
  cartItemsContainer.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="cart-item-price">Rp ${item.price.toLocaleString()} x ${item.quantity}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateCartQty(${index}, -1)">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="updateCartQty(${index}, 1)">+</button>
        </div>
      </div>
      <button class="btn-remove" onclick="removeFromCart(${index})">Hapus</button>
    `;
    cartItemsContainer.appendChild(cartItem);
  });
  document.getElementById("cart-total").textContent = `Rp ${total.toLocaleString()}`;
}

function updateCartQty(index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  updateCartCount();
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartCount();
  renderCart();
}

function checkout() {
  if (cart.length === 0) {
    alert("Keranjang Anda kosong!");
    return;
  }
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id: nextOrderId++,
    items: [...cart],
    total: total,
    status: "pending",
    date: new Date().toLocaleString("id-ID"),
    customer: isCustomerLoggedIn ? currentCustomer : "Guest",
  };
  orders.push(order);
  if (isCustomerLoggedIn) {
    customerOrders.push(order);
  }
  cart = [];
  updateCartCount();
  closeCart();
  alert(`Pesanan berhasil! Total: Rp ${total.toLocaleString()}\nNomor Pesanan: #${order.id}`);
}

// Admin Functions
function renderAdminDashboard() {
  if (!isAdminLoggedIn) {
    showPage("login");
    return;
  }
  updateAdminUsername();
  updateStats();
  renderProductsTable();
  renderOrdersTable();
}

function updateStats() {
  document.getElementById("total-orders").textContent = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  document.getElementById("total-revenue").textContent = `Rp ${totalRevenue.toLocaleString()}`;
  document.getElementById("total-products").textContent = products.length;
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  document.getElementById("pending-orders").textContent = pendingOrders;
}

function showAdminTab(tabName) {
  const tabs = document.querySelectorAll(".tab-content");
  tabs.forEach((tab) => tab.classList.remove("active"));
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => btn.classList.remove("active"));
  if (tabName === "products") {
    document.getElementById("products-tab").classList.add("active");
    tabButtons[0].classList.add("active");
    renderProductsTable();
  } else if (tabName === "orders") {
    document.getElementById("orders-tab").classList.add("active");
    tabButtons[1].classList.add("active");
    renderOrdersTable();
  }
}

function renderProductsTable() {
  const productsTable = document.getElementById("products-table");
  if (products.length === 0) {
    productsTable.innerHTML = '<p style="padding: 2rem; text-align: center;">Belum ada produk</p>';
    return;
  }
  let tableHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Gambar</th>
          <th>Nama</th>
          <th>Harga</th>
          <th>Deskripsi</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
  `;
  products.forEach((product) => {
    tableHTML += `
      <tr>
        <td>${product.id}</td>
        <td><img src="${product.image}" alt="${product.name}"></td>
        <td>${product.name}</td>
        <td>Rp ${product.price.toLocaleString()}</td>
        <td>${product.description}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
            <button class="btn-delete" onclick="deleteProduct(${product.id})">Hapus</button>
          </div>
        </td>
      </tr>
    `;
  });
  tableHTML += "</tbody></table>";
  productsTable.innerHTML = tableHTML;
}

function renderOrdersTable() {
  const ordersTable = document.getElementById("orders-table");
  if (orders.length === 0) {
    ordersTable.innerHTML = '<p style="padding: 2rem; text-align: center;">Belum ada pesanan</p>';
    return;
  }
  let tableHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>ID Pesanan</th>
          <th>Pelanggan</th>
          <th>Tanggal</th>
          <th>Items</th>
          <th>Total</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
  `;
  orders.forEach((order) => {
    const itemsList = order.items.map((item) => `${item.name} (${item.quantity}x)`).join(", ");
    const statusBadge = order.status === "pending" ? "badge-pending" : order.status === "completed" ? "badge-completed" : "badge-cancelled";
    tableHTML += `
      <tr>
        <td>#${order.id}</td>
        <td>${order.customer || "Guest"}</td>
        <td>${order.date}</td>
        <td>${itemsList}</td>
        <td>Rp ${order.total.toLocaleString()}</td>
        <td><span class="badge ${statusBadge}">${order.status}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" onclick="updateOrderStatus(${order.id}, 'completed')">Selesai</button>
            <button class="btn-delete" onclick="updateOrderStatus(${order.id}, 'cancelled')">Batal</button>
          </div>
        </td>
      </tr>
    `;
  });
  tableHTML += "</tbody></table>";
  ordersTable.innerHTML = tableHTML;
}

function updateOrderStatus(orderId, newStatus) {
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = newStatus;
    // Update customer orders if applicable
    const customerOrder = customerOrders.find((o) => o.id === orderId);
    if (customerOrder) {
      customerOrder.status = newStatus;
    }
    renderOrdersTable();
    updateStats();
    alert(`Status pesanan #${orderId} diubah menjadi ${newStatus}`);
  }
}

// Product Management
function showAddProduct() {
  document.getElementById("product-modal-title").textContent = "Tambah Produk";
  document.getElementById("product-form").reset();
  document.getElementById("product-id").value = "";
  document.getElementById("product-modal").classList.add("active");
}

function closeProductModal() {
  document.getElementById("product-modal").classList.remove("active");
}

function editProduct(productId) {
  const product = products.find((p) => p.id === productId);
  if (product) {
    document.getElementById("product-modal-title").textContent = "Edit Produk";
    document.getElementById("product-id").value = product.id;
    document.getElementById("product-name").value = product.name;
    document.getElementById("product-price").value = product.price;
    document.getElementById("product-desc").value = product.description;
    document.getElementById("product-image").value = product.image;
    document.getElementById("product-modal").classList.add("active");
  }
}

function deleteProduct(productId) {
  if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
    products = products.filter((p) => p.id !== productId);
    renderProductsTable();
    updateStats();
    alert("Produk berhasil dihapus!");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const productForm = document.getElementById("product-form");
  if (productForm) {
    productForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const productId = document.getElementById("product-id").value;
      const name = document.getElementById("product-name").value;
      const price = parseInt(document.getElementById("product-price").value);
      const description = document.getElementById("product-desc").value;
      const image = document.getElementById("product-image").value;
      if (productId) {
        const product = products.find((p) => p.id === parseInt(productId));
        if (product) {
          product.name = name;
          product.price = price;
          product.description = description;
          product.image = image;
          alert("Produk berhasil diupdate!");
        }
      } else {
        const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
        products.push({
          id: newId,
          name: name,
          price: price,
          description: description,
          image: image,
        });
        alert("Produk berhasil ditambahkan!");
      }
      closeProductModal();
      renderProductsTable();
      updateStats();
    });
  }
});
