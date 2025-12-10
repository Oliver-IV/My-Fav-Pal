import authService from './services/auth.service.js';

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    
    window.addEventListener('popstate', () => this.handleRoute());
    
    window.addEventListener('auth-changed', () => this.handleRoute());
  }

  addRoute(path, component) {
    this.routes[path] = component;
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  handleRoute() {
    const path = window.location.pathname;
    this.currentRoute = path;

    let component = this.routes[path];

    if (!component && path.startsWith('/media/')) {
      const mediaId = path.split('/media/')[1];
      const mediaDetailElement = document.createElement('media-detail-view');
      mediaDetailElement.setAttribute('media-id', mediaId);
      component = mediaDetailElement;
    }

    if (!component) {
      component = this.routes['/'] || '<h1>404 - Página no encontrada</h1>';
    }

    if ((path === '/home' || path.startsWith('/media/') || path.startsWith('/lists')) && !authService.isAuthenticated()) {
      this.navigate('/login');
      return;
    }

    if ((path === '/login' || path === '/register' || path === '/') && authService.isAuthenticated()) {
      this.navigate('/home');
      return;
    }

    this.toggleNavbar();

    this.render(component);
  }

  toggleNavbar() {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      navbar.style.display = authService.isAuthenticated() ? 'block' : 'none';
    }
  }

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

const router = new Router();

router.addRoute('/', '<login-view></login-view>');
router.addRoute('/login', '<login-view></login-view>');
router.addRoute('/register', '<register-view></register-view>');
router.addRoute('/start', '<start-view></start-view>');
router.addRoute('/home', '<home-view></home-view>');
router.addRoute('/media/:id', (id) => `<media-detail-view media-id="${id}"></media-detail-view>`)
router.addRoute('/lists', '<lists-view></lists-view>');
router.addRoute('/profile', '<profile-view></profile-view>');
router.addRoute('/edit-profile-view', '<edit-profile-view></edit-profile-view>');

window.router = router;

document.addEventListener('DOMContentLoaded', () => {
  router.handleRoute();
});

export default router;
