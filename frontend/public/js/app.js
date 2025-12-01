import authService from './services/auth.service.js';

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    
    // Escuchar cambios en la URL
    window.addEventListener('popstate', () => this.handleRoute());
    
    // Escuchar cambios de autenticación
    window.addEventListener('auth-changed', () => this.handleRoute());
  }

  // Registrar una ruta
  addRoute(path, component) {
    this.routes[path] = component;
  }

  // Navegar a una ruta
  navigate(path) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  // Manejar la ruta actual
  handleRoute() {
    const path = window.location.pathname;
    this.currentRoute = path;

    // Obtener el componente para esta ruta
    let component = this.routes[path];

    // Manejar rutas dinámicas como /media/:id
    if (!component && path.startsWith('/media/')) {
      const mediaId = path.split('/media/')[1];
      const mediaDetailElement = document.createElement('media-detail-view');
      mediaDetailElement.setAttribute('media-id', mediaId);
      component = mediaDetailElement;
    }

    // Si no existe la ruta, usar la página de inicio o 404
    if (!component) {
      component = this.routes['/'] || '<h1>404 - Página no encontrada</h1>';
    }

    // Verificar autenticación para rutas protegidas
    if ((path === '/home' || path.startsWith('/media/')) && !authService.isAuthenticated()) {
      this.navigate('/login');
      return;
    }

    // Si está autenticado y trata de ir a login/register, redirigir a home
    if ((path === '/login' || path === '/register' || path === '/') && authService.isAuthenticated()) {
      this.navigate('/home');
      return;
    }

    // Mostrar/ocultar navbar según autenticación
    this.toggleNavbar();

    // Renderizar el componente
    this.render(component);
  }

  // Mostrar u ocultar el navbar según autenticación
  toggleNavbar() {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      navbar.style.display = authService.isAuthenticated() ? 'block' : 'none';
    }
  }

  // Renderizar el contenido en el div#app
  render(content) {
    const app = document.getElementById('app');
    
    if (typeof content === 'string') {
      app.innerHTML = content;
    } else {
      app.innerHTML = '';
      app.appendChild(content);
    }
  }
}

// Crear instancia del router
const router = new Router();

// Registrar rutas
router.addRoute('/', '<login-view></login-view>');
router.addRoute('/login', '<login-view></login-view>');
router.addRoute('/register', '<register-view></register-view>');
router.addRoute('/home', '<home-view></home-view>');

// Exponer el router globalmente
window.router = router;

// Manejar la ruta inicial cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  router.handleRoute();
});

export default router;
