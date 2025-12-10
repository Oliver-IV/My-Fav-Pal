import authService from '../js/services/auth.service.js';

class RegisterView extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        .register-container {
          max-width: 450px;
          margin: 4rem auto;
          animation: fadeIn 0.5s ease-out;
        }

        .register-card {
          background: var(--surface);
          border-radius: var(--border-radius);
          padding: 2.5rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }

        .register-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .register-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .register-header p {
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

      <div class="register-container fade-in">
        <div class="register-card">
          <div class="register-header">
            <h1>🎬 Crear Cuenta</h1>
            <p>Únete a My Fav Pal</p>
          </div>

          <form id="registerForm">
            <div id="errorMessage"></div>
            <div id="successMessage"></div>

            <div class="form-group">
              <label for="displayName">Nombre de Usuario</label>
              <input 
                type="text" 
                id="displayName" 
                name="displayName" 
                placeholder="Tu nombre"
                required
              />
            </div>

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
                minlength="6"
              />
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmar Contraseña</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                placeholder="••••••••"
                required
              />
            </div>

            <div class="form-group">
              <label for="avatarUrl">URL del Avatar (opcional)</label>
              <input 
                type="url" 
                id="avatarUrl" 
                name="avatarUrl" 
                placeholder="https://ejemplo.com/avatar.jpg"
              />
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">
              Crear Cuenta
            </button>
          </form>

          <div class="form-footer">
            ¿Ya tienes cuenta? 
            <a id="loginLink">Inicia sesión aquí</a>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const form = this.querySelector('#registerForm');
    const loginLink = this.querySelector('#loginLink');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleRegister(e);
    });

    loginLink.addEventListener('click', () => {
      window.router.navigate('/login');
    });
  }

  async handleRegister(e) {
    const formData = new FormData(e.target);
    const displayName = formData.get('displayName');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const avatarUrl = formData.get('avatarUrl');

    const errorDiv = this.querySelector('#errorMessage');
    const successDiv = this.querySelector('#successMessage');
    const submitBtn = this.querySelector('button[type="submit"]');

   
    errorDiv.innerHTML = '';
    successDiv.innerHTML = '';


    if (password !== confirmPassword) {
      errorDiv.innerHTML = `
        <div class="error-message">
          Las contraseñas no coinciden
        </div>
      `;
      return;
    }

    try {
  
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creando cuenta...';

      await authService.register(email, password, displayName, avatarUrl);

     
      successDiv.innerHTML = `
        <div class="success-message">
          ¡Cuenta creada exitosamente! Redirigiendo...
        </div>
      `;

     
      setTimeout(() => {
        window.router.navigate('/home');
      }, 1500);
    } catch (error) {
      errorDiv.innerHTML = `
        <div class="error-message">
          ${error.message || 'Error al crear la cuenta. Intenta nuevamente.'}
        </div>
      `;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Crear Cuenta';
    }
  }
}

customElements.define('register-view', RegisterView);
