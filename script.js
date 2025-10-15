// ===================== Inicialización =====================
function initializeApp() {
  console.log("Inventario Front iniciado");
  loadUnidadYGrupos();
  loadDashboard();
}

// ===================== Navegación =====================
function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.getElementById(tabId).classList.add("active");

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  document
    .querySelector(`.nav-link[onclick="showTab('${tabId}')"]`)
    .classList.add("active");
}

// ===================== Backend Config =====================
const BASE_URL = "http://localhost:3000"; // Cambiar al endpoint de tu backend

// ===================== PRODUCTOS =====================
async function loadUnidadYGrupos() {
  try {
    const resUnidad = await fetch(`${BASE_URL}/unidades`);
    const unidades = await resUnidad.json();
    const unidadSelect = document.getElementById("unidadProd");
    unidadSelect.innerHTML = "";
    unidades.forEach((u) => {
      unidadSelect.innerHTML += `<option value="${u.id}">${u.nombre}</option>`;
    });

    const resGrupo = await fetch(`${BASE_URL}/grupos`);
    const grupos = await resGrupo.json();
    const grupoSelect = document.getElementById("grupoProd");
    grupoSelect.innerHTML = "";
    grupos.forEach((g) => {
      grupoSelect.innerHTML += `<option value="${g.id}">${g.nombre}</option>`;
    });
  } catch (err) {
    console.error("Error cargando unidades y grupos:", err);
  }
}

async function registrarProducto(event) {
  event.preventDefault();
  const producto = {
    codigo: document.getElementById("codigoProd").value.trim(),
    nombre: document.getElementById("nombreProd").value.trim(),
    unidad: document.getElementById("unidadProd").value,
    grupo: document.getElementById("grupoProd").value,
    stockMin: parseFloat(document.getElementById("stockMinProd").value) || 0,
  };

  try {
    const res = await fetch(`${BASE_URL}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });
    const data = await res.json();
    document.getElementById("msgProd").innerText =
      data.mensaje || "Producto registrado!";
    limpiarFormProducto();
    mostrarStock();
  } catch (err) {
    document.getElementById("msgProd").innerText =
      "Error al registrar producto.";
    console.error(err);
  }
}

function limpiarFormProducto() {
  document.getElementById("formProducto").reset();
  document.getElementById("msgProd").innerText = "";
}

// ===================== MOVIMIENTOS =====================
async function registrarMovimiento(event) {
  event.preventDefault();
  const movimiento = {
    codigo: document.getElementById("codigoMov").value.trim(),
    fecha: document.getElementById("fechaMov").value,
    tipo: document.getElementById("tipoMov").value,
    cantidad: parseFloat(document.getElementById("cantMov").value),
    observaciones: document.getElementById("obsMov").value.trim(),
  };

  try {
    const res = await fetch(`${BASE_URL}/movimientos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movimiento),
    });
    const data = await res.json();
    document.getElementById("msgMov").innerText =
      data.mensaje || "Movimiento registrado!";
    limpiarFormMovimiento();
    mostrarStock();
  } catch (err) {
    document.getElementById("msgMov").innerText =
      "Error al registrar movimiento.";
    console.error(err);
  }
}

function limpiarFormMovimiento() {
  document.getElementById("formMovimiento").reset();
  document.getElementById("msgMov").innerText = "";
}

// ===================== STOCK =====================
async function mostrarStock() {
  const container = document.getElementById("stockTable");
  container.innerHTML = "Cargando inventario...";
  try {
    const res = await fetch(`${BASE_URL}/inventario`);
    const stock = await res.json();

    let html = `<table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Nombre</th>
          <th>Grupo</th>
          <th>Unidad</th>
          <th>Stock Actual</th>
          <th>Stock Mínimo</th>
        </tr>
      </thead>
      <tbody>`;
    stock.forEach((p) => {
      html += `<tr>
        <td>${p.codigo}</td>
        <td>${p.nombre}</td>
        <td>${p.grupo}</td>
        <td>${p.unidad}</td>
        <td>${p.stock}</td>
        <td>${p.stockMin}</td>
      </tr>`;
    });
    html += "</tbody></table>";
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = "Error cargando inventario.";
    console.error(err);
  }
}

function mostrarAlertas() {
  const container = document.getElementById("stockTable");
  const rows = Array.from(container.querySelectorAll("tbody tr"));
  rows.forEach((row) => {
    const stock = parseFloat(row.children[4].innerText);
    const stockMin = parseFloat(row.children[5].innerText);
    if (stock > stockMin) row.style.display = "none";
    else row.style.backgroundColor = "#f8d7da";
  });
}

// ===================== DASHBOARD =====================
async function loadDashboard() {
  const container = document.getElementById("statsGrid");
  container.innerHTML = "Cargando dashboard...";
  try {
    const res = await fetch(`${BASE_URL}/dashboard`);
    const data = await res.json();
    container.innerHTML = `
      <div class="stat-card">
        <h3>Total Productos</h3>
        <p>${data.totalProductos}</p>
      </div>
      <div class="stat-card">
        <h3>Movimientos Hoy</h3>
        <p>${data.movimientosHoy}</p>
      </div>
      <div class="stat-card">
        <h3>Stock Crítico</h3>
        <p>${data.stockCritico}</p>
      </div>
    `;
  } catch (err) {
    container.innerHTML = "Error cargando dashboard.";
    console.error(err);
  }
}

function showStockAlerts() {
  document.getElementById("alertsContainer").innerHTML =
    "Función de alertas en construcción...";
}

// ===================== HISTORIAL =====================
async function mostrarHistorial() {
  const desde = document.getElementById("fechaDesde").value;
  const hasta = document.getElementById("fechaHasta").value;
  const tipo = document.getElementById("filtroTipo").value;

  const container = document.getElementById("historialTable");
  container.innerHTML = "Cargando historial...";
  try {
    const res = await fetch(
      `${BASE_URL}/movimientos?desde=${desde}&hasta=${hasta}&tipo=${tipo}`
    );
    const movimientos = await res.json();

    let html = `<table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Código</th>
          <th>Nombre</th>
          <th>Tipo</th>
          <th>Cantidad</th>
          <th>Observaciones</th>
        </tr>
      </thead>
      <tbody>`;
    movimientos.forEach((m) => {
      html += `<tr>
        <td>${m.fecha}</td>
        <td>${m.codigo}</td>
        <td>${m.nombre}</td>
        <td>${m.tipo}</td>
        <td>${m.cantidad}</td>
        <td>${m.observaciones || ""}</td>
      </tr>`;
    });
    html += "</tbody></table>";
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = "Error cargando historial.";
    console.error(err);
  }
}

// ===================== BÚSQUEDA =====================
async function buscarProducto() {
  const texto = document.getElementById("buscarTexto").value.trim();
  const container = document.getElementById("resultadosBusqueda");
  container.innerHTML = "Buscando...";
  try {
    const res = await fetch(`${BASE_URL}/productos/buscar?query=${texto}`);
    const resultados = await res.json();

    if (resultados.length === 0) {
      container.innerHTML = "No se encontraron productos.";
      return;
    }

    let html = `<table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Nombre</th>
          <th>Grupo</th>
          <th>Unidad</th>
          <th>Stock</th>
        </tr>
      </thead>
      <tbody>`;
    resultados.forEach((p) => {
      html += `<tr>
        <td>${p.codigo}</td>
        <td>${p.nombre}</td>
        <td>${p.grupo}</td>
        <td>${p.unidad}</td>
        <td>${p.stock}</td>
      </tr>`;
    });
    html += "</tbody></table>";
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = "Error realizando búsqueda.";
    console.error(err);
  }
}

function limpiarBusqueda() {
  document.getElementById("buscarTexto").value = "";
  document.getElementById("resultadosBusqueda").innerHTML = "";
}

// ===================== CONFIGURACIÓN =====================
function validarIntegridad() {
  document.getElementById("configResults").innerText =
    "Validando integridad del sistema...";
  // Aquí puedes agregar fetch a backend si existe endpoint
}

function inicializarSistema() {
  document.getElementById("configResults").innerText =
    "Inicializando sistema...";
  // Aquí puedes agregar fetch a backend si existe endpoint
}

function limpiarTodosFormularios() {
  limpiarFormProducto();
  limpiarFormMovimiento();
  limpiarBusqueda();
}

function confirmarReset() {
  if (confirm("¿Estás seguro de resetear el sistema?")) {
    document.getElementById("configResults").innerText = "Sistema reseteado.";
  }
}
