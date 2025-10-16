const API_URL = "http://localhost:4000";

// Inicialización de la aplicación
function initializeApp() {
  showTab("productos"); // Inicia directamente en el formulario de registro
  console.log("Aplicación inicializada correctamente");
}

// Navegación entre secciones
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
}

// Gestión de productos
async function registrarProducto(event) {
  event.preventDefault();

  const producto = {
    nombre: document.getElementById("nombreProd").value.trim(),
    proveedor: document.getElementById("provProd").value.trim(),
    tipo: document.getElementById("tipoProd").value.trim(),
    precio: parseFloat(document.getElementById("precioProd").value) || 0,
    stock: Number(document.getElementById("stockMinProd").value) || 0,
  };

  if (!producto.nombre || !producto.tipo || producto.precio <= 0) {
    showMessage(
      "Completa todos los campos obligatorios y asegúrate de que el precio sea mayor a 0.",
      "warning"
    );
    return;
  }

  try {
    const res = await fetch(`${API_URL}/videojuegos`, {
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

// Inventario
async function mostrarStock() {
  const cont = document.getElementById("stockTable");
  const loading = document.getElementById("loading");
  loading.style.display = "block";
  try {
    const res = await fetch(`${API_URL}/videojuegos`);
    const productos = await res.json();
    loading.style.display = "none";

    if (!productos.length) {
      cont.innerHTML = "<p>No hay productos registrados.</p>";
      return;
    }

    cont.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Precio</th>
            <th>Stock Actual</th>
            <th>Stock Mínimo</th>
          </tr>
        </thead>
        <tbody>
          ${productos
            .map(
              (p) => `
            <tr class="${p.stockActual <= p.stockMinimo ? "alert-row" : ""}">
              <td>${p.nombre}</td>
              <td>${p.tipo}</td>
              <td>$${p.precio.toFixed(2)}</td>
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

// Mostrar solo alertas
async function mostrarAlertas() {
  try {
    const res = await fetch(`${API_URL}/videojuegos`);
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
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Precio</th>
            <th>Stock Actual</th>
            <th>Stock Mínimo</th>
          </tr>
        </thead>
        <tbody>
          ${alertas
            .map(
              (p) => `
            <tr class="alert-row">
              <td>${p.nombre}</td>
              <td>${p.tipo}</td>
              <td>$${p.precio.toFixed(2)}</td>
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

// Exportar inventario
async function exportarStock() {
  try {
    const res = await fetch(`${API_URL}/videojuegos`);
    const productos = await res.json();
    if (!productos.length) {
      showMessage("No hay productos para exportar.", "warning");
      return;
    }

    const csv = [
      ["Nombre", "Tipo", "Precio", "Stock Actual", "Stock Mínimo"].join(","),
      ...productos.map((p) =>
        [p.nombre, p.tipo, p.precio, p.stockActual, p.stockMinimo].join(",")
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

// Buscar
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

  const res = await fetch(`${API_URL}/videojuegos`);
  const productos = await res.json();
  const resultados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(texto)
  );

  if (!resultados.length) {
    cont.innerHTML = "<p>No se encontraron resultados.</p>";
    return;
  }

  cont.innerHTML = `
    <table>
      <thead><tr><th>Nombre</th><th>Stock</th></tr></thead>
      <tbody>
        ${resultados
          .map((r) => `<tr><td>${r.nombre}</td><td>${r.stockActual}</td></tr>`)
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
