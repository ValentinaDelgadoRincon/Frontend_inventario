const API_URL = "http://localhost:3000/api";

//INICIALIZACIÓN DE LA APLICACIÓN//
function initializeApp() {
  showTab("tab-dashboard");
  mostrarStock();
  loadDashboard();
  console.log("GameVance iniciado correctamente 🚀");
}

//REGISTRO DE PRODUCTOS//
async function registrarProducto(event) {
  event.preventDefault();

  const producto = {
    codigo: document.getElementById("codigoProd").value.trim(),
    nombre: document.getElementById("nombreProd").value.trim(),
    stockMinimo: Number(document.getElementById("stockMinProd").value) || 0,
  };

  try {
    const res = await fetch(`${API_URL}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });

    const data = await res.json();

    if (res.ok) {
      showMessage("Producto registrado correctamente", "success");
      document.getElementById("formProducto").reset();
    } else {
      showMessage(data.message, "error");
    }
  } catch (error) {
    showMessage("Error al registrar producto", "error");
  }
}

//REGISTRO DE MOVIMIENTOS//
async function registrarMovimiento(event) {
  event.preventDefault();

  const movimiento = {
    codigo: document.getElementById("codigoMov").value.trim(),
    fecha: document.getElementById("fechaMov").value,
    tipo: document.getElementById("tipoMov").value,
    cantidad: Number(document.getElementById("cantMov").value),
    observaciones: document.getElementById("obsMov").value.trim(),
  };

  try {
    const res = await fetch(`${API_URL}/movimientos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movimiento),
    });

    const data = await res.json();

    if (res.ok) {
      showMessage("Movimiento registrado correctamente", "success");
      document.getElementById("formMovimiento").reset();
      mostrarStock();
    } else {
      showMessage(data.message, "error");
    }
  } catch (error) {
    showMessage("Error al registrar movimiento", "error");
  }
}

//OSTRAR INVENTARIO//
async function mostrarStock() {
  const stockDiv = document.getElementById("stockTable");
  const loading = document.getElementById("loading");
  loading.style.display = "block";

  try {
    const res = await fetch(`${API_URL}/inventario`);
    const productos = await res.json();

    if (!res.ok) throw new Error(productos.message);

    let html = `
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Stock</th>
            <th>Stock Mínimo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
    `;

    productos.forEach((p) => {
      let statusClass = "status-normal";
      let statusText = "Normal";

      if (p.stock === 0) {
        statusClass = "status-zero";
        statusText = "Agotado";
      } else if (p.stock <= p.stockMinimo) {
        statusClass = "status-low";
        statusText = "Bajo stock";
      }

      html += `
        <tr class="${statusClass}">
          <td>${p.codigo}</td>
          <td>${p.nombre}</td>
          <td>${p.stock}</td>
          <td>${p.stockMinimo}</td>
          <td>${statusText}</td>
        </tr>
      `;
    });

    html += "</tbody></table>";
    stockDiv.innerHTML = html;
  } catch (error) {
    stockDiv.innerHTML = `<div class="message error">Error al cargar el inventario</div>`;
  } finally {
    loading.style.display = "none";
  }
}

//BÚSQUEDA DE PRODUCTOS//
async function buscarProducto() {
  const texto = document.getElementById("buscarTexto").value.trim();
  if (!texto) return;

  try {
    const res = await fetch(
      `${API_URL}/productos/buscar?query=${encodeURIComponent(texto)}`
    );
    const productos = await res.json();

    let html = `
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Stock</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
    `;

    productos.forEach((p) => {
      html += `
        <tr>
          <td>${p.codigo}</td>
          <td>${p.nombre}</td>
          <td>${p.stock}</td>
          <td>${p.tipo}</td>
        </tr>
      `;
    });

    html += "</tbody></table>";
    document.getElementById("resultadosBusqueda").innerHTML = html;
  } catch (error) {
    showMessage("Error en la búsqueda", "error");
  }
}

//NAVEGACIÓN ENTRE PESTAÑAS//
function showTab(tabId) {
  
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  document.getElementById(tabId).classList.add("active");

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  const activeLink = [...document.querySelectorAll(".nav-link")].find((link) =>
    link.getAttribute("onclick")?.includes(tabId)
  );
  if (activeLink) activeLink.classList.add("active");

  if (tabId === "inventario") mostrarStock();
  if (tabId === "reportes") mostrarHistorial?.();
}


//DASHBOARD//
async function loadDashboard() {
  try {
    const res = await fetch(`${API_URL}/inventario`);
    const productos = await res.json();

    const statsDiv = document.getElementById("statsGrid");
    const alertsDiv = document.getElementById("alertsContainer");

    const total = productos.length;
    const agotados = productos.filter((p) => p.stock === 0).length;
    const bajos = productos.filter(
      (p) => p.stock > 0 && p.stock <= p.stockMinimo
    ).length;
    const normales = total - agotados - bajos;

    statsDiv.innerHTML = `
      <div class="stat-card"><div class="stat-value">${total}</div><div class="stat-label">Totales</div></div>
      <div class="stat-card"><div class="stat-value text-danger">${agotados}</div><div class="stat-label">Agotados</div></div>
      <div class="stat-card"><div class="stat-value text-warning">${bajos}</div><div class="stat-label">Bajo Stock</div></div>
      <div class="stat-card"><div class="stat-value text-success">${normales}</div><div class="stat-label">Stock Normal</div></div>
    `;

    const alertas = productos.filter((p) => p.stock <= p.stockMinimo);
    alertsDiv.innerHTML = alertas.length
      ? alertas
          .map(
            (p) => `
          <div class="message warning">
            ⚠️ <b>${p.nombre}</b> (${p.codigo}) tiene stock bajo (${p.stock})
          </div>`
          )
          .join("")
      : `<div class="message success">Todo el stock está en niveles normales.</div>`;
  } catch (error) {
    console.error("Error al cargar dashboard:", error);
  }
}

//EXPORTAR INVENTARIO A CSV//
async function exportarStock() {
  try {
    const res = await fetch(`${API_URL}/inventario`);
    const data = await res.json();

    if (!data.length) {
      showMessage("No hay productos para exportar.", "error");
      return;
    }

    let csvContent = "Código,Nombre,Stock,Estado\n";
    data.forEach((item) => {
      csvContent += `${item.codigo},${item.nombre},${item.stock},${item.estado}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "inventario.csv";
    link.click();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventario_gamevance.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showMessage("Inventario exportado correctamente.", "success");
  } catch (error) {
    showMessage("Error al exportar inventario.", "error");
  }
}

//HISTORIAL DE MOVIMIENTOS//
async function mostrarHistorial() {
  try {
    const res = await fetch(`${API_URL}/movimientos`);
    const data = await res.json();

    const tbody = document.querySelector("#tabla-reportes tbody");
    tbody.innerHTML = "";

    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay movimientos registrados.</td></tr>`;
      return;
    }

    data.forEach((mov) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${mov.codigo}</td>
        <td>${mov.tipo}</td>
        <td>${mov.cantidad}</td>
        <td>${mov.fecha ? new Date(mov.fecha).toLocaleDateString() : "—"}</td>
        <td>${mov.descripcion || "Sin descripción"}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error al cargar historial:", error);
  }
}

//CONFIGURACIÓN DEL SISTEMA//
async function validarIntegridad() {
  try {
    const res = await fetch(`${API_URL}/mantenimiento/validar`);
    const data = await res.json();
    showMessage(
      data.mensaje || "Integridad validada correctamente.",
      "success"
    );
  } catch {
    showMessage("Error al validar integridad.", "error");
  }
}

async function inicializarSistema() {
  if (!confirm("¿Estás seguro de que deseas reiniciar el sistema?")) return;
  try {
    const res = await fetch(`${API_URL}/mantenimiento/inicializar`, {
      method: "POST",
    });
    const data = await res.json();
    showMessage(data.mensaje || "Sistema reiniciado correctamente.", "success");
    mostrarStock();
  } catch {
    showMessage("Error al reiniciar el sistema.", "error");
  }
}

//MENSAJES GLOBALES//
function showMessage(text, type = "info") {
  const msg = document.createElement("div");
  msg.className = `message ${type}`;
  msg.textContent = text;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 4000);
}
