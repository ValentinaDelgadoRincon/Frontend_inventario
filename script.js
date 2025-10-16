const API_URL = "http://localhost:4000";

// Inicialización
function initializeApp() {
  showTab("productos");
  console.log("Aplicación inicializada correctamente");
}

// Mostrar mensajes (simple)
function showMessage(message, type = "info") {
  const box = document.getElementById("msgProd");
  if (!box) return;
  box.textContent = message;
  box.className = `msg ${type}`;
  box.style.display = "block";
  setTimeout(() => (box.style.display = "none"), 3000);
}

// Cambiar pestañas
function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.style.display = "none";
  });
  document.getElementById(tabId).style.display = "block";
}

// Limpiar formulario
function limpiarFormProducto() {
  document.getElementById("formProducto").reset();
  showMessage("Formulario limpio.", "info");
}

// Registrar producto
async function registrarProducto(event) {
  event.preventDefault();

  const producto = {
    nombre: document.getElementById("nombreProd").value.trim(),
    tipo: document.getElementById("tipoProd").value.trim(),
    proveedor: document.getElementById("provProd").value.trim(),
    precio: parseFloat(document.getElementById("precioProd").value) || 0,
    stock: parseInt(document.getElementById("stockMinProd").value) || 0,
  };

  if (!producto.nombre || !producto.tipo || !producto.proveedor) {
    showMessage("Completa todos los campos obligatorios.", "error");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/videojuegos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });

    if (!res.ok) throw new Error("Error al registrar producto");

    showMessage("✅ Producto registrado con éxito.", "success");
    limpiarFormProducto();
    mostrarStock(); // Actualiza sin recargar
  } catch (error) {
    console.error(error);
    showMessage("❌ Error al registrar el producto.", "error");
  }
}

// Mostrar inventario
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
            <th>Proveedor</th>
            <th>Precio</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          ${productos
            .map(
              (p) => `
              <tr>
                <td>${p.nombre}</td>
                <td>${p.tipo}</td>
                <td>${p.proveedor}</td>
                <td>$${p.precio.toFixed(2)}</td>
                <td>${p.stock}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>`;
  } catch (error) {
    console.error(error);
    showMessage("Error al mostrar inventario.", "error");
  }
}

// Mostrar alertas de stock bajo
async function mostrarAlertas() {
  const cont = document.getElementById("stockTable");
  const loading = document.getElementById("loading");
  loading.style.display = "block";

  try {
    const res = await fetch(`${API_URL}/videojuegos`);
    const productos = await res.json();
    loading.style.display = "none";

    const alertas = productos.filter((p) => p.stock <= 5);

    if (!alertas.length) {
      cont.innerHTML = "<p>No hay alertas de stock bajo.</p>";
      return;
    }

    cont.innerHTML = `
      <table>
        <thead>
          <tr><th>Nombre</th><th>Proveedor</th><th>Stock</th></tr>
        </thead>
        <tbody>
          ${alertas
            .map(
              (p) => `
              <tr class="alert-row">
                <td>${p.nombre}</td>
                <td>${p.proveedor}</td>
                <td>${p.stock}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>`;
  } catch (error) {
    console.error(error);
    showMessage("Error al cargar alertas.", "error");
  }
}

// Buscar producto
async function buscarProducto() {
  const texto = document
    .getElementById("buscarTexto")
    .value.trim()
    .toLowerCase();
  const cont = document.getElementById("resultadosBusqueda");

  if (!texto) {
    cont.innerHTML = "<p>Escribe algo para buscar.</p>";
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
        <thead>
          <tr><th>Nombre</th><th>Tipo</th><th>Proveedor</th><th>Precio</th><th>Stock</th></tr>
        </thead>
        <tbody>
          ${resultados
            .map(
              (r) => `
              <tr>
                <td>${r.nombre}</td>
                <td>${r.tipo}</td>
                <td>${r.proveedor}</td>
                <td>$${r.precio.toFixed(2)}</td>
                <td>${r.stock}</td>
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
}

// Buscar en tiempo real
function buscarEnTiempoReal() {
  buscarProducto();
}

// Limpiar búsqueda
function limpiarBusqueda() {
  document.getElementById("buscarTexto").value = "";
  document.getElementById("resultadosBusqueda").innerHTML = "";
  showMessage("Búsqueda limpia.", "info");
}
