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

// Renderizado de productos en catalogo.html
if (window.location.pathname.endsWith('catalogo.html')) {
  const productosContainer = document.getElementById('productos-container');
  const productosMsg = document.getElementById('productos-msg');
  productosMsg.textContent = 'Cargando productos...';
  fetch('/api/productos')
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(productos => {
      productosMsg.textContent = '';
      if (!productos || productos.length === 0) {
        productosMsg.textContent = 'No hay productos disponibles.';
        return;
      }
      productosContainer.innerHTML = productos.map(p => {
        const img = (p.imagenes && p.imagenes.length > 0) ? `/imagenes_productos/${p.imagenes[0].url}` : 'img/no-image.png';
        return `
          <div class="bg-white dark:bg-brandy-800 rounded-lg shadow p-6 flex flex-col items-center">
            <img src="${img}" alt="${p.nombre}" class="h-40 w-40 object-cover rounded mb-4">
            <h2 class="text-xl font-semibold text-brandy-700 dark:text-brandy-100 mb-2">${p.nombre}</h2>
            <p class="text-brandy-600 dark:text-brandy-200 mb-2">${p.descripcion}</p>
            <span class="text-brandy-500 font-bold text-lg mb-4">$${p.precio}</span>
            <button class="bg-brandy-500 text-white px-4 py-2 rounded hover:bg-brandy-600 transition">Agregar al carrito</button>
            <a href="producto.html?id=${p.id}" class="mt-2 text-brandy-500 hover:underline text-sm">Ver detalles</a>
          </div>
        `;
      }).join('');
    })
    .catch(err => {
      productosMsg.textContent = 'Error al cargar productos.';
      console.error('Error al cargar productos:', err);
    });
}

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
      const feedback = card.querySelector(`#feedback-${id}`);
      feedback.textContent = 'Guardando...';
      feedback.className = 'text-brandy-700 dark:text-brandy-200 animate-pulse';
      try {
        const res = await fetch(`${API_URL}/admin/productos/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
          },
          body: JSON.stringify({ nombre, descripcion, precio, stock, materiales })
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
            'Authorization': 'Bearer ' + jwt
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
  cargarCategorias();
  cargarProductos();
}
