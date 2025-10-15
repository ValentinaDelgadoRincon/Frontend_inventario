const API_URL = "http://localhost:3000/api"; 

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
      document.getElementById(
        "msgProd"
      ).innerHTML = `<div class="message success">Producto registrado correctamente</div>`;
      document.getElementById("formProducto").reset();
    } else {
      document.getElementById(
        "msgProd"
      ).innerHTML = `<div class="message error">${data.message}</div>`;
    }
  } catch (error) {
    document.getElementById(
      "msgProd"
    ).innerHTML = `<div class="message error">Error al registrar producto</div>`;
  }
}

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
      document.getElementById(
        "msgMov"
      ).innerHTML = `<div class="message success">Movimiento registrado</div>`;
      document.getElementById("formMovimiento").reset();
      mostrarStock(); 
    } else {
      document.getElementById(
        "msgMov"
      ).innerHTML = `<div class="message error">${data.message}</div>`;
    }
  } catch (error) {
    document.getElementById(
      "msgMov"
    ).innerHTML = `<div class="message error">Error al registrar movimiento</div>`;
  }
}

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
    document.getElementById(
      "resultadosBusqueda"
    ).innerHTML = `<div class="message error">Error en la búsqueda</div>`;
  }
}

