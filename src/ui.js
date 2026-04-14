import { getProductos, createProducto, updateProducto, deleteProducto } from './services/productosService.js';

let productos = [];

// DOM Elements
const tablaProductos = document.getElementById('tabla-productos');
const modal = document.getElementById('modal-producto');
const btnNuevo = document.getElementById('btn-nuevo-producto');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');
const btnCancelar = document.getElementById('btn-cancelar');
const formProducto = document.getElementById('formulario-producto');
const modalTitulo = document.getElementById('modal-titulo');
const notificacion = document.getElementById('notificacion');

export async function initUI() {
  bindEvents();
  await cargarProductos();
}

function bindEvents() {
  btnNuevo.addEventListener('click', () => abrirModal());
  btnCerrarModal.addEventListener('click', cerrarModal);
  btnCancelar.addEventListener('click', cerrarModal);
  
  formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();
    await guardarProducto();
  });

  // Delegar eventos de tabla para botones dinámicos
  tablaProductos.addEventListener('click', async (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    const id = target.dataset.id;
    if (target.classList.contains('btn-editar')) {
      const producto = productos.find(p => p.id === id);
      if(producto) abrirModal(producto);
    } else if (target.classList.contains('btn-eliminar')) {
      if (confirm('¿Estás seguro de eliminar este producto?')) {
        await borrarProducto(id);
      }
    }
  });
}

async function cargarProductos() {
  mostrarCargando(true);
  try {
    productos = await getProductos();
    renderizarTabla();
  } catch (error) {
    mostrarNotificacion('Error al cargar inventario', 'error');
  } finally {
    mostrarCargando(false);
  }
}

function renderizarTabla() {
  tablaProductos.innerHTML = '';
  
  if (productos.length === 0) {
    tablaProductos.innerHTML = `<tr><td colspan="5" class="estado-tabla">No hay productos registrados.</td></tr>`;
    return;
  }

  const formatoMoneda = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  productos.forEach(prod => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="prod-nombre">${prod.nombre}</div>
        ${prod.descripcion ? `<div class="prod-desc">${prod.descripcion}</div>` : ''}
      </td>
      <td>
        <span class="badge" style="background: rgba(255,255,255,0.1); font-size: 0.75rem; border-radius: 4px; padding: 2px 6px;">
          ${prod.categoria || 'Sin categoría'}
        </span>
      </td>
      <td class="font-mono">${formatoMoneda.format(prod.precio)}</td>
      <td>
        <span class="badge-stock ${prod.stock <= prod.stock_minimo ? 'stock-bajo' : 'stock-ok'}">
          ${prod.stock} un.
        </span>
      </td>
      <td class="acciones">
        <button class="btn-icon btn-editar" data-id="${prod.id}" title="Editar">✏️</button>
        <button class="btn-icon btn-eliminar" data-id="${prod.id}" title="Eliminar">🗑️</button>
      </td>
    `;
    tablaProductos.appendChild(tr);
  });
}

async function guardarProducto() {
  const id = document.getElementById('producto-id').value;
  const btnGuardar = document.getElementById('btn-guardar');
  
  const productoData = {
    nombre: document.getElementById('nombre').value,
    categoria: document.getElementById('categoria').value || null,
    descripcion: document.getElementById('descripcion').value || null,
    precio: parseFloat(document.getElementById('precio').value),
    stock: parseInt(document.getElementById('stock').value, 10),
  };

  try {
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    if (id) {
      await updateProducto(id, productoData);
      mostrarNotificacion('Producto actualizado correctamente', 'success');
    } else {
      await createProducto(productoData);
      mostrarNotificacion('Producto creado correctamente', 'success');
    }
    cerrarModal();
    await cargarProductos(); // Refresh
  } catch (error) {
    mostrarNotificacion('Ocurrió un error al guardar', 'error');
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar Producto';
  }
}

async function borrarProducto(id) {
  try {
    await deleteProducto(id);
    mostrarNotificacion('Producto eliminado', 'success');
    await cargarProductos();
  } catch (error) {
    mostrarNotificacion('Error al eliminar producto', 'error');
  }
}

function abrirModal(producto = null) {
  modal.classList.remove('oculta');
  
  if (producto) {
    modalTitulo.textContent = 'Editar Producto';
    document.getElementById('producto-id').value = producto.id;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('categoria').value = producto.categoria || '';
    document.getElementById('precio').value = producto.precio;
    document.getElementById('stock').value = producto.stock;
    document.getElementById('descripcion').value = producto.descripcion || '';
  } else {
    modalTitulo.textContent = 'Crear Producto';
    formProducto.reset();
    document.getElementById('producto-id').value = '';
  }
}

function cerrarModal() {
  modal.classList.add('oculta');
  formProducto.reset();
}

function mostrarNotificacion(mensaje, tipo = 'success') {
  notificacion.textContent = mensaje;
  notificacion.className = `notificacion show ${tipo}`;
  
  setTimeout(() => {
    notificacion.classList.remove('show');
  }, 3000);
}

function mostrarCargando(show) {
  if (show && productos.length === 0) {
    tablaProductos.innerHTML = `<tr><td colspan="5" class="estado-tabla"><div class="spinner"></div> Cargando...</td></tr>`;
  }
}
