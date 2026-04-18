import { getProductos, createProducto, updateProducto, deleteProducto } from './services/productosService.js';
import { getMovimientos, registrarMovimiento } from './services/movimientosService.js';

let productos = [];
let movimientos = [];

// DOM Elements - Productos
const tablaProductos = document.getElementById('tabla-productos');
const modal = document.getElementById('modal-producto');
const btnNuevo = document.getElementById('btn-nuevo-producto');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');
const btnCancelar = document.getElementById('btn-cancelar');
const formProducto = document.getElementById('formulario-producto');
const modalTitulo = document.getElementById('modal-titulo');
const notificacion = document.getElementById('notificacion');

// DOM Elements - Tabs y Vistas
const tabProductos = document.getElementById('tab-productos');
const tabMovimientos = document.getElementById('tab-movimientos');
const vistaProductos = document.getElementById('vista-productos');
const vistaMovimientos = document.getElementById('vista-movimientos');

// DOM Elements - Movimientos
const selectProducto = document.getElementById('mov-producto');
const infoStock = document.getElementById('mov-stock-info');
const inputCantidad = document.getElementById('mov-cantidad');
const btnEntrada = document.getElementById('btn-entrada');
const btnSalida = document.getElementById('btn-salida');
const tablaMovimientos = document.getElementById('tabla-movimientos');
const formularioMovimientos = document.getElementById('formulario-movimientos');

export async function initUI() {
  bindEvents();
  await cargarProductos();
  await cargarMovimientos();
}

function bindEvents() {
  // Tabs Nav
  tabProductos.addEventListener('click', () => {
    tabProductos.classList.add('active');
    tabMovimientos.classList.remove('active');
    vistaProductos.classList.remove('oculta');
    vistaMovimientos.classList.add('oculta');
  });

  tabMovimientos.addEventListener('click', () => {
    tabMovimientos.classList.add('active');
    tabProductos.classList.remove('active');
    vistaMovimientos.classList.remove('oculta');
    vistaProductos.classList.add('oculta');
  });

  // Productos Events
  btnNuevo.addEventListener('click', () => abrirModal());
  btnCerrarModal.addEventListener('click', cerrarModal);
  btnCancelar.addEventListener('click', cerrarModal);

  formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();
    await guardarProducto();
  });

  tablaProductos.addEventListener('click', async (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    const id = target.dataset.id;
    if (target.classList.contains('btn-editar')) {
      const producto = productos.find(p => p.id === id);
      if (producto) abrirModal(producto);
    } else if (target.classList.contains('btn-eliminar')) {
      if (confirm('¿Estás seguro de eliminar este producto?')) {
        await borrarProducto(id);
      }
    }
  });

  // Movimientos Events
  selectProducto.addEventListener('change', () => {
    const id = selectProducto.value;
    const prod = productos.find(p => p.id === id);
    if (prod) {
      infoStock.innerHTML = `Stock disponible en almacén: <strong>${prod.stock}</strong> un.`;
      infoStock.style.color = prod.stock <= 0 ? 'var(--danger-color)' : 'var(--text-secondary)';
    } else {
      infoStock.textContent = '';
    }
  });

  btnEntrada.addEventListener('click', () => procesarMovimiento('entrada'));
  btnSalida.addEventListener('click', () => procesarMovimiento('salida'));
}

async function cargarProductos() {
  mostrarCargando(true);
  try {
    productos = await getProductos();
    renderizarTabla();
    actualizarSelectProductos();
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

function actualizarSelectProductos() {
  selectProducto.innerHTML = '<option value="">Seleccione un producto...</option>';
  productos.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.nombre} (Stock actual: ${p.stock})`;
    selectProducto.appendChild(opt);
  });
}

// ============== LOGICA DE PRODUCTOS ============== //

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
    await cargarProductos(); // Refresh view
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

// ============== LOGICA DE MOVIMIENTOS ============== //

async function cargarMovimientos() {
  try {
    movimientos = await getMovimientos();
    renderizarTablaMovimientos();
  } catch (error) {
    tablaMovimientos.innerHTML = `<tr><td colspan="4" class="estado-tabla">Error al cargar movimientos.</td></tr>`;
  }
}

function renderizarTablaMovimientos() {
  tablaMovimientos.innerHTML = '';
  
  if (movimientos.length === 0) {
    tablaMovimientos.innerHTML = `<tr><td colspan="4" class="estado-tabla">No hay movimientos registrados.</td></tr>`;
    return;
  }

  movimientos.forEach(mov => {
    const tr = document.createElement('tr');
    
    // Badges
    const badgeClass = mov.tipo === 'entrada' ? 'mov-entrada' : 'mov-salida';
    const icn = mov.tipo === 'entrada' ? '🔼 Entrada' : '🔽 Salida';
    
    // Formatting
    const date = new Date(mov.fecha).toLocaleString('es-ES', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
    const prodName = mov.productos ? mov.productos.nombre : 'Producto desconocido/eliminado';
    
    tr.innerHTML = `
      <td>${date}</td>
      <td class="prod-nombre">${prodName}</td>
      <td><span class="badge-mov ${badgeClass}">${icn}</span></td>
      <td class="font-mono"><strong>${mov.cantidad}</strong> un.</td>
    `;
    tablaMovimientos.appendChild(tr);
  });
}

async function procesarMovimiento(tipo) {
  const prodId = selectProducto.value;
  const cantStr = inputCantidad.value;

  if (!prodId) {
    mostrarNotificacion('Debe seleccionar un producto.', 'error');
    return;
  }
  
  if (cantStr.trim() === '') {
    mostrarNotificacion('El campo cantidad no puede estar vacío.', 'error');
    return;
  }
  
  const cant = parseInt(cantStr, 10);
  if (isNaN(cant) || cant <= 0) {
    mostrarNotificacion('La cantidad debe ser mayor a 0', 'error');
    return;
  }

  const prod = productos.find(p => p.id === prodId);
  if (!prod) return;

  if (tipo === 'salida' && cant > prod.stock) {
    mostrarNotificacion(`Error: Stock insuficiente. Stock actual es ${prod.stock}.`, 'error');
    return;
  }

  const newStock = tipo === 'entrada' ? prod.stock + cant : prod.stock - cant;

  // Deshabilitar botones mientras se procesa
  btnEntrada.disabled = true;
  btnSalida.disabled = true;

  try {
    // 1. Insertar en tabla movimientos (historial)
    await registrarMovimiento(prodId, tipo, cant);
    
    // 2. Actualizar el stock del producto en la tabla principal
    await updateProducto(prodId, { stock: newStock });
    
    mostrarNotificacion(`Se procesó la ${tipo} exitosamente.`, 'success');
    formularioMovimientos.reset();
    infoStock.textContent = ''; // Limpiar el indicador visual de stock
    
    // Recargar todo el estado desde Supabase
    await cargarProductos();
    await cargarMovimientos();
  } catch (err) {
    mostrarNotificacion(`Ocurrió un error al procesar la ${tipo}`, 'error');
  } finally {
    btnEntrada.disabled = false;
    btnSalida.disabled = false;
  }
}

// ============== UTILIDADES ============== //

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
