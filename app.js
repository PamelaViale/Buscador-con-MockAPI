//  MockAPI 
const API_URL = "https://68ba1b9d6aaf059a5b597970.mockapi.io/api/productos"


const productosContainer = document.getElementById("productos-container")
const inputBusqueda = document.getElementById("filtro-nombre")
const filtroCategoria = document.getElementById("filtro-categoria")
const filtroPrecio = document.getElementById("filtro-precio")
const btnLimpiar = document.getElementById("btn-limpiar")
const modalForm = document.getElementById("modal-form")
const btnAbrirForm = document.getElementById("btn-abrir-form")
const btnCerrarModal = document.getElementById("btn-cerrar-modal")
const btnCancelar = document.getElementById("btn-cancelar")
const btnGuardar = document.getElementById("btn-guardar")
const formProducto = document.getElementById("form-producto")
const modalTitle = document.getElementById("modal-title")
const loader = document.getElementById("loader")

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
      <a href="#" class="card-footer-item has-text-warning" onclick="abrirModal('${id}')">✏️ Editar</a>
      <a href="#" class="card-footer-item has-text-danger" onclick="eliminarProducto('${id}')">🗑️ Eliminar</a>
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

let editId = null 

function abrirModal(id = null) {
  modalForm.classList.add("is-active")
  formProducto.reset()

  if (id) {
    // edito producto
    const producto = productosCargados.find(p => p.id == id)
    if (!producto) return

    document.getElementById("nombre").value = producto.name
    document.getElementById("precio").value = producto.price
    document.getElementById("categoria").value = producto.categoria
    document.getElementById("imagen").value = producto.imagen

    modalTitle.textContent = "Editar Producto"
    editId = id
  } else {
    
    modalTitle.textContent = "Agregar Producto"
    editId = null
  }
}

function cerrarModal() {
  modalForm.classList.remove("is-active")
  formProducto.reset()
  editId = null
}

btnAbrirForm.addEventListener("click", () => abrirModal("crear"))
btnCerrarModal.addEventListener("click", cerrarModal)
btnCancelar.addEventListener("click", cerrarModal)

// guardo producto

btnGuardar.addEventListener("click", async (e) => {
  e.preventDefault()

  const nuevoProducto = {
    name: document.getElementById("nombre").value,
    price: document.getElementById("precio").value,
    categoria: document.getElementById("categoria").value,
    imagen: document.getElementById("imagen").value || "https://via.placeholder.com/300"
  }

  try {
    let res
    if (editId) {
      // edito
      res = await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProducto)
      })
    } else {
      // creo
      res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProducto)
      })
    }

    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)

    cerrarModal()
    obtenerProductos()
  } catch (error) {
    alert(`❌ Error: ${error.message}`)
    console.error(error)
  }
})

//elimino producto
window.eliminarProducto = async function (id) {
  const confirmar = confirm("⚠️ ¿Seguro que querés eliminar este producto? Esta acción no se puede deshacer.")
  if (!confirmar) return

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    })
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)

    alert("✅ Producto eliminado correctamente")
    obtenerProductos()
  } catch (error) {
    alert(`❌ Error al eliminar: ${error.message}`)
    console.error(error)
  }
}

// obtengo productos - loader
async function obtenerProductos() {
  try {
    loader.style.display = "block"   
    productosContainer.innerHTML = "" 

    const res = await fetch(API_URL)
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)

    const datos = await res.json()
    productosCargados = datos
    renderizarProductos(datos)
  } catch (error) {
    productosContainer.innerHTML = `
      <div class="notification is-danger">
        ❌ Error al cargar productos: ${error.message}
      </div>
    `
  } finally {
    loader.style.display = "none"   
  }
}

