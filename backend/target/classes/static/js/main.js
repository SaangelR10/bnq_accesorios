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
      // Obtener userId y migrar carrito
      fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + data.token } })
        .then(res => res.ok ? res.json() : null)
        .then(user => { if (user && user.id) migrarCarritoAlIniciarSesion(user.id); });
      window.usuarioLogueado = true;
      messageDiv.textContent = '¡Inicio de sesión exitoso!';
      messageDiv.className = 'mb-4 text-center text-sm text-green-600 dark:text-green-400';
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
      // Obtener userId y migrar carrito
      fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + data.token } })
        .then(res => res.ok ? res.json() : null)
        .then(user => { if (user && user.id) migrarCarritoAlIniciarSesion(user.id); });
      window.usuarioLogueado = true;
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
          localStorage.removeItem('carrito');
          window.location.href = 'index.html';
        };
      }
      if (logoutBtnMobile) {
        logoutBtnMobile.classList.remove('hidden');
        logoutBtnMobile.onclick = () => {
          localStorage.removeItem('jwt');
          localStorage.removeItem('carrito');
          window.location.href = 'index.html';
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
  function abrirModalDetalle(producto, imagenInicial = 0) {
    const imagenes = (producto.imagenes && producto.imagenes.length > 0) ? producto.imagenes : [{url:'img/no-image.png'}];
    let galeria = `<div class='flex flex-col items-center w-full mb-2'>
      <img src='${imagenes[imagenInicial].url}' alt='${producto.nombre}' class='h-60 w-60 object-cover rounded-xl shadow galeria-img-modal cursor-pointer' data-idx='${imagenInicial}'>
      <div class='flex gap-1 justify-center mt-2 galeria-miniaturas-modal'>`;
    imagenes.forEach((img, idx) => {
      galeria += `<img src='${img.url}' class='h-12 w-12 object-cover rounded border-2 ${idx===imagenInicial?'border-brandy-500':'border-brandy-200 dark:border-brandy-700'} galeria-miniatura-modal cursor-pointer' data-idx='${idx}'>`;
    });
    galeria += `</div></div>`;
    modalContent.innerHTML = `
      <div class="flex flex-col md:flex-row gap-8 items-center">
        <div class='flex flex-col items-center'>
          ${galeria}
        </div>
        <div class="flex-1 flex flex-col gap-2">
          <h2 class="text-3xl font-bold text-brandy-700 dark:text-brandy-100 mb-2">${producto.nombre}</h2>
          <p class="text-brandy-600 dark:text-brandy-200 mb-2">${producto.descripcion}</p>
          <div class="flex gap-4 mb-2">
            <span class="text-brandy-500 font-bold text-2xl">${formatoCOP(producto.precio)}</span>
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
    // Galería tipo Amazon en modal
    const imgModal = modalContent.querySelector('.galeria-img-modal');
    const miniaturasModal = modalContent.querySelectorAll('.galeria-miniatura-modal');
    miniaturasModal.forEach((mini, idx) => {
      mini.onclick = function(e) {
        imgModal.src = mini.src;
        imgModal.dataset.idx = idx;
        miniaturasModal.forEach((m, i) => {
          m.className = m.className.replace('border-brandy-500','border-brandy-200 dark:border-brandy-700');
          if(i===idx) m.className = m.className.replace('border-brandy-200 dark:border-brandy-700','border-brandy-500');
        });
      };
    });
    imgModal.onclick = function(e) {
      e.stopPropagation();
      const url = imgModal.src;
      const visor = document.createElement('div');
      visor.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90';
      visor.innerHTML = `<img src='${url}' class='max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl'><button class='absolute top-4 right-4 text-4xl text-white'>&times;</button>`;
      visor.querySelector('button').onclick = () => visor.remove();
      visor.onclick = (ev) => { if(ev.target===visor) visor.remove(); };
      document.body.appendChild(visor);
    };
    document.getElementById('cantidad-detalle').addEventListener('input', function() {
      if (this.value < 1) this.value = 1;
      if (this.value > producto.stock) this.value = producto.stock;
    });
    document.getElementById('agregar-carrito-detalle').onclick = () => {
      if (!window.usuarioLogueado) {
        abrirCarrito();
        mostrarMensajeLoginCarrito();
        return;
      }
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
        imagen: (producto.imagenes && producto.imagenes.length > 0) ? producto.imagenes[0].url : 'img/no-image.png',
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
      if (carritoTotal) carritoTotal.textContent = formatoCOP(0);
      if (window.actualizarContadorCarrito) window.actualizarContadorCarrito();
      return;
    }
    carritoItems.innerHTML = carrito.map(item => `
      <div class="flex items-center gap-4 mb-6">
        <img src="${item.imagen}" alt="${item.nombre}" class="h-20 w-20 object-cover rounded shadow border border-brandy-200 dark:border-brandy-700">
        <div class="flex-1 flex flex-col gap-1">
          <span class="font-semibold text-brandy-700 dark:text-brandy-100 text-lg">${item.nombre}</span>
          <span class="text-brandy-500 dark:text-brandy-200 text-sm">${formatoCOP(item.precio)} x </span>
          <div class="flex items-center gap-2 mt-1">
            <input type="number" min="1" max="${item.stock}" value="${item.cantidad}" data-id="${item.id}" class="w-16 p-2 rounded border border-brandy-200 dark:border-brandy-700 bg-brandy-50 dark:bg-brandy-900 focus:outline-none focus:ring-2 focus:ring-brandy-500 cantidad-carrito">
            <button class="text-red-500 hover:text-red-700 transition eliminar-carrito" data-id="${item.id}" title="Eliminar"><span class="material-icons">delete</span></button>
          </div>
        </div>
        <div class="font-bold text-brandy-700 dark:text-brandy-100 text-lg">${formatoCOP(item.precio * item.cantidad)}</div>
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
    if (carritoTotal) carritoTotal.textContent = formatoCOP(total);
    if (window.actualizarContadorCarrito) window.actualizarContadorCarrito();
  }
  if (finalizarCompra) finalizarCompra.onclick = () => {
    let carritoActual = window.carrito || JSON.parse(localStorage.getItem(window.carritoKey || 'carrito')) || [];
    if (!carritoActual.length) return;
    let mensaje = '¡Hola! Quiero hacer un pedido:%0A';
    carritoActual.forEach(item => {
      mensaje += `- ${item.nombre} x${item.cantidad} (${formatoCOP(item.precio * item.cantidad)})%0A`;
    });
    mensaje += `%0ATotal: ${formatoCOP(carritoActual.reduce((sum, item) => sum + item.precio * item.cantidad, 0))}`;
    window.open(`https://wa.me/57321938510?text=${encodeURIComponent(mensaje)}`, '_blank');
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
      const imagenes = (p.imagenes && p.imagenes.length > 0) ? p.imagenes : [{url:'img/no-image.png'}];
      let galeria = `<div class='flex flex-col items-center w-full mb-2'>
        <img src='${imagenes[0].url}' alt='${p.nombre}' class='h-40 w-40 object-cover rounded shadow border border-brandy-200 dark:border-brandy-700 galeria-img-principal cursor-pointer' data-id='${p.id}' data-idx='0'>
        <div class='flex gap-1 justify-center mt-2 galeria-miniaturas' data-id='${p.id}'>`;
      imagenes.forEach((img, idx) => {
        galeria += `<img src='${img.url}' class='h-10 w-10 object-cover rounded border-2 ${idx===0?'border-brandy-500':'border-brandy-200 dark:border-brandy-700'} galeria-miniatura cursor-pointer' data-id='${p.id}' data-idx='${idx}'>`;
      });
      galeria += `</div></div>`;
      let controls = `<div class='flex items-center gap-2 mt-2 justify-center'>
        <input type='number' min='1' max='${p.stock}' value='1' class='w-16 p-2 rounded border border-brandy-200 dark:border-brandy-700 bg-brandy-50 dark:bg-brandy-900 focus:outline-none focus:ring-2 focus:ring-brandy-500 cantidad-input' data-id='${p.id}'>
        <button class='bg-brandy-500 text-white px-4 py-2 rounded hover:bg-brandy-600 transition agregar-carrito-btn' data-id='${p.id}'>Agregar al carrito</button>
      </div>`;
      return `
        <div class="producto-card bg-white dark:bg-brandy-800 rounded-lg shadow p-6 flex flex-col items-center transition hover:scale-105 group w-full max-w-xs mx-auto mb-6" data-id="${p.id}">
          ${galeria}
          <h2 class="text-xl font-semibold text-brandy-700 dark:text-brandy-100 mb-2 mt-2 text-center">${p.nombre}</h2>
          <p class="text-brandy-600 dark:text-brandy-200 mb-2 text-center">${p.descripcion}</p>
          <span class="text-brandy-500 font-bold text-lg mb-1">${formatoCOP(p.precio)}</span>
          <span class="text-sm text-brandy-400 dark:text-brandy-300 mb-2">Stock: ${p.stock}</span>
          ${controls}
          <button class="bg-brandy-200 text-brandy-700 px-3 py-1 rounded hover:bg-brandy-300 transition ver-detalle mt-2 w-full" data-id="${p.id}">Ver detalles</button>
        </div>
      `;
    }).join('');
    // Galería tipo Amazon: miniaturas y click en imagen principal
    document.querySelectorAll('.galeria-img-principal').forEach(img => {
      img.onclick = function(e) {
        const id = this.dataset.id;
        const idx = parseInt(this.dataset.idx);
        abrirModalDetalle(productosFiltrados.find(p=>p.id==id), idx);
      };
    });
    document.querySelectorAll('.galeria-miniatura').forEach(mini => {
      mini.onclick = function(e) {
        const id = this.dataset.id;
        const idx = parseInt(this.dataset.idx);
        const card = document.querySelector(`.producto-card[data-id='${id}']`);
        const imgPrincipal = card.querySelector('.galeria-img-principal');
        imgPrincipal.src = mini.src;
        imgPrincipal.dataset.idx = idx;
        card.querySelectorAll('.galeria-miniatura').forEach((m, i) => {
          m.className = m.className.replace('border-brandy-500','border-brandy-200 dark:border-brandy-700');
          if(i===idx) m.className = m.className.replace('border-brandy-200 dark:border-brandy-700','border-brandy-500');
        });
      };
    });
    // ... existing code de controles y botones ...
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
      if (carritoTotal) carritoTotal.textContent = formatoCOP(0);
      actualizarContadorCarrito();
      return;
    }
    carritoItems.innerHTML = carrito.map(item => `
      <div class="flex items-center gap-4 mb-6">
        <img src="${item.imagen}" alt="${item.nombre}" class="h-20 w-20 object-cover rounded shadow border border-brandy-200 dark:border-brandy-700">
        <div class="flex-1 flex flex-col gap-1">
          <span class="font-semibold text-brandy-700 dark:text-brandy-100 text-lg">${item.nombre}</span>
          <span class="text-brandy-500 dark:text-brandy-200 text-sm">${formatoCOP(item.precio)} x </span>
          <div class="flex items-center gap-2 mt-1">
            <input type="number" min="1" max="${item.stock}" value="${item.cantidad}" data-id="${item.id}" class="w-16 p-2 rounded border border-brandy-200 dark:border-brandy-700 bg-brandy-50 dark:bg-brandy-900 focus:outline-none focus:ring-2 focus:ring-brandy-500 cantidad-carrito">
            <button class="text-red-500 hover:text-red-700 transition eliminar-carrito" data-id="${item.id}" title="Eliminar"><span class="material-icons">delete</span></button>
          </div>
        </div>
        <div class="font-bold text-brandy-700 dark:text-brandy-100 text-lg">${formatoCOP(item.precio * item.cantidad)}</div>
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
    if (carritoTotal) carritoTotal.textContent = formatoCOP(total);
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
    let carritoActual = window.carrito || JSON.parse(localStorage.getItem(window.carritoKey || 'carrito')) || [];
    if (!carritoActual.length) return;
    let mensaje = '¡Hola! Quiero hacer un pedido:%0A';
    carritoActual.forEach(item => {
      mensaje += `- ${item.nombre} x${item.cantidad} (${formatoCOP(item.precio * item.cantidad)})%0A`;
    });
    mensaje += `%0ATotal: ${formatoCOP(carritoActual.reduce((sum, item) => sum + item.precio * item.cantidad, 0))}`;
    window.open(`https://wa.me/573219238510?text=${encodeURIComponent(mensaje)}`, '_blank');
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
  if (!jwt) {
    alert('No hay sesión activa. Por favor, inicia sesión para usar el panel de administración.');
    // Opcional: redirigir a login
    window.location.href = '/cuenta.html';
    throw new Error('No hay JWT');
  }
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

  // --- Variables para las nuevas funcionalidades ---
  const categoriasContainer = document.getElementById('categorias-container');
  const vistaTarjetasBtn = document.getElementById('vista-tarjetas');
  const vistaTablaBtn = document.getElementById('vista-tabla');
  const vistaTarjetasContainer = document.getElementById('vista-tarjetas-container');
  const vistaTablaContainer = document.getElementById('vista-tabla-container');
  const tablaProductos = document.getElementById('tabla-productos');
  const modalEditarCategoria = document.getElementById('modal-editar-categoria');
  const formEditarCategoria = document.getElementById('form-editar-categoria');
  const cancelarEditarCategoria = document.getElementById('cancelar-editar-categoria');

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
    // Validación de tamaño máximo (50MB por archivo)
    const maxSize = 50 * 1024 * 1024; // 50MB
    let error = false;
    imagenesSeleccionadas.forEach(img => {
      if (img.size > maxSize) error = true;
    });
    if (error) {
      msgDiv.textContent = 'Alguna imagen supera el tamaño máximo permitido (50MB).';
      msgDiv.className = 'text-red-600 dark:text-red-400';
      imagenesSeleccionadas = [];
      inputImagenes.value = '';
      mostrarPreview([]);
      return;
    }
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
    if (imagenesSeleccionadas.length > 0) {
    imagenesSeleccionadas.forEach(img => formData.append('imagenes', img));
    }
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
      
      // Recargar todo automáticamente
      await cargarProductos();
      if (vistaTablaContainer && !vistaTablaContainer.classList.contains('hidden')) {
        await cargarProductosTabla();
      }
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
    // Crear plantilla Excel simple solo con encabezados
    const datos = [
      ['nombre', 'precio', 'stock', 'descripcion', 'materiales', 'categoria']
    ];
    
    // Crear CSV con los datos
    const csv = datos.map(fila => fila.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos_bnq.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Mostrar mensaje informativo
    masivoMsg.textContent = 'Plantilla descargada. Completa los datos y súbela para cargar productos masivamente.';
    masivoMsg.className = 'text-green-600 dark:text-green-400';
  });

  // Variables para la carga masiva
  let productosMasivos = [];
  let modalMasivo = null;

  cargarMasivoBtn.addEventListener('click', async () => {
    if (!archivoMasivo.files.length) {
      masivoMsg.textContent = 'Selecciona un archivo primero.';
      masivoMsg.className = 'text-red-600 dark:text-red-400';
      return;
    }
    
    masivoMsg.textContent = 'Procesando archivo...';
    masivoMsg.className = 'text-brandy-700 dark:text-brandy-200 animate-pulse';
    
    const formData = new FormData();
    formData.append('archivo', archivoMasivo.files[0]);
    
    try {
      const res = await fetch(`${API_URL}/productos/masivo`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + jwt },
        body: formData
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      
      productosMasivos = await res.json();
      
      if (productosMasivos.length === 0) {
        masivoMsg.textContent = 'No se encontraron productos válidos en el archivo.';
        masivoMsg.className = 'text-red-600 dark:text-red-400';
        return;
      }
      
      // Mostrar modal de previsualización
      mostrarModalMasivo();
      
    } catch (err) {
      masivoMsg.textContent = err.message || 'Error al procesar archivo';
      masivoMsg.className = 'text-red-600 dark:text-red-400';
    }
  });

  function mostrarModalMasivo() {
    // Crear modal si no existe
    if (!modalMasivo) {
      modalMasivo = document.createElement('div');
      modalMasivo.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
      modalMasivo.innerHTML = `
        <div class="bg-white dark:bg-brandy-900 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div class="flex justify-between items-center p-6 border-b border-brandy-200 dark:border-brandy-700">
            <h2 class="text-2xl font-bold text-brandy-700 dark:text-brandy-100">
              Previsualización de Productos (${productosMasivos.length} productos)
            </h2>
            <button id="cerrar-modal-masivo" class="text-brandy-500 hover:text-brandy-700 dark:text-brandy-400 dark:hover:text-brandy-200 text-2xl">
              ×
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div class="grid gap-6" id="productos-masivos-container">
              ${productosMasivos.map((producto, index) => renderProductoMasivo(producto, index)).join('')}
            </div>
          </div>
          
          <div class="flex justify-between items-center p-6 border-t border-brandy-200 dark:border-brandy-700">
            <button id="cancelar-masivo" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
              Cancelar
            </button>
            <div class="flex gap-4">
              <span class="text-sm text-brandy-600 dark:text-brandy-300">
                Productos a cargar: <span id="contador-productos">${productosMasivos.length}</span>
              </span>
              <button id="confirmar-masivo" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                Confirmar Carga (${productosMasivos.length} productos)
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modalMasivo);
      
      // Eventos del modal
      document.getElementById('cerrar-modal-masivo').onclick = cerrarModalMasivo;
      document.getElementById('cancelar-masivo').onclick = cerrarModalMasivo;
      document.getElementById('confirmar-masivo').onclick = confirmarCargaMasiva;
    }
  }

  function renderProductoMasivo(producto, index) {
    return `
      <div class="bg-brandy-50 dark:bg-brandy-800 rounded-lg p-6 border border-brandy-200 dark:border-brandy-700" data-index="${index}">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold text-brandy-700 dark:text-brandy-100">
            Producto ${index + 1}
          </h3>
          <button class="text-red-500 hover:text-red-700 transition eliminar-producto-masivo" data-index="${index}" title="Eliminar producto">
            🗑️
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-brandy-600 dark:text-brandy-300 mb-1">Nombre</label>
              <input type="text" class="w-full p-2 border border-brandy-300 dark:border-brandy-600 rounded bg-white dark:bg-brandy-900 text-brandy-700 dark:text-brandy-100" 
                     value="${producto.nombre}" data-field="nombre" data-index="${index}">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-brandy-600 dark:text-brandy-300 mb-1">Precio (COP)</label>
              <input type="number" class="w-full p-2 border border-brandy-300 dark:border-brandy-600 rounded bg-white dark:bg-brandy-900 text-brandy-700 dark:text-brandy-100" 
                     value="${producto.precio}" data-field="precio" data-index="${index}">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-brandy-600 dark:text-brandy-300 mb-1">Stock</label>
              <input type="number" class="w-full p-2 border border-brandy-300 dark:border-brandy-600 rounded bg-white dark:bg-brandy-900 text-brandy-700 dark:text-brandy-100" 
                     value="${producto.stock}" data-field="stock" data-index="${index}">
            </div>
          </div>
          
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-brandy-600 dark:text-brandy-300 mb-1">Categoría</label>
              <input type="text" class="w-full p-2 border border-brandy-300 dark:border-brandy-600 rounded bg-white dark:bg-brandy-900 text-brandy-700 dark:text-brandy-100" 
                     value="${producto.categoria}" data-field="categoria" data-index="${index}">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-brandy-600 dark:text-brandy-300 mb-1">Materiales</label>
              <input type="text" class="w-full p-2 border border-brandy-300 dark:border-brandy-600 rounded bg-white dark:bg-brandy-900 text-brandy-700 dark:text-brandy-100" 
                     value="${producto.materiales}" data-field="materiales" data-index="${index}">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-brandy-600 dark:text-brandy-300 mb-1">Descripción</label>
              <textarea class="w-full p-2 border border-brandy-300 dark:border-brandy-600 rounded bg-white dark:bg-brandy-900 text-brandy-700 dark:text-brandy-100" 
                        rows="2" data-field="descripcion" data-index="${index}">${producto.descripcion}</textarea>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <label class="block text-sm font-medium text-brandy-600 dark:text-brandy-300 mb-2">Imágenes del producto</label>
          <div class="border-2 border-dashed border-brandy-300 dark:border-brandy-600 rounded-lg p-4 text-center drop-area-masivo" data-index="${index}">
            <div class="text-brandy-500 dark:text-brandy-400">
              <p class="mb-2">Arrastra imágenes aquí o haz clic para seleccionar</p>
              <p class="text-sm">Formatos: JPG, PNG, GIF (máx. 50MB por imagen)</p>
            </div>
            <input type="file" class="hidden input-imagenes-masivo" multiple accept="image/*" data-index="${index}">
          </div>
          <div class="flex flex-wrap gap-2 mt-2 preview-imagenes-masivo" data-index="${index}"></div>
        </div>
      </div>
    `;
  }

  function cerrarModalMasivo() {
    if (modalMasivo) {
      modalMasivo.remove();
      modalMasivo = null;
      productosMasivos = [];
      archivoMasivo.value = '';
      masivoMsg.textContent = '';
    }
  }

  async function confirmarCargaMasiva() {
    const btnConfirmar = document.getElementById('confirmar-masivo');
    btnConfirmar.textContent = 'Guardando productos...';
    btnConfirmar.disabled = true;
    
    try {
      // Recopilar datos actualizados de los productos
      const productosActualizados = productosMasivos.map((producto, index) => {
        const container = document.querySelector(`[data-index="${index}"]`);
        if (!container) return producto;
        
        return {
          nombre: container.querySelector('[data-field="nombre"]').value,
          precio: parseFloat(container.querySelector('[data-field="precio"]').value),
          stock: parseInt(container.querySelector('[data-field="stock"]').value),
          descripcion: container.querySelector('[data-field="descripcion"]').value,
          materiales: container.querySelector('[data-field="materiales"]').value,
          categoria: container.querySelector('[data-field="categoria"]').value
        };
      });
      
      const res = await fetch(`${API_URL}/productos/masivo/confirmar`, {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer ' + jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productosActualizados)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      
      const productosGuardados = await res.json();
      
      // Mostrar mensaje de éxito
      masivoMsg.textContent = `¡${productosGuardados.length} productos cargados exitosamente!`;
      masivoMsg.className = 'text-green-600 dark:text-green-400 animate-bounce';
      
      // Cerrar modal y limpiar
      cerrarModalMasivo();
      archivoMasivo.value = '';
      
      // Recargar productos
      await cargarProductos();
      if (vistaTablaContainer && !vistaTablaContainer.classList.contains('hidden')) {
        await cargarProductosTabla();
      }
      
    } catch (err) {
      masivoMsg.textContent = err.message || 'Error al guardar productos';
      masivoMsg.className = 'text-red-600 dark:text-red-400';
      btnConfirmar.textContent = `Confirmar Carga (${productosMasivos.length} productos)`;
      btnConfirmar.disabled = false;
    }
  }

  // Eventos delegados para el modal masivo
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('eliminar-producto-masivo')) {
      const index = parseInt(e.target.dataset.index);
      if (confirm('¿Eliminar este producto de la carga?')) {
        productosMasivos.splice(index, 1);
        actualizarModalMasivo();
      }
    }
  });

  document.addEventListener('change', function(e) {
    if (e.target.classList.contains('input-imagenes-masivo')) {
      const index = parseInt(e.target.dataset.index);
      const files = Array.from(e.target.files);
      mostrarPreviewImagenesMasivo(files, index);
    }
  });

  document.addEventListener('dragover', function(e) {
    if (e.target.classList.contains('drop-area-masivo')) {
      e.preventDefault();
      e.target.classList.add('border-brandy-500', 'bg-brandy-100');
    }
  });

  document.addEventListener('dragleave', function(e) {
    if (e.target.classList.contains('drop-area-masivo')) {
      e.preventDefault();
      e.target.classList.remove('border-brandy-500', 'bg-brandy-100');
    }
  });

  document.addEventListener('drop', function(e) {
    if (e.target.classList.contains('drop-area-masivo')) {
      e.preventDefault();
      e.target.classList.remove('border-brandy-500', 'bg-brandy-100');
      const index = parseInt(e.target.dataset.index);
      const files = Array.from(e.dataTransfer.files);
      mostrarPreviewImagenesMasivo(files, index);
    }
  });

  function mostrarPreviewImagenesMasivo(files, index) {
    const preview = document.querySelector(`.preview-imagenes-masivo[data-index="${index}"]`);
    if (!preview) return;
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const div = document.createElement('div');
          div.className = 'relative';
          div.innerHTML = `
            <img src="${e.target.result}" class="h-16 w-16 object-cover rounded border border-brandy-200 dark:border-brandy-700">
            <button class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-700">×</button>
          `;
          div.querySelector('button').onclick = () => div.remove();
          preview.appendChild(div);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  function actualizarModalMasivo() {
    if (!modalMasivo) return;
    
    const container = document.getElementById('productos-masivos-container');
    const contador = document.getElementById('contador-productos');
    const btnConfirmar = document.getElementById('confirmar-masivo');
    
    container.innerHTML = productosMasivos.map((producto, index) => renderProductoMasivo(producto, index)).join('');
    contador.textContent = productosMasivos.length;
    btnConfirmar.textContent = `Confirmar Carga (${productosMasivos.length} productos)`;
    
    if (productosMasivos.length === 0) {
      cerrarModalMasivo();
    }
    
    // Agregar eventos a las nuevas áreas de drop
    container.querySelectorAll('.drop-area-masivo').forEach(area => {
      area.addEventListener('click', () => {
        const index = parseInt(area.dataset.index);
        const input = document.querySelector(`.input-imagenes-masivo[data-index="${index}"]`);
        if (input) input.click();
      });
    });
  }

  // --- 4. Cargar categorías y productos existentes ---
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
        vistaTarjetasContainer.innerHTML = '';
        adminProductosMsg.textContent = 'No hay productos.';
        return;
      }
      adminProductosMsg.textContent = '';
      vistaTarjetasContainer.innerHTML = productos.map(p => renderProductoCard(p)).join('');
      productos.forEach(p => asignarEventosProducto(p.id));
    } catch (err) {
      adminProductosMsg.textContent = err.message || 'Error al cargar productos';
      adminProductosMsg.className = 'text-red-600 dark:text-red-400';
    }
  }

  function renderProductoCard(p) {
    const img = (p.imagenes && p.imagenes.length > 0) ? p.imagenes[0].url : 'img/no-image.png';
    const cats = window._categoriasAdmin || [];
    // Galería de imágenes actuales con botón de eliminar
    let galeria = '';
    if (p.imagenes && p.imagenes.length > 0) {
      galeria = `<div class='flex flex-wrap gap-2 mb-2'>`;
      p.imagenes.forEach(im => {
        galeria += `<div class='relative group'>
          <img src='${im.url}' class='h-16 w-16 object-cover rounded border border-brandy-200 dark:border-brandy-700'>
          <button type='button' class='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-80 hover:opacity-100 transition eliminar-img-admin' data-url='${im.url}' title='Eliminar'>&times;</button>
        </div>`;
      });
      galeria += `</div>`;
    }
    // ... existing code ...
    // Agregar input para nuevas imágenes
    return `
      <div class="bg-white dark:bg-brandy-900 rounded-lg shadow p-6 flex flex-col gap-2 relative group transition-transform hover:scale-105 duration-200" id="prod-${p.id}">
        ${galeria}
        <input type="file" class="input-nuevas-imagenes mb-2" data-id="${p.id}" multiple accept="image/*">
        <div class="preview-nuevas-imagenes flex flex-wrap gap-2 mb-2" data-id="${p.id}"></div>
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
          <input id="precio-${p.id}" type="number" step="0.01" class="text-lg font-semibold text-center bg-transparent focus:bg-brandy-100 dark:focus:bg-brandy-800 rounded p-1 mb-1 transition border border-brandy-200 dark:border-brandy-700" value="${p.precio}" data-field="precio" data-id="${p.id}">
        </div>
        <div class="flex flex-col gap-1 mb-2">
          <label class="text-xs text-brandy-500 dark:text-brandy-300 font-semibold" for="stock-${p.id}">Stock</label>
          <input id="stock-${p.id}" type="number" class="text-sm text-center bg-transparent focus:bg-brandy-100 dark:focus:bg-brandy-800 rounded p-1 mb-1 transition border border-brandy-200 dark:border-brandy-700" value="${p.stock}" data-field="stock" data-id="${p.id}">
        </div>
        <div class="flex flex-col gap-1 mb-2">
          <label class="text-xs text-brandy-500 dark:text-brandy-300 font-semibold" for="materiales-${p.id}">Materiales</label>
          <input id="materiales-${p.id}" class="text-sm text-center bg-transparent focus:bg-brandy-100 dark:focus:bg-brandy-800 rounded p-1 mb-1 transition border border-brandy-200 dark:border-brandy-700" value="${p.materiales}" data-field="materiales" data-id="${p.id}">
        </div>
        <div class="flex flex-col gap-1 mb-2">
          <label class="text-xs text-brandy-500 dark:text-brandy-300 font-semibold" for="categoria-${p.id}">Categoría</label>
          <select id="categoria-${p.id}" class="text-sm text-center bg-transparent focus:bg-brandy-100 dark:focus:bg-brandy-800 rounded p-1 mb-1 transition border border-brandy-200 dark:border-brandy-700" data-field="categoria" data-id="${p.id}">
            ${cats.map(c => `<option value="${c.id}" ${p.categoria && p.categoria.id === c.id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
          </select>
        </div>
        <div class="flex justify-center gap-2 mt-2">
          <button class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-1" data-accion="guardar" data-id="${p.id}" title="Guardar cambios">💾</button>
          <button class="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-1" data-accion="eliminar" data-id="${p.id}" title="Eliminar producto">🗑️</button>
          <button class="px-3 py-1 rounded ${p.activo ? 'bg-brandy-600' : 'bg-gray-400'} text-white hover:bg-brandy-700 transition flex items-center gap-1" data-accion="toggle-activo" data-id="${p.id}" title="${p.activo ? 'Ocultar del catálogo' : 'Mostrar en catálogo'}">${p.activo ? '👁️' : '🙈'}</button>
        </div>
        <div class="text-xs text-center mt-1 text-brandy-500 dark:text-brandy-200">ID: ${p.id}</div>
        <div class="text-xs text-center mt-1 text-brandy-400 dark:text-brandy-300">
          <strong>Categoría:</strong> ${p.categoria ? p.categoria.nombre : 'Sin categoría'}
        </div>
        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" id="feedback-${p.id}"></div>
      </div>
    `;
  }

  function asignarEventosProducto(id) {
    const card = document.getElementById(`prod-${id}`);
    if (!card) return;
    // ... existing code ...
    // Lógica para eliminar imágenes actuales (marcar para borrar)
    let imagenesAEliminar = [];
    card.querySelectorAll('.eliminar-img-admin').forEach(btn => {
      btn.onclick = function() {
        const url = this.dataset.url;
        imagenesAEliminar.push(url);
        this.parentElement.remove();
      };
    });
    // Evento para eliminar producto desde la tarjeta
    const btnEliminar = card.querySelector('[data-accion="eliminar"]');
    if (btnEliminar) {
      btnEliminar.onclick = async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
        try {
          const res = await fetch(`${API_URL}/admin/productos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + jwt }
          });
          if (!res.ok) throw new Error('Error al eliminar producto');
          await cargarProductos();
          if (typeof cargarProductosTabla === 'function') await cargarProductosTabla();
          alert('Producto eliminado exitosamente');
        } catch (err) {
          alert('Error al eliminar producto: ' + (err.message || ''));
        }
      };
    }
    // Lógica para previsualizar nuevas imágenes
    let nuevasImagenes = [];
    const inputNuevas = card.querySelector('.input-nuevas-imagenes');
    const previewNuevas = card.querySelector('.preview-nuevas-imagenes');
    inputNuevas.onchange = function(e) {
      nuevasImagenes = [...e.target.files];
      previewNuevas.innerHTML = '';
      nuevasImagenes.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = ev => {
          const div = document.createElement('div');
          div.className = 'relative group';
          div.innerHTML = `<img src='${ev.target.result}' class='h-16 w-16 object-cover rounded border border-brandy-200 dark:border-brandy-700'><button type='button' class='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-80 hover:opacity-100 transition eliminar-nueva-img-admin' data-idx='${idx}' title='Eliminar'>&times;</button>`;
          previewNuevas.appendChild(div);
          div.querySelector('button').onclick = () => {
            nuevasImagenes.splice(idx, 1);
            div.remove();
          };
        };
        reader.readAsDataURL(file);
      });
    };
    // Guardar cambios (enviar nuevas imágenes y las URLs a eliminar)
    card.querySelector('[data-accion="guardar"]').onclick = async () => {
      const feedback = card.querySelector(`#feedback-${id}`);
      feedback.textContent = 'Guardando...';
      feedback.className = 'text-brandy-700 dark:text-brandy-200 animate-pulse';
      // Obtener datos actualizados del producto
      const nombre = card.querySelector(`#nombre-${id}`).value.trim();
      const descripcion = card.querySelector(`#descripcion-${id}`).value.trim();
      const precio = parseFloat(card.querySelector(`#precio-${id}`).value);
      const stock = parseInt(card.querySelector(`#stock-${id}`).value);
      const materiales = card.querySelector(`#materiales-${id}`).value.trim();
      const categoriaId = card.querySelector(`#categoria-${id}`).value;
      if (!nombre || !descripcion || isNaN(precio) || isNaN(stock) || !categoriaId) {
        feedback.textContent = 'Completa todos los campos obligatorios.';
        feedback.className = 'text-red-600 dark:text-red-400';
        return;
      }
      try {
        const formData = new FormData();
        formData.append('producto', JSON.stringify({ nombre, descripcion, precio, stock, materiales }));
        formData.append('categoriaId', categoriaId);
        nuevasImagenes.forEach(img => formData.append('imagenes', img));
        imagenesAEliminar.forEach(url => formData.append('imagenesAEliminar', url));
        const res = await fetch(`${API_URL}/admin/productos/${id}`, {
          method: 'PUT',
          headers: { 'Authorization': 'Bearer ' + jwt },
          body: formData
        });
        if (!res.ok) {
          let errorMsg = 'Error al guardar cambios';
          try {
            const errorText = await res.text();
            if (errorText) errorMsg = errorText;
          } catch {}
          throw new Error(errorMsg);
        }
        feedback.textContent = '¡Producto actualizado!';
        feedback.className = 'text-green-600 dark:text-green-400 animate-bounce';
        // Limpiar arrays y recargar productos
        nuevasImagenes = [];
        imagenesAEliminar = [];
        await cargarProductos();
        if (typeof cargarProductosTabla === 'function') await cargarProductosTabla();
        // --- Actualizar carrito si el producto editado está en el carrito ---
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        let modificado = false;
        carrito = carrito.map(item => {
          if (item.id == id) {
            modificado = true;
            return {
              ...item,
              nombre,
              precio,
              stock,
              imagen: (nuevasImagenes.length > 0 ? '' : item.imagen) // Si hay nuevas imágenes, se actualizará al recargar
            };
          }
          return item;
        });
        if (modificado) {
          localStorage.setItem('carrito', JSON.stringify(carrito));
          if (typeof actualizarContadorCarrito === 'function') actualizarContadorCarrito();
        }
        setTimeout(() => { feedback.textContent = ''; }, 2000);
      } catch (err) {
        feedback.textContent = err.message || 'Error al guardar cambios';
        feedback.className = 'text-red-600 dark:text-red-400';
      }
    };
    // ... existing code ...
  }
  // ... existing code ...

  // --- 5. Gestión de categorías ---
  const categoriaForm = document.getElementById('categoria-form');
  const nombreCategoriaInput = document.getElementById('nombre-categoria');
  const categoriaFormMsg = document.getElementById('categoria-form-msg');

  categoriaForm.addEventListener('submit', async e => {
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
      
      // Recargar categorías
      await cargarCategorias();
      await cargarCategoriasAdmin();
      
      } catch (err) {
        categoriaFormMsg.textContent = err.message || 'Error al crear categoría';
        categoriaFormMsg.className = 'text-red-600 dark:text-red-400';
      }
    });

  async function cargarCategoriasAdmin() {
    try {
      const res = await fetch(`${API_URL}/categorias`);
      if (!res.ok) throw new Error('Error al cargar categorías');
      const categorias = await res.json();
      
      categoriasContainer.innerHTML = categorias.map(cat => `
        <div class="bg-brandy-50 dark:bg-brandy-800 rounded-lg p-4 border border-brandy-200 dark:border-brandy-700">
          <div class="flex justify-between items-center">
            <h4 class="font-semibold text-brandy-700 dark:text-brandy-100">${cat.nombre}</h4>
            <div class="flex gap-2">
              <button class="text-brandy-500 hover:text-brandy-700 dark:text-brandy-400 dark:hover:text-brandy-200 transition editar-categoria" data-id="${cat.id}" data-nombre="${cat.nombre}">
                ✏️
              </button>
              <button class="text-red-500 hover:text-red-700 transition eliminar-categoria" data-id="${cat.id}">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `).join('');
      
      // Eventos para editar y eliminar categorías
      categoriasContainer.querySelectorAll('.editar-categoria').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.id;
          const nombre = btn.dataset.nombre;
          document.getElementById('categoria-id-editar').value = id;
          document.getElementById('categoria-nombre-editar').value = nombre;
          modalEditarCategoria.classList.remove('hidden');
        };
      });
      
      categoriasContainer.querySelectorAll('.eliminar-categoria').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          if (!confirm('¿Eliminar esta categoría?')) return;
          
          try {
            const res = await fetch(`${API_URL}/categorias/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': 'Bearer ' + jwt }
            });
            
            if (!res.ok) throw new Error('Error al eliminar categoría');
            
            await cargarCategoriasAdmin();
            await cargarCategorias();
            
          } catch (err) {
            alert('Error al eliminar categoría: ' + err.message);
          }
        };
      });
      
    } catch (err) {
      categoriasContainer.innerHTML = '<div class="text-red-600 dark:text-red-400">Error al cargar categorías</div>';
    }
  }

  // --- 6. Vista de tabla ---
  async function cargarProductosTabla() {
    if (!tablaProductos) return;
    
    try {
      const res = await fetch(`${API_URL}/admin/productos`, {
        headers: { 'Authorization': 'Bearer ' + jwt }
      });
      if (!res.ok) throw new Error('Error al cargar productos');
      const productos = await res.json();
      
      tablaProductos.innerHTML = productos.map(p => {
        const img = (p.imagenes && p.imagenes.length > 0) ? p.imagenes[0].url : 'img/no-image.png';
        const estado = p.activo ? 
          '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Activo</span>' : 
          '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Inactivo</span>';
        
        return `
          <tr class="hover:bg-brandy-50 dark:hover:bg-brandy-700">
            <td class="px-6 py-4 whitespace-nowrap">
              <img src="${img}" alt="${p.nombre}" class="h-12 w-12 object-cover rounded">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-brandy-700 dark:text-brandy-100">${p.nombre}</div>
              <div class="text-sm text-brandy-500 dark:text-brandy-300">${p.descripcion.substring(0, 50)}${p.descripcion.length > 50 ? '...' : ''}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-brandy-700 dark:text-brandy-100">${p.categoria ? p.categoria.nombre : 'Sin categoría'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm font-semibold text-brandy-700 dark:text-brandy-100">${formatoCOP(p.precio)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-brandy-700 dark:text-brandy-100">${p.stock}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              ${estado}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex gap-2">
                <button onclick="editarProductoDesdeTabla(${p.id})" 
                        class="text-brandy-600 dark:text-brandy-400 hover:text-brandy-900 dark:hover:text-brandy-100">
                  ✏️ Editar
                </button>
                <button onclick="eliminarProductoDesdeTabla(${p.id})" 
                        class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-100">
                  🗑️ Eliminar
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      tablaProductos.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-red-600 dark:text-red-400">Error al cargar productos</td></tr>';
    }
  }

  // Funciones globales para acciones desde tabla
  window.editarProductoDesdeTabla = function(id) {
    vistaTarjetasBtn.click();
    setTimeout(() => {
      const productoCard = document.getElementById(`prod-${id}`);
      if (productoCard) {
        productoCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        productoCard.style.border = '2px solid #8B4513';
        setTimeout(() => {
          productoCard.style.border = '';
        }, 3000);
      }
    }, 100);
  };

  window.eliminarProductoDesdeTabla = async function(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/admin/productos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + jwt }
      });
      
      if (!res.ok) throw new Error('Error al eliminar producto');
      
      alert('Producto eliminado exitosamente');
      cargarProductosTabla();
      cargarProductos();
    } catch (err) {
      alert('Error al eliminar producto: ' + err.message);
    }
  };

  // --- 7. Inicialización del panel admin ---
  async function inicializarPanelAdmin() {
    await cargarCategorias();
    await cargarProductos();
    await cargarCategoriasAdmin();
  }

  // --- 8. Eventos de vista (tarjetas/tabla) ---
  vistaTarjetasBtn.addEventListener('click', () => {
    vistaTarjetasBtn.className = 'px-4 py-2 rounded-lg bg-brandy-500 text-white hover:bg-brandy-600 transition font-semibold';
    vistaTablaBtn.className = 'px-4 py-2 rounded-lg bg-brandy-200 dark:bg-brandy-700 text-brandy-700 dark:text-brandy-100 hover:bg-brandy-300 dark:hover:bg-brandy-800 transition font-semibold';
    vistaTarjetasContainer.classList.remove('hidden');
    vistaTablaContainer.classList.add('hidden');
  });

  vistaTablaBtn.addEventListener('click', async () => {
    vistaTablaBtn.className = 'px-4 py-2 rounded-lg bg-brandy-500 text-white hover:bg-brandy-600 transition font-semibold';
    vistaTarjetasBtn.className = 'px-4 py-2 rounded-lg bg-brandy-200 dark:bg-brandy-700 text-brandy-700 dark:text-brandy-100 hover:bg-brandy-300 dark:hover:bg-brandy-800 transition font-semibold';
    vistaTarjetasContainer.classList.add('hidden');
    vistaTablaContainer.classList.remove('hidden');
    await cargarProductosTabla();
  });

  // --- 9. Modal de editar categoría ---
  formEditarCategoria.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('categoria-id-editar').value;
    const nombre = document.getElementById('categoria-nombre-editar').value;
    
    try {
      const res = await fetch(`${API_URL}/categorias/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': 'Bearer ' + jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre })
      });
      
      if (!res.ok) throw new Error('Error al editar categoría');
      
      modalEditarCategoria.classList.add('hidden');
      await cargarCategoriasAdmin();
      await cargarCategorias();
      
    } catch (err) {
      alert('Error al editar categoría: ' + err.message);
    }
  });

  cancelarEditarCategoria.addEventListener('click', () => {
    modalEditarCategoria.classList.add('hidden');
  });

  // Cerrar modal al hacer clic fuera
  modalEditarCategoria.addEventListener('click', (e) => {
    if (e.target === modalEditarCategoria) {
      modalEditarCategoria.classList.add('hidden');
    }
  });

  // Ejecutar inicialización cuando se carga la página
  inicializarPanelAdmin();
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

window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    preloader.style.pointerEvents = 'none';
    setTimeout(() => preloader.style.display = 'none', 500);
  }
});

// Variables globales para el usuario y carrito
let usuarioActual = null;
let carritoKey = null;
let carrito = [];

// Función para cargar el usuario y el carrito al iniciar sesión
function cargarUsuarioYCarrito() {
  const jwt = localStorage.getItem('jwt');
  if (!jwt) return;
  fetch('/api/auth/me', {
    headers: { 'Authorization': 'Bearer ' + jwt }
  })
    .then(res => res.ok ? res.json() : null)
    .then(user => {
      if (user && user.id) {
        usuarioActual = user;
        carritoKey = `carrito_${user.id}`;
        const guardado = localStorage.getItem(carritoKey);
        carrito = guardado ? JSON.parse(guardado) : [];
        renderizarCarrito();
        actualizarContadorCarrito();
      }
    });
}

// Guardar carrito por usuario
function guardarCarrito() {
  if (carritoKey) {
    localStorage.setItem(carritoKey, JSON.stringify(carrito));
  }
}

// Renderizar carrito leyendo siempre del localStorage
function renderizarCarrito() {
  if (!carritoKey) return;
  const guardado = localStorage.getItem(carritoKey);
  carrito = guardado ? JSON.parse(guardado) : [];
  // ... (resto del renderizado del carrito)
}

// Al agregar/quitar productos, usar guardarCarrito()
// ... (en las funciones correspondientes)

// Cerrar slide del carrito solo oculta el panel
function cerrarCarritoSlide() {
  const carritoSlide = document.getElementById('carrito-slide');
  if (carritoSlide) {
    carritoSlide.classList.add('translate-x-full');
  }
}

// Al iniciar sesión, cargar usuario y carrito
window.addEventListener('DOMContentLoaded', cargarUsuarioYCarrito);

// Formateador de moneda COP
function formatoCOP(valor) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
}

// Mensaje en carrito si no hay sesión
function mostrarMensajeLoginCarrito() {
  const carritoItems = document.getElementById('carrito-items');
  if (!carritoItems) return;
  carritoItems.innerHTML = `<div class='text-center text-brandy-700 dark:text-brandy-100 p-6'>
    Para poder agregar productos al carrito debes <b id='ir-login' class='cursor-pointer underline'>iniciar sesión</b> o <b id='ir-registro' class='cursor-pointer underline'>registrarte</b>.
  </div>`;
  document.getElementById('ir-login').onclick = () => { window.location.href = 'cuenta.html'; };
  document.getElementById('ir-registro').onclick = () => { window.location.href = 'cuenta.html#register'; };
}

window.usuarioLogueado = false;
document.addEventListener('DOMContentLoaded', function () {
  // ... existing code ...
  if (!jwt) {
    window.usuarioLogueado = false;
    // ... existing code ...
    return;
  }
  fetch('/api/auth/me', {
    headers: { 'Authorization': 'Bearer ' + jwt }
  })
    .then(res => {
      if (!res.ok) {
        window.usuarioLogueado = false;
        // ... existing code ...
        return null;
      }
      return res.json();
    })
    .then(user => {
      if (!user || !user.roles) {
        window.usuarioLogueado = false;
        // ... existing code ...
        return;
      }
      window.usuarioLogueado = true;
      // ... existing code ...
    })
    .catch(err => {
      window.usuarioLogueado = false;
      // ... existing code ...
    });
});
// ... existing code ...

// Solución bug login persistente: actualizar window.usuarioLogueado tras login/registro y al cargar la página
function actualizarEstadoLogin() {
  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
    window.usuarioLogueado = false;
    return;
  }
  fetch('/api/auth/me', {
    headers: { 'Authorization': 'Bearer ' + jwt }
  })
    .then(res => res.ok ? res.json() : null)
    .then(user => {
      window.usuarioLogueado = !!(user && user.roles);
    })
    .catch(() => { window.usuarioLogueado = false; });
}
actualizarEstadoLogin();
// Tras login/registro exitoso, actualizar estado login antes de recargar
if (showRegister && showLogin && loginForm && registerForm) {
  // ... existing code ...
  loginForm.addEventListener('submit', async (e) => {
    // ... existing code ...
    try {
      const res = await fetch(`${API_URL}/login`, {
        // ... existing code ...
      });
      if (!res.ok) throw new Error('Credenciales incorrectas');
      const data = await res.json();
      localStorage.setItem('jwt', data.token);
      // Obtener userId y migrar carrito
      fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + data.token } })
        .then(res => res.ok ? res.json() : null)
        .then(user => { if (user && user.id) migrarCarritoAlIniciarSesion(user.id); });
      window.usuarioLogueado = true;
      messageDiv.textContent = '¡Inicio de sesión exitoso!';
      messageDiv.className = 'mb-4 text-center text-sm text-green-600 dark:text-green-400';
      setTimeout(() => location.href = 'index.html', 1200);
    } catch (err) {
      // ... existing code ...
    }
  });
  registerForm.addEventListener('submit', async (e) => {
    // ... existing code ...
    try {
      const res = await fetch(`${API_URL}/register`, {
        // ... existing code ...
      });
      if (!res.ok) throw new Error('Error al registrar cuenta');
      const data = await res.json();
      localStorage.setItem('jwt', data.token);
      // Obtener userId y migrar carrito
      fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + data.token } })
        .then(res => res.ok ? res.json() : null)
        .then(user => { if (user && user.id) migrarCarritoAlIniciarSesion(user.id); });
      window.usuarioLogueado = true;
      messageDiv.textContent = '¡Registro exitoso!';
      messageDiv.className = 'mb-4 text-center text-sm text-green-600 dark:text-green-400';
      setTimeout(() => location.href = 'index.html', 1200);
    } catch (err) {
      // ... existing code ...
    }
  });
}
// ... existing code ...

// Migrar carrito de visitante al iniciar sesión
function migrarCarritoAlIniciarSesion(userId) {
  const carritoVisitante = localStorage.getItem('carrito');
  const carritoUsuarioKey = `carrito_${userId}`;
  if (carritoVisitante && !localStorage.getItem(carritoUsuarioKey)) {
    localStorage.setItem(carritoUsuarioKey, carritoVisitante);
    localStorage.removeItem('carrito');
  }
}
