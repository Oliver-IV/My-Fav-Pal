import authService from '../js/services/auth.service.js';

class HomeView extends HTMLElement {
  constructor() {
    super();
    this.user = null;
  }

  async connectedCallback() {
    await this.loadUserData();
    this.render();
  }

  async loadUserData() {
    try {
      const response = await authService.getProfile();
      this.user = response.data;
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      this.user = authService.getUser();
    }
  }

  render() {
    if (!this.user) {
      this.innerHTML = '<div class="loading">Cargando perfil...</div>';
      return;
    }

    const initials = this.user.displayName
      ? this.user.displayName.charAt(0).toUpperCase()
      : this.user.email.charAt(0).toUpperCase();

    this.innerHTML = `
      <style>
        .home-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          animation: fadeIn 0.5s ease-out;
        }

        .welcome-section {
          background: linear-gradient(135deg, var(--surface), var(--surface-light));
          border-radius: var(--border-radius);
          padding: 3rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          text-align: center;
        }

        .welcome-section h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .user-avatar-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: white;
          font-weight: bold;
        }

        .user-info-section {
          background: var(--surface);
          border-radius: var(--border-radius);
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .user-info-section h2 {
          margin-bottom: 1.5rem;
          color: var(--text-primary);
          font-size: 1.5rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .info-item {
          background: var(--background);
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid var(--primary-color);
        }

        .info-item label {
          display: block;
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-item p {
          color: var(--text-primary);
          font-size: 1.1rem;
          word-break: break-word;
        }

        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          padding: 2rem;
          border-radius: var(--border-radius);
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .stat-card h3 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .stat-card p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
        }

        .coming-soon {
          background: var(--surface);
          border-radius: var(--border-radius);
          padding: 3rem;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .coming-soon h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: var(--text-secondary);
        }

        .coming-soon p {
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .welcome-section {
            padding: 2rem 1rem;
          }

          .welcome-section h1 {
            font-size: 1.8rem;
          }
        }
      </style>

      <div class="home-container">
        <div class="welcome-section">
          ${this.user.avatarUrl 
            ? `<img src="${this.user.avatarUrl}" alt="Avatar" class="user-avatar-large" />`
            : `<div class="user-avatar-large">${initials}</div>`
          }
          <h1>¡Bienvenido, ${this.user.displayName || 'Usuario'}! 🎉</h1>
          <p style="color: var(--text-secondary); font-size: 1.1rem;">
            Tu espacio personal para gestionar tus series y películas favoritas
          </p>
        </div>

        <div class="stats-section">
          <div class="stat-card">
            <h3>${this.user.watchlist?.length || 0}</h3>
            <p>En tu Watchlist</p>
          </div>
          <div class="stat-card">
            <h3>${this.user.waitlist?.length || 0}</h3>
            <p>En tu Waitlist</p>
          </div>
          <div class="stat-card">
            <h3>${this.user.lists?.length || 0}</h3>
            <p>Listas Creadas</p>
          </div>
        </div>

        <div class="user-info-section">
          <h2>📋 Información de tu Cuenta</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Nombre de Usuario</label>
              <p>${this.user.displayName || 'No especificado'}</p>
            </div>
            <div class="info-item">
              <label>Email</label>
              <p>${this.user.email}</p>
            </div>
            <div class="info-item">
              <label>Miembro desde</label>
              <p>${new Date(this.user.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>
            <div class="info-item">
              <label>ID de Usuario</label>
              <p style="font-size: 0.9rem; font-family: monospace;">${this.user.id}</p>
            </div>
          </div>
        </div>

        <div class="coming-soon">
          <h3>🚀 Próximamente</h3>
          <p>Gestión de watchlist, listas personalizadas, reseñas y mucho más...</p>
        </div>
      </div>
    `;
  }
}

customElements.define('home-view', HomeView);
