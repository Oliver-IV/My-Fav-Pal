import authService from '../js/services/auth.service.js';

class Navbar extends HTMLElement {
  constructor() {
    super();
    this.user = null;
  }

  connectedCallback() {
    this.user = authService.getUser();
    this.render();
    
    // Escuchar cambios de autenticación
    window.addEventListener('auth-changed', () => {
      this.user = authService.getUser();
      this.render();
    });
  }

  render() {
    this.innerHTML = `
      <style>
        nav {
          background: linear-gradient(135deg, #1e293b, #334155);
          padding: 1rem 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          cursor: pointer;
          user-select: none;
        }

        .nav-links {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .nav-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          background: rgba(99, 102, 241, 0.1);
          color: #a5b4fc;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .nav-btn:hover {
          background: rgba(99, 102, 241, 0.2);
          color: #c7d2fe;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }

        .welcome-text {
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .nav-container {
            flex-direction: column;
            gap: 1rem;
          }

          .nav-links {
            width: 100%;
            justify-content: center;
          }
        }
      </style>

      <nav>
        <div class="nav-container">
          <div class="logo" onclick="window.router.navigate('${this.user ? '/home' : '/login'}')">
            🎬 My Fav Pal
          </div>
          
          <div class="nav-links">
            ${this.user ? this.renderAuthenticatedNav() : this.renderGuestNav()}
          </div>
        </div>
      </nav>
    `;

    this.attachEventListeners();
  }

  renderGuestNav() {
    return `
      <button class="nav-btn" data-action="login">Iniciar Sesión</button>
      <button class="nav-btn" data-action="register">Registrarse</button>
    `;
  }

  renderAuthenticatedNav() {
    const initials = this.user.displayName
      ? this.user.displayName.charAt(0).toUpperCase()
      : this.user.email.charAt(0).toUpperCase();

    return `
      <div class="user-info">
        <span class="welcome-text">Hola, ${this.user.displayName || 'Usuario'}</span>
        ${this.user.avatarUrl 
          ? `<img src="${this.user.avatarUrl}" alt="Avatar" class="avatar" />`
          : `<div class="avatar">${initials}</div>`
        }
        <button class="nav-btn" data-action="logout">Cerrar Sesión</button>
      </div>
    `;
  }

  attachEventListeners() {
    const buttons = this.querySelectorAll('[data-action]');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        
        switch(action) {
          case 'login':
            window.router.navigate('/login');
            break;
          case 'register':
            window.router.navigate('/register');
            break;
          case 'logout':
            authService.logout();
            window.router.navigate('/login');
            break;
        }
      });
    });
  }
}

customElements.define('app-navbar', Navbar);
