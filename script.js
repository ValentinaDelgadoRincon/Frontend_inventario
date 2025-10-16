const API_URL = "http://localhost:4000";

// Inicialización de la aplicación
function initializeApp() {
  showTab("productos"); // Inicia directamente en el formulario de registro
  console.log("Aplicación inicializada correctamente");
}

// Mostrar mensajes al usuario
function showMessage(message, type = "info") {
  const msgBox = document.getElementById("mensaje");
  msgBox.textContent = message;
  msgBox.className = `mensaje ${type}`;
  msgBox.style.display = "block";

  setTimeout(() => {
    msgBox.style.display = "none";
  }, 3000);
}

// Cambiar de pestaña
function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.style.display = "none";
  });
  document.getElementById(tabId).style.display = "block";
}

// Registrar producto
async function registrarProducto(event) {
  event.preventDefault();

  const producto = {
    nombre: document.getElementById("nombre").value.trim(),
    tipo: document.getElementById("tipo").value.trim(),
    proveedor: document.getElementById("proveedor").value.trim(),
    precio: parseFloat(document.getElementById("precio").value) || 0,
    stock: parseInt(document.getElementById("stock").value) || 0,
  };

  // Validaciones básicas
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

    showMessage("Producto registrado con éxito.", "success");

    // Limpia el formulario
    document.getElementById("formProducto").reset();

    // Actualiza el inventario automáticamente
    mostrarStock();
  } catch (error) {
    console.error(error);
    showMessage("Error al registrar el producto.", "error");
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
    showMessage("Error al mostrar el inventario.", "error");
  }
}

// Mostrar alertas de stock bajo (opcional)
async function mostrarAlertas() {
  const cont = document.getElementById("alertasTable");
  const loading = document.getElementById("loadingAlertas");
  loading.style.display = "block";

  try {
    const res = await fetch(`${API_URL}/videojuegos`);
    const productos = await res.json();
    loading.style.display = "none";

    // Mostrar productos con poco stock (ejemplo: stock <= 5)
    const alertas = productos.filter((p) => p.stock <= 5);

    if (!alertas.length) {
      cont.innerHTML = "<p>No hay alertas de stock bajo.</p>";
      return;
    }

    cont.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Nombre</th><th>Proveedor</th><th>Stock</th>
          </tr>
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
