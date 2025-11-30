import authService from '../js/services/auth.service.js';

class LoginView extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        .login-container {
          max-width: 450px;
          margin: 4rem auto;
          animation: fadeIn 0.5s ease-out;
        }

        .login-card {
          background: var(--surface);
          border-radius: var(--border-radius);
          padding: 2.5rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-header p {
          color: var(--text-secondary);
        }

        .form-footer {
          text-align: center;
          margin-top: 1.5rem;
          color: var(--text-secondary);
        }

        .form-footer a {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
        }

        .form-footer a:hover {
          text-decoration: underline;
        }
      </style>

      <div class="login-container fade-in">
        <div class="login-card">
          <div class="login-header">
            <h1>🎬 Bienvenido</h1>
            <p>Inicia sesión en tu cuenta</p>
          </div>

          <form id="loginForm">
            <div id="errorMessage"></div>

            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="tu@email.com"
                required
              />
            </div>

            <div class="form-group">
              <label for="password">Contraseña</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">
              Iniciar Sesión
            </button>
          </form>

          <div class="form-footer">
            ¿No tienes cuenta? 
            <a id="registerLink">Regístrate aquí</a>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const form = this.querySelector('#loginForm');
    const registerLink = this.querySelector('#registerLink');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin(e);
    });

    registerLink.addEventListener('click', () => {
      window.router.navigate('/register');
    });
  }

  async handleLogin(e) {
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    const errorDiv = this.querySelector('#errorMessage');
    const submitBtn = this.querySelector('button[type="submit"]');

    try {
      // Deshabilitar botón durante el login
      submitBtn.disabled = true;
      submitBtn.textContent = 'Iniciando sesión...';
      errorDiv.innerHTML = '';

      await authService.login(email, password);

      // Redirigir a home
      window.router.navigate('/home');
    } catch (error) {
      errorDiv.innerHTML = `
        <div class="error-message">
          ${error.message || 'Error al iniciar sesión. Verifica tus credenciales.'}
        </div>
      `;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Iniciar Sesión';
    }
  }
}

customElements.define('login-view', LoginView);
