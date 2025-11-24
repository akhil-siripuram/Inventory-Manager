(function () {

  // Token storage (from login)
  let authToken = null;

  // DOM - Views
  const loginView = document.getElementById("login-view");
  const locView = document.getElementById("locations-view");
  const prodView = document.getElementById("products-view");

  // Login form
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginError = document.getElementById("login-error");
  const logoutBtn = document.getElementById("logout-btn");
  const headerActions = document.getElementById("header-actions");

  // Locations view
  const locationsEl = document.getElementById("locations");
  const productsEl = document.getElementById("products-list");
  const backBtn = document.getElementById("back-to-locations");
  const createLocBtn = document.getElementById("create-location");
  const addProductBtn = document.getElementById("add-product-btn");

  const newLocInput = document.getElementById("new-location-name");
  const productNameInput = document.getElementById("product-name");
  const productCategoryInput = document.getElementById("product-category");

  const locationTitle = document.getElementById("location-title");
  const searchInput = document.getElementById("product-search");

  // Sidebar elements
  const sidebar = document.getElementById("locations-sidebar");
  const closeSidebarBtn = document.getElementById("close-sidebar");
  const locationsList = document.getElementById("locations-list");
  const editLocationsBtn = document.getElementById("edit-locations-btn");

  let currentLocation = null;
  let currentProducts = [];

  function categoryChip(c) {
    if (!c) return "";
    const color =
      c === "food" ? "chip-green" :
      c === "tools" ? "chip-blue" :
      "chip-yellow";
    return `<span class="product-chip ${color}">${c}</span>`;
  }

  async function api(path, body) {
    const headers = { "Content-Type": "application/json" };
    // Add Authorization header if token exists
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    const res = await fetch(path, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      credentials: 'include', // include cookies (refresh token)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "API error");
    return data;
  }

  // LOAD LOCATIONS
  async function loadLocations() {
    // Token-based auth: no need to pass userId, it comes from req.user via auth middleware
    const data = await api("/api/v1/locations/user", {});
    renderLocations(data.locations || []);
    renderLocationsSidebar(data.locations || []);
  }

  function renderLocations(locations) {
    locationsEl.innerHTML = "";

    if (!locations.length) {
      locationsEl.innerHTML = `<div>No locations added yet.</div>`;
      return;
    }

    locations.forEach(loc => {
      const card = document.createElement("div");
      card.className = "location-card";
      card.innerHTML = `
        <div class="location-card-header">
          <h3>${escapeHtml(loc.name)}</h3>
        </div>
      `;
      card.onclick = () => openLocation(loc);
      locationsEl.appendChild(card);
    });
  }

  // Render locations in the sidebar for editing
  function renderLocationsSidebar(locations) {
    locationsList.innerHTML = "";

    if (!locations.length) {
      locationsList.innerHTML = `<div class="empty-msg">No locations yet.</div>`;
      return;
    }

    locations.forEach(loc => {
      const row = document.createElement("div");
      row.className = "sidebar-location-row";
      row.innerHTML = `
        <span class="location-name">${escapeHtml(loc.name)}</span>
        <button class="delete-btn">Delete</button>
      `;
      
      const deleteBtn = row.querySelector(".delete-btn");
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteLocation(loc);
      };

      locationsList.appendChild(row);
    });
  }

   // DELETE LOCATION
   async function deleteLocation(loc) {
     if (!confirm(`Delete "${loc.name}" and all its products?`)) {
       return;
     }
   
    try {
      const headers = { "Content-Type": "application/json" };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      const res = await fetch("/api/v1/locations", {
        method: "DELETE",
        headers,
        body: JSON.stringify({
          locationId: loc._id,
        }),
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "API error");
      loadLocations();
    } catch (err) {
      alert("Error deleting location: " + err.message);
    }
  }
   

  // OPEN LOCATION
  async function openLocation(loc) {
    currentLocation = loc;
    locationTitle.textContent = loc.name;

    locView.classList.add("hidden");
    prodView.classList.remove("hidden");
    
    // Hide Edit Locations button in products view
    editLocationsBtn.style.display = "none";

    loadProducts(loc._id);
  }

  // LOAD PRODUCTS
  async function loadProducts(locationId) {
    const data = await api("/api/v1/products/by-location", {
      locationId,
    });
    currentProducts = data.products || [];
    renderProducts(currentProducts);
  }

  function renderProducts(list) {
    productsEl.innerHTML = "";

    if (!list.length) {
      productsEl.innerHTML = `<div class="empty-msg">No products here yet.</div>`;
      return;
    }

    // Build table
    const table = document.createElement('table');
    table.className = 'products-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th style="width:48px">#</th>
          <th>Name</th>
          <th style="width:180px">Category</th>
          <th style="width:120px">Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    list.forEach((p, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.category || '')}</td>
        <td><button class="btn-danger btn-sm" data-id="${p._id}">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });

    productsEl.appendChild(table);

    // Attach delete handlers
    table.querySelectorAll('.btn-danger').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.getAttribute('data-id');
        if (!confirm('Delete this product?')) return;
        try {
          const headers = {};
          if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
          const res = await fetch(`/api/v1/products/${id}`, { method: 'DELETE', headers, credentials: 'include' });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.message || 'API error');
          loadProducts(currentLocation._id);
        } catch (err) {
          alert('Error deleting product: ' + err.message);
        }
      });
    });
  }

  // SEARCH
  searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase();
    const filtered = currentProducts.filter(p =>
      p.name.toLowerCase().includes(q)
    );
    renderProducts(filtered);
  };

  // ACTIONS
  createLocBtn.onclick = async () => {
    const name = newLocInput.value.trim();
    if (!name) return;

    await api("/api/v1/locations", { name });
    newLocInput.value = "";
    loadLocations();
  };

  addProductBtn.onclick = async () => {
    if (!currentLocation) return;

    const name = productNameInput.value.trim();
    const category = productCategoryInput.value.trim();
    if (!name) return;

    await api("/api/v1/products", {
      name,
      category,
      locationId: currentLocation._id,
    });

    productNameInput.value = "";
    productCategoryInput.value = "";

    loadProducts(currentLocation._id);
  };

  backBtn.onclick = () => {
    prodView.classList.add("hidden");
    locView.classList.remove("hidden");
    
    // Show Edit Locations button again when back to locations view
    editLocationsBtn.style.display = "block";
  };

  // SIDEBAR CONTROLS
  editLocationsBtn.onclick = () => {
    sidebar.classList.toggle("open");
  };

  closeSidebarBtn.onclick = () => {
    sidebar.classList.remove("open");
  };

  // LOGIN & AUTHENTICATION
  function showLoginView() {
    loginView.classList.remove("hidden");
    locView.classList.add("hidden");
    prodView.classList.add("hidden");
    headerActions.style.display = "none";
  }

  function showAppView() {
    loginView.classList.add("hidden");
    locView.classList.remove("hidden");
    headerActions.style.display = "flex";
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      loginError.textContent = "Please fill in all fields";
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Login failed");

      // Store token (if returned in response)
      if (data.token) {
        authToken = data.token;
      }

      // Clear login form
      loginError.textContent = "";
      emailInput.value = "";
      passwordInput.value = "";

      // Show app and load locations
      showAppView();
      loadLocations();
    } catch (err) {
      loginError.textContent = err.message;
    }
  }

  async function handleLogout() {
    try {
      const headers = { "Content-Type": "application/json" };
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
      console.log("Logging out with token:", authToken);
      await fetch("/api/v1/auth/logout", { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    // Clear token and show login
    authToken = null;
    showLoginView();
  }

  loginForm.addEventListener("submit", handleLogin);
  logoutBtn.onclick = handleLogout;

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  // Try to refresh access token using HttpOnly refresh cookie on load
  async function tryRefresh() {
    try {
      const res = await fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Refresh failed');
      if (data.token) {
        authToken = data.token;
        showAppView();
        loadLocations();
        return true;
      }
    } catch (err) {
      console.log('Token refresh failed:', err.message || err);
    }
    return false;
  }

  (async () => {
    const ok = await tryRefresh();
    if (!ok) showLoginView();
  })();

})();
