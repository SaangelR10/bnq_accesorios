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
        const img = (p.imagenes && p.imagenes.length > 0) ? p.imagenes[0].url.replace('uploads', '') : 'img/no-image.png';
        return `
          <div class="bg-white dark:bg-brandy-800 rounded-lg shadow p-6 flex flex-col items-center">
            <img src="${img}" alt="${p.nombre}" class="h-40 w-40 object-cover rounded mb-4">
            <h2 class="text-xl font-semibold text-brandy-700 dark:text-brandy-100 mb-2">${p.nombre}</h2>
            <p class="text-brandy-600 dark:text-brandy-200 mb-2">${p.descripcion}</p>
            <span class="text-brandy-500 font-bold text-lg mb-4">$${p.precio}</span>
            <button class="bg-brandy-500 text-white px-4 py-2 rounded hover:bg-brandy-600 transition">Agregar al carrito</button>
          </div>
        `;
      }).join('');
    })
    .catch(err => {
      productosMsg.textContent = 'Error al cargar productos.';
      console.error('Error al cargar productos:', err);
    });
}
