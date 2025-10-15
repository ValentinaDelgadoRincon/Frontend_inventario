const API_URL = "http://localhost:3000/api";

//Iniciacion de la aplicacion
function initializeApp() {
  showTab("dashboard");
  loadDashboard();
  console.log("Aplicación inicializada correctamente");
}

//Navegacion entre secciones
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

//Gestion de productos
async function registrarProducto(event) {
  event.preventDefault();

  const producto = {
    codigo: document.getElementById("codigoProd").value.trim(),
    nombre: document.getElementById("nombreProd").value.trim(),
    stockMinimo: Number(document.getElementById("stockMinProd").value) || 0,
  };

  if (!producto.codigo || !producto.nombre) {
    showMessage("Completa los campos obligatorios.", "warning");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });

    if (!res.ok) throw new Error("Error al registrar producto");
    showMessage("Producto registrado correctamente", "success");
    limpiarFormProducto();
  } catch (error) {
    console.error(error);
    showMessage("Error al registrar producto.", "error");
  }
}

function limpiarFormProducto() {
  document.getElementById("formProducto").reset();
  showMessage("Formulario de producto limpiado.", "info");
}

//Movimiento de inventario
async function registrarMovimiento(event) {
  event.preventDefault();

  const movimiento = {
    codigoProducto: document.getElementById("codigoMov").value.trim(),
    fecha: document.getElementById("fechaMov").value,
    tipo: document.getElementById("tipoMov").value,
    cantidad: Number(document.getElementById("cantMov").value),
    observaciones: document.getElementById("obsMov").value.trim(),
  };

  if (!movimiento.codigoProducto || !movimiento.fecha || !movimiento.tipo) {
    showMessage("Completa los campos obligatorios del movimiento.", "warning");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/movimientos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movimiento),
    });

    if (!res.ok) throw new Error("Error al guardar movimiento");
    showMessage("Movimiento guardado correctamente", "success");
    limpiarFormMovimiento();
  } catch (error) {
    console.error(error);
    showMessage("Error al guardar movimiento.", "error");
  }
}

function limpiarFormMovimiento() {
  document.getElementById("formMovimiento").reset();
  showMessage("Formulario de movimiento limpiado.", "info");
}

//Inventario, mostrar,alertas,exportar
async function mostrarStock() {
  const cont = document.getElementById("stockTable");
  const loading = document.getElementById("loading");
  loading.style.display = "block";
  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();
    loading.style.display = "none";

    if (!productos.length) {
      cont.innerHTML = "<p>No hay productos registrados.</p>";
      return;
    }

    cont.innerHTML = `
      <table>
        <thead><tr><th>Código</th><th>Nombre</th><th>Stock Actual</th><th>Stock Mínimo</th></tr></thead>
        <tbody>
          ${productos
            .map(
              (p) => `
            <tr class="${p.stockActual <= p.stockMinimo ? "alert-row" : ""}">
              <td>${p.codigo}</td>
              <td>${p.nombre}</td>
              <td>${p.stockActual}</td>
              <td>${p.stockMinimo}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>`;
  } catch (error) {
    console.error(error);
    showMessage("Error al mostrar el inventario.", "error");
  }
}

async function mostrarAlertas() {
  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();
    const alertas = productos.filter((p) => p.stockActual <= p.stockMinimo);
    const cont = document.getElementById("stockTable");

    if (!alertas.length) {
      cont.innerHTML = "<p>No hay alertas de stock.</p>";
      showMessage("No hay productos en alerta.", "info");
      return;
    }

    cont.innerHTML = `
      <table>
        <thead><tr><th>Código</th><th>Nombre</th><th>Stock Actual</th><th>Stock Mínimo</th></tr></thead>
        <tbody>
          ${alertas
            .map(
              (p) => `
            <tr class="alert-row">
              <td>${p.codigo}</td>
              <td>${p.nombre}</td>
              <td>${p.stockActual}</td>
              <td>${p.stockMinimo}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>`;
  } catch (error) {
    console.error(error);
    showMessage("Error al mostrar alertas.", "error");
  }
}

async function exportarStock() {
  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();
    if (!productos.length) {
      showMessage("No hay productos para exportar.", "warning");
      return;
    }

    const csv = [
      ["Código", "Nombre", "Stock Actual", "Stock Mínimo"].join(","),
      ...productos.map((p) =>
        [p.codigo, p.nombre, p.stockActual, p.stockMinimo].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "inventario.csv";
    link.click();
    showMessage("Inventario exportado correctamente.", "success");
  } catch (error) {
    showMessage("Error al exportar inventario.", "error");
    console.error(error);
  }
}

//Reportes
async function mostrarHistorial() {
  const cont = document.getElementById("historialTable");
  try {
    const res = await fetch(`${API_URL}/movimientos`);
    const movs = await res.json();
    if (!movs.length) {
      cont.innerHTML = "<p>No hay movimientos registrados.</p>";
      return;
    }

    cont.innerHTML = `
      <table>
        <thead><tr><th>Código</th><th>Fecha</th><th>Tipo</th><th>Cantidad</th><th>Obs</th></tr></thead>
        <tbody>
          ${movs
            .map(
              (m) => `
            <tr>
              <td>${m.codigoProducto}</td>
              <td>${m.fecha}</td>
              <td>${m.tipo}</td>
              <td>${m.cantidad}</td>
              <td>${m.observaciones || ""}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>`;
  } catch (error) {
    console.error(error);
    showMessage("Error al generar reporte.", "error");
  }
}

async function exportarReporte() {
  try {
    const res = await fetch(`${API_URL}/movimientos`);
    const movs = await res.json();
    if (!movs.length) {
      showMessage("No hay movimientos para exportar.", "warning");
      return;
    }

    const csv = [
      ["Código Producto", "Fecha", "Tipo", "Cantidad", "Observaciones"].join(
        ","
      ),
      ...movs.map((m) =>
        [
          m.codigoProducto,
          m.fecha,
          m.tipo,
          m.cantidad,
          m.observaciones || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte_movimientos.csv";
    link.click();
    showMessage("Reporte exportado correctamente.", "success");
  } catch (error) {
    showMessage("Error al exportar reporte.", "error");
    console.error(error);
  }
}

//Buscar productos
async function buscarProducto() {
  const texto = document
    .getElementById("buscarTexto")
    .value.trim()
    .toLowerCase();
  const cont = document.getElementById("resultadosBusqueda");
  if (!texto) {
    showMessage("Escribe algo para buscar.", "info");
    return;
  }

  const res = await fetch(`${API_URL}/productos`);
  const productos = await res.json();
  const resultados = productos.filter(
    (p) =>
      p.codigo.toLowerCase().includes(texto) ||
      p.nombre.toLowerCase().includes(texto)
  );

  if (!resultados.length) {
    cont.innerHTML = "<p>No se encontraron resultados.</p>";
    return;
  }

  cont.innerHTML = `
    <table>
      <thead><tr><th>Código</th><th>Nombre</th><th>Stock</th></tr></thead>
      <tbody>
        ${resultados
          .map(
            (r) =>
              `<tr><td>${r.codigo}</td><td>${r.nombre}</td><td>${r.stockActual}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>`;
  showMessage(`${resultados.length} producto(s) encontrados.`, "success");
}

function limpiarBusqueda() {
  document.getElementById("buscarTexto").value = "";
  document.getElementById("resultadosBusqueda").innerHTML = "";
  showMessage("Búsqueda limpiada.", "info");
}

//Configuracion del sistema
async function validarIntegridad() {
  const resultDiv = document.getElementById("configResults");
  try {
    const [prodRes, movRes] = await Promise.all([
      fetch(`${API_URL}/productos`),
      fetch(`${API_URL}/movimientos`),
    ]);
    const productos = await prodRes.json();
    const inconsistencias = productos.filter((p) => p.stockActual < 0);

    if (inconsistencias.length > 0) {
      resultDiv.innerHTML = `<p class="error">${inconsistencias.length} productos con stock negativo.</p>`;
      showMessage("Inconsistencias detectadas.", "warning");
    } else {
      resultDiv.innerHTML = `<p class="success">✔️ Integridad validada correctamente.</p>`;
      showMessage("Integridad del sistema validada.", "success");
    }
  } catch (error) {
    showMessage("Error al validar integridad.", "error");
    console.error(error);
  }
}

function inicializarSistema() {
  showMessage("Sistema inicializado correctamente.", "success");
}

function limpiarTodosFormularios() {
  document.querySelectorAll("form").forEach((form) => form.reset());
  showMessage("Todos los formularios fueron limpiados.", "info");
}

function confirmarReset() {
  if (confirm("¿Deseas reiniciar completamente el sistema?")) {
    localStorage.clear();
    showMessage("Sistema reseteado completamente.", "warning");
  }
}

//Alertas
function showMessage(msg, type = "info") {
  const colors = {
    success: "#4CAF50",
    error: "#E53935",
    warning: "#FFB300",
    info: "#2196F3",
  };
  const alert = document.createElement("div");
  alert.textContent = msg;
  alert.style.background = colors[type];
  alert.style.color = "white";
  alert.style.padding = "10px 15px";
  alert.style.margin = "10px";
  alert.style.borderRadius = "8px";
  alert.style.fontWeight = "bold";
  alert.style.transition = "opacity 0.5s";
  alert.style.position = "fixed";
  alert.style.bottom = "20px";
  alert.style.right = "20px";
  alert.style.zIndex = "9999";
  document.body.appendChild(alert);
  setTimeout(() => (alert.style.opacity = "0"), 2500);
  setTimeout(() => alert.remove(), 3000);
}
