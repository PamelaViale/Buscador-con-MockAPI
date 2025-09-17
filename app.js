//  MockAPI 
const API_URL = "https://68ba1b9d6aaf059a5b597970.mockapi.io/api/productos"


const productosContainer = document.getElementById("productos-container")
const inputBusqueda = document.getElementById("filtro-nombre")
const filtroCategoria = document.getElementById("filtro-categoria")
const filtroPrecio = document.getElementById("filtro-precio")
const btnLimpiar = document.getElementById("btn-limpiar")

let productosCargados = []

// obtengo productos
async function obtenerProductos() {
  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)
    const datos = await res.json();
    productosCargados = datos; 
    renderizarProductos(datos);
  } catch (error) {
    productosContainer.innerHTML = `
      <div class="notification is-danger">
        ❌ Error al cargar productos: ${error.message}
      </div>
    `;
  }
}

// Filtro por nombre
inputBusqueda.addEventListener("input", (e) => {
  const texto = e.target.value.toLowerCase().trim()
  const filtrados = productosCargados.filter(p =>
    p.name.toLowerCase().includes(texto)
  )
  renderizarProductos(filtrados)
})

// aplico filtros
function aplicarFiltros() {
  let resultado = [...productosCargados]

  const texto = inputBusqueda.value.toLowerCase().trim()
  if (texto) {
    resultado = resultado.filter(p =>
      p.name.toLowerCase().includes(texto)
    )
  }

  const categoria = filtroCategoria.value
  if (categoria) {
    resultado = resultado.filter(p => p.categoria === categoria)
  }

  const precio = filtroPrecio.value
  if (precio) {
    resultado = resultado.filter(p => {
      const precioNum = parseFloat(p.price)
      if (precio === "low") return precioNum < 100
      if (precio === "mid") return precioNum >= 100 && precioNum <= 500
      if (precio === "high") return precioNum > 500
    })
  }

  renderizarProductos(resultado)
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
    const { id, name, price, imagen, categoria } = producto

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

    productosContainer.appendChild(card)
  })
}


obtenerProductos()


// eventos filtros
inputBusqueda.addEventListener("input", aplicarFiltros)
filtroCategoria.addEventListener("change", aplicarFiltros)
filtroPrecio.addEventListener("change", aplicarFiltros)
btnLimpiar.addEventListener("click", () => {
  inputBusqueda.value = ""
  filtroCategoria.value = ""
  filtroPrecio.value = ""
  renderizarProductos(productosCargados)
})


obtenerProductos()

