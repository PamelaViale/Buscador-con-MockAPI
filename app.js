//  MockAPI 
const API_URL = "https://68ba1b9d6aaf059a5b597970.mockapi.io/api/productos"


const productosContainer = document.getElementById("productos-container")

// obtener productos
async function obtenerProductos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)
    const data = await res.json();
    renderizarProductos(data);
  } catch (error) {
    console.error("Error al obtener productos:", error)
    productosContainer.innerHTML = `
      <div class="notification is-danger">
        ❌ Error al cargar productos: ${error.message}
      </div>
    `
  }
}

// renderizo cards 
function renderizarProductos(productos) {
  productosContainer.innerHTML = ""

  if (productos.length === 0) {
    productosContainer.innerHTML = `
      <div class="notification is-warning">
        ⚠️ No hay productos para mostrar.
      </div>
    `
    return
  }

  productos.forEach(producto => {
    const { id, name, price, imagen, categoria } = producto;

    const card = document.createElement("div")
    card.className = "column is-one-quarter"

    card.innerHTML = `
      <div class="card">
        <div class="card-image">
          <figure class="image is-4by3">
            <img src="${imagen || "https://via.placeholder.com/300"}" 
                 alt="${name}" 
                 onerror="this.src='https://via.placeholder.com/300'">
          </figure>
        </div>
        <div class="card-content">
          <p class="title is-5">${name}</p>
          <p><strong>Precio:</strong> $${price}</p>
          <p><strong>Categoría:</strong> ${categoria || "Sin categoría"}</p>
        </div>
        <footer class="card-footer">
          <a href="#" class="card-footer-item has-text-warning">✏️ Editar</a>
          <a href="#" class="card-footer-item has-text-danger">🗑️ Eliminar</a>
        </footer>
      </div>
    `

    productosContainer.appendChild(card);
  });
}


obtenerProductos()
