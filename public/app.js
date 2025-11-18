(function () {

  const USER_ID = "6918697758f0f0e4a01b2332";

  // DOM
  const locationsEl = document.getElementById("locations");
  const productsEl = document.getElementById("products-list");

  const locView = document.getElementById("locations-view");
  const prodView = document.getElementById("products-view");

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
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "API error");
    return data;
  }

  // LOAD LOCATIONS
  async function loadLocations() {
    const data = await api("/api/v1/locations/user", { userId: USER_ID });
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
      const res = await fetch("/api/v1/locations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: loc._id,
          userId: USER_ID,
        }),
      });

      const data = await res.json().catch(() => ({}));
      console.log(data);
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
      userId: USER_ID,
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
          const res = await fetch(`/api/v1/products/${id}`, { method: 'DELETE' });
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

    await api("/api/v1/locations", { name, userId: USER_ID });
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
      userId: USER_ID,
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

  // MODAL CONTROLS
  // SIDEBAR CONTROLS
  editLocationsBtn.onclick = () => {
    sidebar.classList.toggle("open");
  };

  closeSidebarBtn.onclick = () => {
    sidebar.classList.remove("open");
  };

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  loadLocations();

})();
