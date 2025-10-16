const API_URL = "http://localhost:4000";

//Inicialización del sistema
function initializeApp() {
  showTab("productos");
  console.log("Aplicación inicializada correctamente");
}

//Control de pestañas
function showTab(tabId) {
  document
    .querySelectorAll(".tab-content")
    .forEach((tab) => tab.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");

  document
    .querySelectorAll(".nav-link")
    .forEach((link) => link.classList.remove("active"));
  const activeLink = [...document.querySelectorAll(".nav-link")].find((link) =>
    link.getAttribute("onclick")?.includes(tabId)
  );
  if (activeLink) activeLink.classList.add("active");

  if (tabId === "inventario") mostrarStock();
}

//Registrar Producto
async function registrarProducto(event) {
  event.preventDefault();

  const producto = {
    nombre: document.getElementById("nombreProd").value.trim(),
    proveedor: document.getElementById("provProd").value.trim(),
    tipo: document.getElementById("tipoProd").value.trim(),
    precio: parseFloat(document.getElementById("precioProd").value) || 0,
    stockActual: Number(document.getElementById("stockMinProd").value) || 0,
    stockMinimo: Number(document.getElementById("stockMinProd").value) || 0,
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

    const nuevoProducto = await res.json();
    showMessage("Producto registrado correctamente", "success");

    limpiarFormProducto();

    //Agregarlo directamente al inventario si está visible
    const inventarioVisible = document
      .getElementById("inventario")
      .classList.contains("active");
    if (inventarioVisible) {
      agregarProductoATabla(nuevoProducto);
    }
  } catch (error) {
    console.error(error);
    showMessage("Error al registrar producto.", "error");
  }
}

function limpiarFormProducto() {
  document.getElementById("formProducto").reset();
  showMessage("Formulario de producto limpiado.", "info");
}

//Inventario
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

    renderizarTabla(productos);
  } catch (error) {
    console.error(error);
    showMessage("Error al mostrar el inventario.", "error");
  }
}

//Renderizar tabla completa
function renderizarTabla(productos) {
  const cont = document.getElementById("stockTable");
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
}

//Agregar producto directamente sin recargar todo
function agregarProductoATabla(producto) {
  const tablaBody = document.querySelector("#stockTable table tbody");
  if (!tablaBody) {
    mostrarStock();
    return;
  }

  const fila = document.createElement("tr");
  fila.classList.add(
    producto.stockActual <= producto.stockMinimo ? "alert-row" : ""
  );
  fila.innerHTML = `
    <td>${producto.nombre}</td>
    <td>${producto.tipo}</td>
    <td>$${producto.precio.toFixed(2)}</td>
    <td>${producto.stockActual}</td>
    <td>${producto.stockMinimo}</td>
  `;
  tablaBody.appendChild(fila);
}

//Buscar producto
  const texto = document
    .getElementById("buscarTexto")
    .value.trim()
    .toLowerCase();
  const cont = document.getElementById("resultadosBusqueda");

  if (!texto) {
    showMessage("Escribe algo para buscar.", "info");
    return;
  }

  try {
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
        <thead><tr><th>Nombre</th><th>Tipo</th><th>Precio</th><th>Stock</th></tr></thead>
        <tbody>
          ${resultados
            .map(
              (r) => `
              <tr>
                <td>${r.nombre}</td>
                <td>${r.tipo}</td>
                <td>$${r.precio.toFixed(2)}</td>
                <td>${r.stockActual}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>`;
    showMessage(`${resultados.length} producto(s) encontrados.`, "success");
  } catch (error) {
    console.error(error);
    showMessage("Error al buscar productos.", "error");
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
