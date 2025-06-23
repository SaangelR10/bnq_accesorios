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
function checkAdminUI() {
  const jwt = localStorage.getItem('jwt');
  const userInfo = document.getElementById('user-info');
  const logoutBtn = document.getElementById('logout-btn');
  if (!jwt) {
    if (userInfo) userInfo.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    document.querySelectorAll('.admin-link').forEach(el => el.classList.add('hidden'));
    return;
  }
  fetch('/api/auth/me', {
    headers: { 'Authorization': 'Bearer ' + jwt }
  })
    .then(res => res.ok ? res.json() : null)
    .then(user => {
      if (!user || !user.roles) return;
      // Mostrar nombre de usuario
      if (userInfo) {
        userInfo.textContent = user.nombre || user.email;
        userInfo.classList.remove('hidden');
      }
      // Mostrar botón logout
      if (logoutBtn) {
        logoutBtn.classList.remove('hidden');
        logoutBtn.onclick = () => {
          localStorage.removeItem('jwt');
          window.location.reload();
        };
      }
      // Mostrar enlace admin si es admin
      document.querySelectorAll('.admin-link').forEach(el => {
        if (user.roles.includes('ADMIN')) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });
      // Proteger admin.html
      if (window.location.pathname.endsWith('admin.html') && !user.roles.includes('ADMIN')) {
        window.location.href = 'index.html';
      }
    });
}
checkAdminUI();
