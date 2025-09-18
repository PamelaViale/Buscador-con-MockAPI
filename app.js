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
const notificaciones = document.getElementById("notificaciones")

let productosCargados = []
let editId = null 


//  obtengo productos (con loader)

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


//  renderizo cards

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

//filtros
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


//   modal

function abrirModal(id = null) {
  modalForm.classList.add("is-active")
  formProducto.reset()

  if (id) {
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

// guardo productos
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
      res = await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProducto)
      })
    } else {
      res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProducto)
      })
    }

    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)

    cerrarModal()
    obtenerProductos()
    mostrarNotificacion(editId ? "✅ Producto actualizado correctamente" : "✅ Producto creado correctamente", "is-success")

  } catch (error) {
    mostrarNotificacion(`❌ Error: ${error.message}`, "is-danger")
    console.error(error)
  }
})


//   elimino productos

window.eliminarProducto = async function (id) {
  const confirmar = confirm("⚠️ ¿Seguro que querés eliminar este producto? Esta acción no se puede deshacer.")
  if (!confirmar) return

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    })
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)

    mostrarNotificacion("✅ Producto eliminado correctamente", "is-success")
    obtenerProductos()
  } catch (error) {
    mostrarNotificacion(`❌ Error al eliminar: ${error.message}`, "is-danger")
    console.error(error)
  }
}


//   notificaciones

function mostrarNotificacion(mensaje, tipo = "is-info") {
  notificaciones.innerHTML = `
    <div class="notification ${tipo}">
      <button class="delete" onclick="this.parentElement.remove()"></button>
      ${mensaje}
    </div>
  `

  setTimeout(() => {
    notificaciones.innerHTML = ""
  }, 3000)
}

// eventos
inputBusqueda.addEventListener("input", aplicarFiltros)
filtroCategoria.addEventListener("change", aplicarFiltros)
filtroPrecio.addEventListener("change", aplicarFiltros)
btnLimpiar.addEventListener("click", () => {
  inputBusqueda.value = ""
  filtroCategoria.value = ""
  filtroPrecio.value = ""
  renderizarProductos(productosCargados)
})

btnAbrirForm.addEventListener("click", () => abrirModal())
btnCerrarModal.addEventListener("click", cerrarModal)
btnCancelar.addEventListener("click", cerrarModal)


obtenerProductos()
