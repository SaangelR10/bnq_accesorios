// Menú hamburguesa
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// Dark mode
const darkToggle = document.getElementById('dark-toggle');
const html = document.documentElement;
if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    html.classList.toggle('dark');
    // Guardar preferencia en localStorage
    if (html.classList.contains('dark')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });
}
// Mantener preferencia de dark mode
if (localStorage.getItem('theme') === 'dark') {
  html.classList.add('dark');
} else if (localStorage.getItem('theme') === 'light') {
  html.classList.remove('dark');
}

// Alternar entre login y registro en cuenta.html
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const messageDiv = document.getElementById('message');

if (showRegister && showLogin && loginForm && registerForm) {
  showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    messageDiv.textContent = '';
  });
  showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    messageDiv.textContent = '';
  });
  // --- Conexión real con backend para login y registro ---
  const API_URL = '/api/auth';

  // Login real
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = 'Iniciando sesión...';
    messageDiv.className = 'mb-4 text-center text-sm text-brandy-700 dark:text-brandy-200';
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: document.getElementById('login-email').value,
          password: document.getElementById('login-password').value
        })
      });
      if (!res.ok) throw new Error('Credenciales incorrectas');
      const data = await res.json();
      localStorage.setItem('jwt', data.token);
      messageDiv.textContent = '¡Inicio de sesión exitoso!';
      messageDiv.className = 'mb-4 text-center text-sm text-green-600 dark:text-green-400';
      // Redirigir o recargar después de un tiempo
      setTimeout(() => location.href = 'index.html', 1200);
    } catch (err) {
      messageDiv.textContent = err.message || 'Error al iniciar sesión';
      messageDiv.className = 'mb-4 text-center text-sm text-red-600 dark:text-red-400';
    }
  });
  // Registro real
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = 'Registrando cuenta...';
    messageDiv.className = 'mb-4 text-center text-sm text-brandy-700 dark:text-brandy-200';
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: document.getElementById('register-email').value,
          password: document.getElementById('register-password').value,
          nombre: document.getElementById('register-name').value,
          direccion: '',
          telefono: ''
        })
      });
      if (!res.ok) throw new Error('Error al registrar cuenta');
      const data = await res.json();
      localStorage.setItem('jwt', data.token);
      messageDiv.textContent = '¡Registro exitoso!';
      messageDiv.className = 'mb-4 text-center text-sm text-green-600 dark:text-green-400';
      setTimeout(() => location.href = 'index.html', 1200);
    } catch (err) {
      messageDiv.textContent = err.message || 'Error al registrar cuenta';
      messageDiv.className = 'mb-4 text-center text-sm text-red-600 dark:text-red-400';
    }
  });
}

// --- Mostrar enlace admin solo si es admin y proteger admin.html ---
document.addEventListener('DOMContentLoaded', function () {
  const jwt = localStorage.getItem('jwt');
  const userInfo = document.getElementById('user-info');
  const userInfoMobile = document.getElementById('user-info-mobile');
  const logoutBtn = document.getElementById('logout-btn');
  const logoutBtnMobile = document.getElementById('logout-btn-mobile');
  const cuentaLinks = document.querySelectorAll('.cuenta-link');
  const adminLinks = document.querySelectorAll('.admin-link');

  function resetUI() {
    if (userInfo) userInfo.classList.add('hidden');
    if (userInfoMobile) userInfoMobile.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (logoutBtnMobile) logoutBtnMobile.classList.add('hidden');
    adminLinks.forEach(el => el.classList.add('hidden'));
    cuentaLinks.forEach(el => el.classList.remove('hidden'));
  }

  resetUI();

  if (!jwt) {
    console.log('No JWT encontrado, mostrando menú de visitante');
    return;
  }

  fetch('/api/auth/me', {
    headers: { 'Authorization': 'Bearer ' + jwt }
  })
    .then(res => {
      if (!res.ok) {
        console.warn('No autorizado o error en /api/auth/me', res.status);
        resetUI();
        return null;
      }
      return res.json();
    })
    .then(user => {
      if (!user || !user.roles) {
        resetUI();
        return;
      }
      // Mostrar nombre
      if (userInfo) {
        userInfo.textContent = user.nombre || user.email;
        userInfo.classList.remove('hidden');
      }
      if (userInfoMobile) {
        userInfoMobile.textContent = user.nombre || user.email;
        userInfoMobile.classList.remove('hidden');
      }
      // Mostrar logout
      if (logoutBtn) {
        logoutBtn.classList.remove('hidden');
        logoutBtn.onclick = () => {
          localStorage.removeItem('jwt');
          window.location.reload();
        };
      }
      if (logoutBtnMobile) {
        logoutBtnMobile.classList.remove('hidden');
        logoutBtnMobile.onclick = () => {
          localStorage.removeItem('jwt');
          window.location.reload();
        };
      }
      // Mostrar admin solo si es admin
      adminLinks.forEach(el => {
        if (user.roles.includes('ADMIN')) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });
      // Ocultar 'Mi cuenta'
      cuentaLinks.forEach(el => el.classList.add('hidden'));
      // Redirección lógica
      if (window.location.pathname.endsWith('admin.html') && !user.roles.includes('ADMIN')) {
        window.location.href = 'index.html';
      }
      if (window.location.pathname.endsWith('cuenta.html')) {
        window.location.href = 'index.html';
      }
      console.log('Usuario autenticado:', user);
    })
    .catch(err => {
      console.error('Error en /api/auth/me:', err);
      resetUI();
    });
});

// ========== MODAL DETALLE Y CARRITO (CATÁLOGO) ==========
if (window.location.pathname.endsWith('catalogo.html')) {
  let productosGlobal = [];
  let productosFiltrados = [];
  let categoriasGlobal = [];
  let categoriaSeleccionada = 'todas';
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const productosMsg = document.getElementById('productos-msg');
  const productosContainer = document.getElementById('productos-container');
  const filtroCategorias = document.getElementById('filtro-categorias');
  const modal = document.getElementById('modal-detalle');
  const modalContent = document.getElementById('modal-detalle-content');
  const cerrarModal = document.getElementById('cerrar-modal');
  const carritoBtn = document.getElementById('carrito-btn');
  const carritoSlide = document.getElementById('carrito-slide');
  const cerrarCarrito = document.getElementById('cerrar-carrito');
  const carritoItems = document.getElementById('carrito-items');
  const carritoTotal = document.getElementById('carrito-total');
  const finalizarCompra = document.getElementById('finalizar-compra');

  // Mostrar modal detalle
  function abrirModalDetalle(producto) {
    modalContent.innerHTML = `
      <div class="flex flex-col md:flex-row gap-8 items-center">
        <img src="${(producto.imagenes && producto.imagenes.length > 0) ? `/imagenes_productos/${producto.imagenes[0].url}` : 'img/no-image.png'}" alt="${producto.nombre}" class="h-60 w-60 object-cover rounded-xl shadow mb-4 md:mb-0">
        <div class="flex-1 flex flex-col gap-2">
          <h2 class="text-3xl font-bold text-brandy-700 dark:text-brandy-100 mb-2">${producto.nombre}</h2>
          <p class="text-brandy-600 dark:text-brandy-200 mb-2">${producto.descripcion}</p>
          <div class="flex gap-4 mb-2">
            <span class="text-brandy-500 font-bold text-2xl">$${producto.precio}</span>
            <span class="text-sm text-brandy-400 dark:text-brandy-300">Stock: ${producto.stock}</span>
          </div>
          <div class="mb-2 text-brandy-500 dark:text-brandy-200 text-sm">Materiales: ${producto.materiales || ''}</div>
          <div class="flex items-center gap-2 mb-4">
            <label for="cantidad-detalle" class="text-brandy-700 dark:text-brandy-100 font-semibold">Cantidad</label>
            <input id="cantidad-detalle" type="number" min="1" max="${producto.stock}" value="1" class="w-20 p-2 rounded border border-brandy-200 dark:border-brandy-700 bg-brandy-50 dark:bg-brandy-900 focus:outline-none focus:ring-2 focus:ring-brandy-500">
          </div>
          <button id="agregar-carrito-detalle" class="w-full bg-brandy-500 text-white py-3 rounded-lg font-semibold text-lg shadow hover:bg-brandy-600 transition">Agregar al carrito</button>
        </div>
      </div>
    `;
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('backdrop-blur-sm'), 10);
    document.body.classList.add('overflow-hidden');
    document.getElementById('cantidad-detalle').addEventListener('input', function() {
      if (this.value < 1) this.value = 1;
      if (this.value > producto.stock) this.value = producto.stock;
    });
    document.getElementById('agregar-carrito-detalle').onclick = () => {
      agregarAlCarrito(producto, parseInt(document.getElementById('cantidad-detalle').value));
      cerrarModalDetalle();
      abrirCarrito();
    };
  }
  function cerrarModalDetalle() {
    modal.classList.add('hidden');
    modal.classList.remove('backdrop-blur-sm');
    document.body.classList.remove('overflow-hidden');
  }
  if (cerrarModal) cerrarModal.onclick = cerrarModalDetalle;
  if (modal) modal.onclick = (e) => { if (e.target === modal) cerrarModalDetalle(); };

  // Carrito slide-over
  function abrirCarrito() {
    if (!carritoSlide) return;
    carritoSlide.classList.remove('translate-x-full');
    document.body.classList.add('overflow-hidden');
    renderizarCarrito();
  }
  function cerrarCarritoSlide() {
    if (!carritoSlide) return;
    carritoSlide.classList.add('translate-x-full');
    document.body.classList.remove('overflow-hidden');
  }
  if (carritoBtn) carritoBtn.onclick = abrirCarrito;
  if (cerrarCarrito) cerrarCarrito.onclick = cerrarCarritoSlide;
  if (carritoSlide) {
    carritoSlide.onclick = (e) => {
      // Si el click es en el fondo (no en el contenido del slide)
      if (e.target === carritoSlide) cerrarCarritoSlide();
    };
  }

  // Lógica carrito
  function agregarAlCarrito(producto, cantidad) {
    let idx = carrito.findIndex(item => item.id === producto.id);
    if (idx >= 0) {
      carrito[idx].cantidad = Math.min(carrito[idx].cantidad + cantidad, producto.stock);
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: (producto.imagenes && producto.imagenes.length > 0) ? `/imagenes_productos/${producto.imagenes[0].url}` : 'img/no-image.png',
        cantidad: Math.min(cantidad, producto.stock),
        stock: producto.stock
      });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
    if (window.actualizarContadorCarrito) window.actualizarContadorCarrito();
  }
  function renderizarCarrito() {
    if (!carritoItems) return;
    if (!carrito.length) {
      carritoItems.innerHTML = '<div class="text-center text-brandy-400 dark:text-brandy-300">Tu carrito está vacío.</div>';
      if (carritoTotal) carritoTotal.textContent = '$0';
      if (window.actualizarContadorCarrito) window.actualizarContadorCarrito();
      return;
    }
    carritoItems.innerHTML = carrito.map(item => `
      <div class="flex items-center gap-4 mb-6">
        <img src="${item.imagen}" alt="${item.nombre}" class="h-20 w-20 object-cover rounded shadow border border-brandy-200 dark:border-brandy-700">
        <div class="flex-1 flex flex-col gap-1">
          <span class="font-semibold text-brandy-700 dark:text-brandy-100 text-lg">${item.nombre}</span>
          <span class="text-brandy-500 dark:text-brandy-200 text-sm">$${item.precio} x </span>
          <div class="flex items-center gap-2 mt-1">
            <input type="number" min="1" max="${item.stock}" value="${item.cantidad}" data-id="${item.id}" class="w-16 p-2 rounded border border-brandy-200 dark:border-brandy-700 bg-brandy-50 dark:bg-brandy-900 focus:outline-none focus:ring-2 focus:ring-brandy-500 cantidad-carrito">
            <button class="text-red-500 hover:text-red-700 transition eliminar-carrito" data-id="${item.id}" title="Eliminar"><span class="material-icons">delete</span></button>
          </div>
        </div>
        <div class="font-bold text-brandy-700 dark:text-brandy-100 text-lg">$${item.precio * item.cantidad}</div>
      </div>
    `).join('');
    carritoItems.querySelectorAll('.cantidad-carrito').forEach(input => {
      input.oninput = function() {
        let id = parseInt(this.dataset.id);
        let item = carrito.find(i => i.id === id);
        if (!item) return;
        let val = Math.max(1, Math.min(parseInt(this.value), item.stock));
        this.value = val;
        item.cantidad = val;
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        if (window.actualizarContadorCarrito) window.actualizarContadorCarrito();
      };
    });
    carritoItems.querySelectorAll('.eliminar-carrito').forEach(btn => {
      btn.onclick = function() {
        let id = parseInt(this.dataset.id);
        carrito = carrito.filter(i => i.id !== id);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        if (window.actualizarContadorCarrito) window.actualizarContadorCarrito();
      };
    });
    let total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    if (carritoTotal) carritoTotal.textContent = `$${total}`;
    if (window.actualizarContadorCarrito) window.actualizarContadorCarrito();
  }
  if (finalizarCompra) finalizarCompra.onclick = () => {
    if (!carrito.length) return;
    let mensaje = '¡Hola! Quiero hacer un pedido:%0A';
    carrito.forEach(item => {
      mensaje += `- ${item.nombre} x${item.cantidad} ($${item.precio * item.cantidad})%0A`;
    });
    mensaje += `%0ATotal: $${carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)}`;
    window.open(`https://wa.me/573001112233?text=${mensaje}`, '_blank');
  };

  // Click en cualquier parte del producto para ver detalles
  document.addEventListener('click', function(e) {
    // Si hace click en el botón o en el contenedor del producto
    if (e.target.matches('.ver-detalle') || e.target.closest('.producto-card')) {
      let card = e.target.closest('.producto-card');
      if (!card) return;
      const id = parseInt(card.dataset.id);
      const producto = productosGlobal.find(p => p.id === id);
      if (producto) abrirModalDetalle(producto);
    }
  });

  // Cargar categorías y renderizar filtro visual
  async function cargarCategoriasFiltro() {
    try {
      const res = await fetch('/api/categorias');
      if (!res.ok) throw new Error('Error al cargar categorías');
      categoriasGlobal = await res.json();
      renderizarFiltroCategorias();
    } catch (err) {
      filtroCategorias.innerHTML = '<span class="text-red-500">Error al cargar categorías</span>';
    }
  }
  function renderizarFiltroCategorias() {
    if (!filtroCategorias) return;
    filtroCategorias.innerHTML = '';
    // Botón "Todas"
    const btnTodas = document.createElement('button');
    btnTodas.textContent = 'Todas';
    btnTodas.className = 'chip-categoria px-4 py-2 rounded-full font-semibold transition shadow hover:bg-brandy-100 dark:hover:bg-brandy-800 ' + (categoriaSeleccionada === 'todas' ? 'bg-brandy-500 text-white scale-105' : 'bg-white dark:bg-brandy-900 text-brandy-700 dark:text-brandy-100');
    btnTodas.onclick = () => { categoriaSeleccionada = 'todas'; filtrarYRenderizarProductos(); renderizarFiltroCategorias(); };
    filtroCategorias.appendChild(btnTodas);
    // Botones de cada categoría
    categoriasGlobal.forEach(cat => {
      const btn = document.createElement('button');
      btn.textContent = cat.nombre;
      btn.className = 'chip-categoria px-4 py-2 rounded-full font-semibold transition shadow hover:bg-brandy-100 dark:hover:bg-brandy-800 ' + (categoriaSeleccionada === cat.nombre ? 'bg-brandy-500 text-white scale-105' : 'bg-white dark:bg-brandy-900 text-brandy-700 dark:text-brandy-100');
      btn.onclick = () => { categoriaSeleccionada = cat.nombre; filtrarYRenderizarProductos(); renderizarFiltroCategorias(); };
      filtroCategorias.appendChild(btn);
    });
  }
  function filtrarYRenderizarProductos() {
    if (categoriaSeleccionada === 'todas') {
      productosFiltrados = productosGlobal;
    } else {
      productosFiltrados = productosGlobal.filter(p => p.categoria && p.categoria.nombre === categoriaSeleccionada);
    }
    renderizarProductosCatalogo();
  }
  function renderizarProductosCatalogo() {
    productosMsg.textContent = '';
    if (!productosFiltrados || productosFiltrados.length === 0) {
      productosContainer.innerHTML = '';
      productosMsg.textContent = 'No hay productos disponibles en esta categoría.';
      return;
    }
    productosContainer.innerHTML = productosFiltrados.map(p => {
      const img = (p.imagenes && p.imagenes.length > 0) ? `/imagenes_productos/${p.imagenes[0].url}` : 'img/no-image.png';
      return `
        <div class="producto-card bg-white dark:bg-brandy-800 rounded-lg shadow p-6 flex flex-col items-center cursor-pointer transition hover:scale-105" data-id="${p.id}">
          <img src="${img}" alt="${p.nombre}" class="h-40 w-40 object-cover rounded mb-4">
          <h2 class="text-xl font-semibold text-brandy-700 dark:text-brandy-100 mb-2">${p.nombre}</h2>
          <p class="text-brandy-600 dark:text-brandy-200 mb-2">${p.descripcion}</p>
          <span class="text-brandy-500 font-bold text-lg mb-4">$${p.precio}</span>
          <button class="bg-brandy-500 text-white px-4 py-2 rounded hover:bg-brandy-600 transition ver-detalle" data-id="${p.id}">Ver detalles</button>
        </div>
      `;
    }).join('');
  }
  // Modificar fetch de productos para usar el filtro
  fetch('/api/productos')
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(productos => {
      productosGlobal = productos;
      cargarCategoriasFiltro();
      categoriaSeleccionada = 'todas';
      filtrarYRenderizarProductos();
    })
    .catch(err => {
      productosMsg.textContent = 'Error al cargar productos.';
      console.error('Error al cargar productos:', err);
    });
}

// ========== HACER CARRITO ACCESIBLE Y CONTADOR GLOBAL EN TODAS LAS PÁGINAS ==========
(function() {
  const carritoBtn = document.getElementById('carrito-btn');
  const carritoBtnMobile = document.getElementById('carrito-btn-mobile');
  const carritoSlide = document.getElementById('carrito-slide');
  const cerrarCarrito = document.getElementById('cerrar-carrito');
  const carritoItems = document.getElementById('carrito-items');
  const carritoTotal = document.getElementById('carrito-total');
  const finalizarCompra = document.getElementById('finalizar-compra');
  // Selecciona el span del contador en el icono del carrito (desktop y mobile)
  const carritoContador = carritoBtn ? carritoBtn.querySelector('span') : null;
  const carritoContadorMobile = carritoBtnMobile ? carritoBtnMobile.querySelector('span') : null;

  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  function actualizarContadorCarrito() {
    const totalCantidad = carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);
    if (carritoContador) carritoContador.textContent = totalCantidad;
    if (carritoContadorMobile) carritoContadorMobile.textContent = totalCantidad;
  }

  function renderizarCarrito() {
    if (!carritoItems) return;
    if (!carrito.length) {
      carritoItems.innerHTML = '<div class="text-center text-brandy-400 dark:text-brandy-300">Tu carrito está vacío.</div>';
      if (carritoTotal) carritoTotal.textContent = '$0';
      actualizarContadorCarrito();
      return;
    }
    carritoItems.innerHTML = carrito.map(item => `
      <div class="flex items-center gap-4 mb-6">
        <img src="${item.imagen}" alt="${item.nombre}" class="h-20 w-20 object-cover rounded shadow border border-brandy-200 dark:border-brandy-700">
        <div class="flex-1 flex flex-col gap-1">
          <span class="font-semibold text-brandy-700 dark:text-brandy-100 text-lg">${item.nombre}</span>
          <span class="text-brandy-500 dark:text-brandy-200 text-sm">$${item.precio} x </span>
          <div class="flex items-center gap-2 mt-1">
            <input type="number" min="1" max="${item.stock}" value="${item.cantidad}" data-id="${item.id}" class="w-16 p-2 rounded border border-brandy-200 dark:border-brandy-700 bg-brandy-50 dark:bg-brandy-900 focus:outline-none focus:ring-2 focus:ring-brandy-500 cantidad-carrito">
            <button class="text-red-500 hover:text-red-700 transition eliminar-carrito" data-id="${item.id}" title="Eliminar"><span class="material-icons">delete</span></button>
          </div>
        </div>
        <div class="font-bold text-brandy-700 dark:text-brandy-100 text-lg">$${item.precio * item.cantidad}</div>
      </div>
    `).join('');
    carritoItems.querySelectorAll('.cantidad-carrito').forEach(input => {
      input.oninput = function() {
        let id = parseInt(this.dataset.id);
        let item = carrito.find(i => i.id === id);
        if (!item) return;
        let val = Math.max(1, Math.min(parseInt(this.value), item.stock));
        this.value = val;
        item.cantidad = val;
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        actualizarContadorCarrito();
      };
    });
    carritoItems.querySelectorAll('.eliminar-carrito').forEach(btn => {
      btn.onclick = function() {
        let id = parseInt(this.dataset.id);
        carrito = carrito.filter(i => i.id !== id);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        actualizarContadorCarrito();
      };
    });
    let total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    if (carritoTotal) carritoTotal.textContent = `$${total}`;
    actualizarContadorCarrito();
  }

  function abrirCarrito() {
    if (!carritoSlide) return;
    carritoSlide.classList.remove('translate-x-full');
    document.body.classList.add('overflow-hidden');
    renderizarCarrito();
  }
  function cerrarCarritoSlide() {
    if (!carritoSlide) return;
    carritoSlide.classList.add('translate-x-full');
    document.body.classList.remove('overflow-hidden');
  }
  if (carritoBtn) carritoBtn.onclick = (e) => { e.preventDefault(); abrirCarrito(); };
  if (carritoBtnMobile) carritoBtnMobile.onclick = (e) => { e.preventDefault(); abrirCarrito(); };
  if (cerrarCarrito) cerrarCarrito.onclick = cerrarCarritoSlide;
  if (carritoSlide) {
    carritoSlide.onclick = (e) => {
      // Si el click es en el fondo (no en el contenido del slide)
      if (e.target === carritoSlide) cerrarCarritoSlide();
    };
  }
  if (finalizarCompra) finalizarCompra.onclick = () => {
    if (!carrito.length) return;
    let mensaje = '¡Hola! Quiero hacer un pedido:%0A';
    carrito.forEach(item => {
      mensaje += `- ${item.nombre} x${item.cantidad} ($${item.precio * item.cantidad})%0A`;
    });
    mensaje += `%0ATotal: $${carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)}`;
    // Redirigir correctamente a WhatsApp
    window.open(`https://wa.me/573001112233?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  // Inicializar contador al cargar la página
  actualizarContadorCarrito();

  // Exponer función global para actualizar el contador desde otras lógicas (ej: agregar al carrito)
  window.actualizarContadorCarrito = actualizarContadorCarrito;

  // Si se modifica el carrito en otra pestaña, actualizar el contador
  window.addEventListener('storage', (e) => {
    if (e.key === 'carrito') {
      carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      actualizarContadorCarrito();
    }
  });
})();

// ================= PANEL ADMIN =================
if (window.location.pathname.endsWith('admin.html')) {
  // --- Utilidades ---
  const jwt = localStorage.getItem('jwt');
  const API_URL = '/api';
  const form = document.getElementById('producto-form');
  const dropArea = document.getElementById('drop-area');
  const inputImagenes = document.getElementById('imagenes');
  const preview = document.getElementById('preview');
  const limpiarBtn = document.getElementById('limpiar-form');
  const msgDiv = document.getElementById('producto-form-msg');
  const categoriaSelect = document.getElementById('categoria');
  const adminProductosContainer = document.getElementById('admin-productos-container');
  const adminProductosMsg = document.getElementById('admin-productos-msg');
  const archivoMasivo = document.getElementById('archivo-masivo');
  const cargarMasivoBtn = document.getElementById('cargar-masivo');
  const descargarPlantilla = document.getElementById('descargar-plantilla');
  const masivoMsg = document.getElementById('masivo-msg');

  // --- 1. Drag & drop y previsualización de imágenes ---
  let imagenesSeleccionadas = [];
  function mostrarPreview(files) {
    preview.innerHTML = '';
    [...files].forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = e => {
        const div = document.createElement('div');
        div.className = 'relative group';
        div.innerHTML = `
          <img src="${e.target.result}" class="h-20 w-20 object-cover rounded shadow border-2 border-brandy-200 dark:border-brandy-700 transition-transform group-hover:scale-105 duration-200">
          <button type="button" class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-80 hover:opacity-100 transition" data-idx="${idx}">✕</button>
        `;
        preview.appendChild(div);
        div.querySelector('button').onclick = () => {
          imagenesSeleccionadas.splice(idx, 1);
          mostrarPreview(imagenesSeleccionadas);
        };
      };
      reader.readAsDataURL(file);
    });
  }
  dropArea.addEventListener('click', () => inputImagenes.click());
  dropArea.addEventListener('dragover', e => {
    e.preventDefault();
    dropArea.classList.add('border-brandy-500', 'bg-brandy-200');
  });
  dropArea.addEventListener('dragleave', e => {
    e.preventDefault();
    dropArea.classList.remove('border-brandy-500', 'bg-brandy-200');
  });
  dropArea.addEventListener('drop', e => {
    e.preventDefault();
    dropArea.classList.remove('border-brandy-500', 'bg-brandy-200');
    imagenesSeleccionadas = [...e.dataTransfer.files];
    mostrarPreview(imagenesSeleccionadas);
  });
  inputImagenes.addEventListener('change', e => {
    imagenesSeleccionadas = [...e.target.files];
    mostrarPreview(imagenesSeleccionadas);
  });

  // --- 2. Envío del formulario como multipart/form-data ---
  form.addEventListener('submit', async e => {
    e.preventDefault();
    msgDiv.textContent = 'Guardando producto...';
    msgDiv.className = 'text-brandy-700 dark:text-brandy-200 animate-pulse';
    // Empaquetar los datos del producto
    const producto = {
      nombre: form.nombre.value,
      descripcion: form.descripcion.value,
      precio: form.precio.value,
      stock: form.stock.value,
      materiales: form.materiales.value
    };
    const categoriaId = form.categoria.value;
    if (!categoriaId) {
      msgDiv.textContent = 'Selecciona una categoría antes de guardar.';
      msgDiv.className = 'text-red-600 dark:text-red-400';
      return;
    }
    const formData = new FormData();
    formData.append('producto', JSON.stringify(producto));
    formData.append('categoriaId', categoriaId);
    imagenesSeleccionadas.forEach(img => formData.append('imagenes', img));
    // DEBUG: Mostrar el contenido real del FormData antes de enviar
    for (let pair of formData.entries()) {
      console.log('FormData', pair[0], pair[1]);
    }
    try {
      const res = await fetch(`${API_URL}/admin/productos`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + jwt },
        body: formData
      });
      if (!res.ok) throw new Error('Error al guardar producto');
      msgDiv.textContent = '¡Producto guardado!';
      msgDiv.className = 'text-green-600 dark:text-green-400 animate-bounce';
      form.reset();
      imagenesSeleccionadas = [];
      mostrarPreview([]);
      cargarProductos();
    } catch (err) {
      msgDiv.textContent = err.message || 'Error al guardar producto';
      msgDiv.className = 'text-red-600 dark:text-red-400';
    }
  });
  limpiarBtn.addEventListener('click', () => {
    form.reset();
    imagenesSeleccionadas = [];
    mostrarPreview([]);
    msgDiv.textContent = '';
  });

  // --- 3. Carga masiva de productos ---
  descargarPlantilla.addEventListener('click', e => {
    e.preventDefault();
    // Descarga plantilla CSV simple
    const csv = 'nombre,precio,stock,descripcion,materiales,categoria\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  cargarMasivoBtn.addEventListener('click', async () => {
    if (!archivoMasivo.files.length) {
      masivoMsg.textContent = 'Selecciona un archivo primero.';
      masivoMsg.className = 'text-red-600 dark:text-red-400';
      return;
    }
    masivoMsg.textContent = 'Cargando productos...';
    masivoMsg.className = 'text-brandy-700 dark:text-brandy-200 animate-pulse';
    const formData = new FormData();
    formData.append('archivo', archivoMasivo.files[0]);
    try {
      const res = await fetch(`${API_URL}/productos/masivo`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + jwt },
        body: formData
      });
      if (!res.ok) throw new Error('Error al cargar archivo');
      masivoMsg.textContent = '¡Productos cargados!';
      masivoMsg.className = 'text-green-600 dark:text-green-400 animate-bounce';
      archivoMasivo.value = '';
      cargarProductos();
    } catch (err) {
      masivoMsg.textContent = err.message || 'Error al cargar archivo';
      masivoMsg.className = 'text-red-600 dark:text-red-400';
    }
  });

  // --- 4. Renderizado y edición inline de productos ---
  async function cargarCategorias() {
    try {
      const res = await fetch(`${API_URL}/categorias`);
      if (!res.ok) throw new Error('Error al cargar categorías');
      const cats = await res.json();
      categoriaSelect.innerHTML = '<option value="">Selecciona categoría</option>' +
        cats.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
      window._categoriasAdmin = cats; // Guardar para render inline
    } catch (err) {
      categoriaSelect.innerHTML = '<option value="">Error al cargar</option>';
    }
  }
  async function cargarProductos() {
    adminProductosMsg.textContent = 'Cargando productos...';
    adminProductosMsg.className = 'text-brandy-700 dark:text-brandy-200 animate-pulse';
    try {
      const res = await fetch(`${API_URL}/admin/productos`, {
        headers: { 'Authorization': 'Bearer ' + jwt }
      });
      if (!res.ok) throw new Error('Error al cargar productos');
      const productos = await res.json();
      if (!productos.length) {
        adminProductosContainer.innerHTML = '';
        adminProductosMsg.textContent = 'No hay productos.';
        return;
      }
      adminProductosMsg.textContent = '';
      adminProductosContainer.innerHTML = productos.map(p => renderProductoCard(p)).join('');
      productos.forEach(p => asignarEventosProducto(p.id));
    } catch (err) {
      adminProductosMsg.textContent = err.message || 'Error al cargar productos';
      adminProductosMsg.className = 'text-red-600 dark:text-red-400';
    }
  }
  function renderProductoCard(p) {
    const img = (p.imagenes && p.imagenes.length > 0) ? `/imagenes_productos/${p.imagenes[0].url}` : 'img/no-image.png';
    const cats = window._categoriasAdmin || [];
    return `
      <div class="bg-white dark:bg-brandy-900 rounded-lg shadow p-6 flex flex-col gap-2 relative group transition-transform hover:scale-105 duration-200" id="prod-${p.id}">
        <img src="${img}" alt="${p.nombre}" class="h-32 w-32 object-cover rounded mb-2 mx-auto border border-brandy-200 dark:border-brandy-700">
        <div class="flex flex-col gap-1 mb-2">
          <label class="text-xs text-brandy-500 dark:text-brandy-300 font-semibold" for="nombre-${p.id}">Nombre</label>
          <input id="nombre-${p.id}" class="text-xl font-bold text-center bg-transparent focus:bg-brandy-100 dark:focus:bg-brandy-800 rounded p-1 mb-1 transition border border-brandy-200 dark:border-brandy-700" value="${p.nombre}" data-field="nombre" data-id="${p.id}">
        </div>
        <div class="flex flex-col gap-1 mb-2">
          <label class="text-xs text-brandy-500 dark:text-brandy-300 font-semibold" for="descripcion-${p.id}">Descripción</label>
          <textarea id="descripcion-${p.id}" class="text-sm text-center bg-transparent focus:bg-brandy-100 dark:focus:bg-brandy-800 rounded p-1 mb-1 transition border border-brandy-200 dark:border-brandy-700" data-field="descripcion" data-id="${p.id}">${p.descripcion}</textarea>
        </div>
        <div class="flex flex-col gap-1 mb-2">
          <label class="text-xs text-brandy-500 dark:text-brandy-300 font-semibold" for="precio-${p.id}">Precio</label>
          <input id="precio-${p.id}" type="number" class="text-lg font-semibold text-center bg-transparent focus:bg-brandy-100 dark:focus:bg-brandy-800 rounded p-1 mb-1 transition border border-brandy-200 dark:border-brandy-700" value="${p.precio}" data-field="precio" data-id="${p.id}">
        </div>
        <div class="flex flex-col gap-1 mb-2">
          <label class="text-xs text-brandy-500 dark:text-brandy-300 font-semibold" for="stock-${p.id}">Stock</label>
          <input id="stock-${p.id}" type="number" class="text-sm text-center bg-transparent focus:bg-brandy-100 dark:focus:bg-brandy-800 rounded p-1 mb-1 transition border border-brandy-200 dark:border-brandy-700" value="${p.stock}" data-field="stock" data-id="${p.id}">
        </div>
        <div class="flex flex-col gap-1 mb-2">
          <label class="text-xs text-brandy-500 dark:text-brandy-300 font-semibold" for="materiales-${p.id}">Materiales</label>
          <input id="materiales-${p.id}" class="text-sm text-center bg-transparent focus:bg-brandy-100 dark:focus:bg-brandy-800 rounded p-1 mb-1 transition border border-brandy-200 dark:border-brandy-700" value="${p.materiales || ''}" data-field="materiales" data-id="${p.id}">
        </div>
        <div class="flex flex-col gap-1 mb-2">
          <label class="text-xs text-brandy-500 dark:text-brandy-300 font-semibold" for="categoria-${p.id}">Categoría</label>
          <select id="categoria-${p.id}" class="text-sm text-center bg-transparent focus:bg-brandy-100 dark:focus:bg-brandy-800 rounded p-1 mb-1 border border-brandy-200 dark:border-brandy-700" data-field="categoria" data-id="${p.id}">
            <option value="">Sin categoría</option>
            ${cats.map(c => `<option value="${c.id}" ${p.categoria && p.categoria.id === c.id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
          </select>
        </div>
        <div class="flex justify-center gap-2 mt-2">
          <button class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-1" data-accion="guardar" data-id="${p.id}" title="Guardar cambios"><span class="material-icons">save</span></button>
          <button class="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-1" data-accion="eliminar" data-id="${p.id}" title="Eliminar producto"><span class="material-icons">delete</span></button>
          <button class="px-3 py-1 rounded ${p.activo ? 'bg-brandy-600' : 'bg-gray-400'} text-white hover:bg-brandy-700 transition flex items-center gap-1" data-accion="toggle-activo" data-id="${p.id}" title="${p.activo ? 'Ocultar del catálogo' : 'Mostrar en catálogo'}"><span class="material-icons">${p.activo ? 'visibility' : 'visibility_off'}</span></button>
        </div>
        <div class="text-xs text-center mt-1 text-brandy-500 dark:text-brandy-200">ID: ${p.id}</div>
        <div class="text-xs text-center mt-1 text-brandy-400 dark:text-brandy-300">${p.categoria ? p.categoria.nombre : ''}</div>
        <div class="text-xs text-center mt-1 text-brandy-400 dark:text-brandy-300">${p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString() : ''}</div>
        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" id="feedback-${p.id}"></div>
      </div>
    `;
  }
  function asignarEventosProducto(id) {
    const card = document.getElementById(`prod-${id}`);
    if (!card) return;
    // Guardar cambios
    card.querySelector('[data-accion="guardar"]').onclick = async () => {
      const nombre = card.querySelector('[data-field="nombre"]').value;
      const descripcion = card.querySelector('[data-field="descripcion"]').value;
      const precio = card.querySelector('[data-field="precio"]').value;
      const stock = card.querySelector('[data-field="stock"]').value;
      const materiales = card.querySelector('[data-field="materiales"]').value;
      const categoriaId = card.querySelector('[data-field="categoria"]').value;
      const feedback = card.querySelector(`#feedback-${id}`);
      if (!categoriaId) {
        feedback.textContent = 'Selecciona una categoría';
        feedback.className = 'text-red-600 dark:text-red-400';
        return;
      }
      feedback.textContent = 'Guardando...';
      feedback.className = 'text-brandy-700 dark:text-brandy-200 animate-pulse';
      try {
        const formData = new FormData();
        formData.append('producto', JSON.stringify({ nombre, descripcion, precio, stock, materiales }));
        formData.append('categoriaId', categoriaId);
        const res = await fetch(`${API_URL}/admin/productos/${id}/editar`, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + jwt },
          body: formData
        });
        if (res.status === 409) throw new Error('Ya existe un producto con ese nombre');
        if (!res.ok) throw new Error('Error al guardar');
        feedback.textContent = '✔️';
        feedback.className = 'text-green-600 dark:text-green-400 animate-bounce';
        setTimeout(() => feedback.textContent = '', 1200);
        cargarProductos();
      } catch (err) {
        feedback.textContent = err.message || 'Error';
        feedback.className = 'text-red-600 dark:text-red-400';
      }
    };
    // Eliminar producto
    card.querySelector('[data-accion="eliminar"]').onclick = async () => {
      if (!confirm('¿Eliminar este producto?')) return;
      const feedback = card.querySelector(`#feedback-${id}`);
      feedback.textContent = 'Eliminando...';
      feedback.className = 'text-brandy-700 dark:text-brandy-200 animate-pulse';
      try {
        const res = await fetch(`${API_URL}/admin/productos/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + jwt }
        });
        if (!res.ok) throw new Error('Error al eliminar');
        feedback.textContent = 'Eliminado';
        feedback.className = 'text-green-600 dark:text-green-400 animate-bounce';
        setTimeout(() => cargarProductos(), 800);
      } catch (err) {
        feedback.textContent = 'Error';
        feedback.className = 'text-red-600 dark:text-red-400';
      }
    };
    // Activar/desactivar
    card.querySelector('[data-accion="toggle-activo"]').onclick = async () => {
      const feedback = card.querySelector(`#feedback-${id}`);
      feedback.textContent = 'Actualizando...';
      feedback.className = 'text-brandy-700 dark:text-brandy-200 animate-pulse';
      try {
        const activo = !card.querySelector('[data-accion="toggle-activo"]').classList.contains('bg-brandy-600');
        const res = await fetch(`${API_URL}/admin/productos/${id}/estado?activo=${activo}`, {
          method: 'PATCH',
          headers: { 'Authorization': 'Bearer ' + jwt }
        });
        if (!res.ok) throw new Error('Error al actualizar');
        feedback.textContent = '✔️';
        feedback.className = 'text-green-600 dark:text-green-400 animate-bounce';
        setTimeout(() => cargarProductos(), 800);
      } catch (err) {
        feedback.textContent = 'Error';
        feedback.className = 'text-red-600 dark:text-red-400';
      }
    };
  }

  // --- Crear categoría desde el panel admin ---
  const categoriaForm = document.getElementById('categoria-form');
  const nombreCategoriaInput = document.getElementById('nombre-categoria');
  const categoriaFormMsg = document.getElementById('categoria-form-msg');
  if (categoriaForm) {
    categoriaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      categoriaFormMsg.textContent = 'Creando categoría...';
      categoriaFormMsg.className = 'text-brandy-700 dark:text-brandy-200 animate-pulse';
      try {
        const res = await fetch(`${API_URL}/categorias`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + jwt,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nombre: nombreCategoriaInput.value })
        });
        if (!res.ok) throw new Error('Error al crear categoría');
        categoriaFormMsg.textContent = '¡Categoría creada!';
        categoriaFormMsg.className = 'text-green-600 dark:text-green-400 animate-bounce';
        categoriaForm.reset();
        cargarCategorias();
      } catch (err) {
        categoriaFormMsg.textContent = err.message || 'Error al crear categoría';
        categoriaFormMsg.className = 'text-red-600 dark:text-red-400';
      }
    });
  }

  // --- Inicialización ---
  cargarCategorias().then(cargarProductos);
}

// Quitar el outline molesto al hacer click en el cuadro del producto y evitar el cursor de texto/caret
const style = document.createElement('style');
style.innerHTML = `
  .producto-card:focus {
    outline: none !important;
    box-shadow: none !important;
  }
  .producto-card {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    cursor: pointer;
    caret-color: transparent;
  }
  .producto-card button, .producto-card input, .producto-card textarea {
    user-select: auto;
    caret-color: auto;
    cursor: pointer;
  }
`;
document.head.appendChild(style);

// Cierre global del slide-over del carrito al hacer click fuera del panel
window.addEventListener('mousedown', function(e) {
  const carritoSlide = document.getElementById('carrito-slide');
  if (!carritoSlide) return;
  if (!carritoSlide.classList.contains('translate-x-full')) {
    // Si el click es fuera del panel (no dentro del slide)
    if (!carritoSlide.contains(e.target) || e.target === carritoSlide) {
      carritoSlide.classList.add('translate-x-full');
      document.body.classList.remove('overflow-hidden');
    }
  }
});

// Unificar diseño de página activa en el menú principal (desktop y mobile)
document.addEventListener('DOMContentLoaded', function () {
  const path = window.location.pathname.split('/').pop();
  const mainMenuLinks = document.querySelectorAll('#main-menu a');
  const mobileMenuLinks = document.querySelectorAll('#mobile-menu a');
  mainMenuLinks.forEach(link => {
    if (link.getAttribute('href') === path) {
      link.classList.add('font-bold', 'underline', 'text-brandy-700');
    } else {
      link.classList.remove('font-bold', 'underline', 'text-brandy-700');
    }
  });
  mobileMenuLinks.forEach(link => {
    if (link.getAttribute('href') === path) {
      link.classList.add('font-bold', 'underline', 'text-brandy-700');
    } else {
      link.classList.remove('font-bold', 'underline', 'text-brandy-700');
    }
  });
});
