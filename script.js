const API_URL = "http://localhost:4000";

//Iniciacion de la aplicacion
function initializeApp() {
  showTab("productos");
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
}

//Gestion de productos
async function registrarProducto(event) {
  event.preventDefault();

  const producto = {
    nombre: document.getElementById("nombreProd").value.trim(),
    proveedor: document.getElementById("provProd").value.trim(),
    tipo: document.getElementById("tipoProd").value.trim(),
    precio: parseFloat(document.getElementById("precioProd").value) || 0,
    stock: Number(document.getElementById("stockProd").value) || 0,
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

//Inventario, mostrar, alertas, exportar
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
            <th>Stock</th>
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
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Precio</th>
            <th>Stock</th>
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
              <td>${p.stock}</td>
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
    const res = await fetch(`${API_URL}/videojuegos`);
    const productos = await res.json();
    if (!productos.length) {
      showMessage("No hay productos para exportar.", "warning");
      return;
    }

    const csv = [
      ["Nombre", "Tipo", "Precio", "Stock"].join(","),
      ...productos.map((p) => [p.nombre, p.tipo, p.precio, p.stock].join(",")),
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
          .map((r) => `<td>${r.nombre}</td><td>${r.stock}</td></tr>`)
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

function inicializarSistema() {
  showMessage("Sistema inicializado correctamente.", "success");
}

function limpiarTodosFormularios() {
  document.querySelectorAll("form").forEach((form) => form.reset());
  showMessage("Todos los formularios fueron limpiados.", "info");
}



// Simular compra
async function simularCompra(event) {
  event.preventDefault();

  const nombre = document.getElementById("nombreCompra").value.trim();
  const cantidad = parseInt(document.getElementById("cantidadCompra").value);

  if (!nombre || cantidad <= 0) {
    showMessage("Completa todos los campos correctamente.", "warning");
    return;
  }

  try {
    // Obtener lista de productos
    const res = await fetch(`${API_URL}/videojuegos`);
    const productos = await res.json();

    // Buscar el producto por nombre
    const producto = productos.find(
      (p) => p.nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (!producto) {
      showMessage("El producto no existe en el inventario.", "error");
      return;
    }

    // Preparar objeto para enviar al backend
    const venta = {
      productos: [
        {
          videojuego_id: producto._id,
          nombre: producto.nombre,
          cantidad,
          precio_unitario: producto.precio,
        },
      ],
    };

    // Enviar venta al backend
    const ventaRes = await fetch(`${API_URL}/ventas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(venta),
    });

    const ventaData = await ventaRes.json();

    if (!ventaRes.ok) {
      throw new Error(ventaData.error || "Error al registrar la compra");
    }

    // Calcular costo total
    const costoTotal = producto.precio * cantidad;

    // Obtener fecha y hora actual
    const fecha = new Date();
    const fechaFormateada = fecha.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const horaFormateada = fecha.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Mostrar mensaje principal
    showMessage(
      `Compra registrada con éxito. Nuevo stock de "${producto.nombre}": actualizado en la base de datos.`,
      "success"
    );

    // Mostrar resumen visual
    document.getElementById("msgCompra").innerHTML = `
      <div class="message success">
        <h3>Compra registrada en el inventario</h3>
        <p><strong>Producto:</strong> ${producto.nombre}</p>
        <p><strong>Cantidad comprada:</strong> ${cantidad}</p>
        <p><strong>Precio unitario:</strong> $${producto.precio.toLocaleString()}</p>
        <p><strong>Costo total:</strong> $${costoTotal.toLocaleString()}</p>
        <hr>
        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
        <p><strong>Hora:</strong> ${horaFormateada}</p>
      </div>
    `;

    // Guardar compra en historial (opcional)
    const compraHistorial = {
      nombre: producto.nombre,
      cantidad,
      precioUnitario: producto.precio,
      costoTotal,
      fecha: fechaFormateada,
      hora: horaFormateada,
    };
    guardarCompraEnHistorial(compraHistorial);
  } catch (error) {
    console.error(error);
    showMessage("Error al registrar la compra: " + error.message, "error");
  }
}





// Cargar historial al iniciar
function cargarHistorialCompras() {
  const historial = JSON.parse(localStorage.getItem("historialCompras")) || [];
  const tbody = document.querySelector("#tablaHistorialCompras tbody");
  tbody.innerHTML = "";

  if (historial.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">No hay compras registradas.</td></tr>`;
    return;
  }

  historial.forEach((compra) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${compra.nombre}</td>
      <td>${compra.cantidad}</td>
      <td>$${compra.precioUnitario.toLocaleString()}</td>
      <td>$${compra.costoTotal.toLocaleString()}</td>
      <td>${compra.fecha}</td>
      <td>${compra.hora}</td>
    `;
    tbody.appendChild(fila);
  });
}

// Guardar compra en historial
function guardarCompraEnHistorial(compra) {
  const historial = JSON.parse(localStorage.getItem("historialCompras")) || [];
  historial.push(compra);
  localStorage.setItem("historialCompras", JSON.stringify(historial));
  cargarHistorialCompras();
}

// Limpiar historial completo
function limpiarHistorialCompras() {
  localStorage.removeItem("historialCompras");
  cargarHistorialCompras();
  showMessage("Historial de compras limpiado.", "info");
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
