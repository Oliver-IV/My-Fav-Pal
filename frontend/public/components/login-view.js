import authService from "../js/services/auth.service.js"

class LoginView extends HTMLElement {
  connectedCallback() {
    this.render()
  }

  render() {
    this.innerHTML = `
      <style>
        .login-page {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          background: #14181C;
          gap: 0;
        }

        .login-marketing {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding: 4rem 3rem;
          color: white;
          background: linear-gradient(135deg, #14181C, #1a1f2e);
        }

        .marketing-logo {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 3rem;
          letter-spacing: 1px;
          color: #e2e8f0;
        }

        .marketing-content h2 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          line-height: 1.2;
          color: white;
        }

        .marketing-content p {
          font-size: 1.1rem;
          color: #cbd5e1;
          margin-bottom: 3rem;
          line-height: 1.6;
          max-width: 400px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .category-card {
          background: rgba(26, 31, 46, 0.8);
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .category-card:hover {
          background: rgba(26, 31, 46, 1);
          border-color: rgba(71, 85, 105, 0.6);
          transform: translateY(-4px);
        }

        .login-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 4rem 3rem;
          background: #14181C;
        }

        .login-container {
          width: 100%;
          max-width: 450px;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .login-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: white;
          font-weight: 700;
        }

        .login-header p {
          color: #cbd5e1;
          font-size: 1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #e2e8f0;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(71, 85, 105, 0.5);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-group input::placeholder {
          color: #64748b;
        }

        .form-group input:focus {
          outline: none;
          background: rgba(30, 41, 59, 0.9);
          border-color: rgba(71, 85, 105, 0.7);
          box-shadow: 0 0 0 3px rgba(71, 85, 105, 0.1);
        }

        .btn-login {
          width: 100%;
          padding: 0.75rem;
          background: #5b5fde;
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .btn-login:hover:not(:disabled) {
          background: #4a4fcf;
          box-shadow: 0 10px 25px rgba(91, 95, 222, 0.3);
        }

        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .form-footer {
          text-align: center;
          margin-top: 1.5rem;
          color: #cbd5e1;
          font-size: 0.95rem;
        }

        .form-footer a {
          color: #5b5fde;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .form-footer a:hover {
          color: #7b7fee;
          text-decoration: underline;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.5);
          color: #fca5a5;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        @media (max-width: 1024px) {
          .login-page {
            grid-template-columns: 1fr;
          }

          .login-marketing {
            padding: 2rem;
            min-height: auto;
          }

          .marketing-content h2 {
            font-size: 2rem;
          }

          .login-section {
            padding: 2rem;
          }
        }

        @media (max-width: 768px) {
          .categories-grid {
            grid-template-columns: 1fr;
          }

          .login-marketing {
            padding: 1.5rem;
          }

          .login-section {
            padding: 1.5rem;
          }
        }
      </style>

      <div class="login-page">
        <div class="login-marketing">
          <div class="marketing-logo">MFP</div>
          <div class="marketing-content">
            <h2>Opina sobre tu contenido favorito</h2>
            <p>Explaya tus opiniones aquí, tu red social para discutir acerca de tus videos, mangas, anime, películas, y mas, favoritos.</p>
            <div class="categories-grid">
              <div class="category-card">Manga & Libros</div>
              <div class="category-card">Videos</div>
              <div class="category-card">Series</div>
              <div class="category-card">Películas</div>
            </div>
          </div>
        </div>

        <div class="login-section">
          <div class="login-container fade-in">
            <div class="login-header">
              <h1>Bienvenido de nuevo</h1>
              <p>Inicia sesión en tu cuenta para seguir puntando tu contenido favorito.</p>
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
              <button type="submit" class="btn-login">Inicia Sesión</button>
            </form>
            <div class="form-footer">
              ¿No tienes una cuenta? <a id="registerLink">Regístrate</a>
            </div>
          </div>
        </div>
      </div>
    `
    this.attachEventListeners()
  }

  attachEventListeners() {
    const form = this.querySelector("#loginForm")
    const registerLink = this.querySelector("#registerLink")

    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      await this.handleLogin(e)
    })

    registerLink.addEventListener("click", () => {
      window.router.navigate("/register")
    })
  }

  async handleLogin(e) {
    const formData = new FormData(e.target)
    const email = formData.get("email")
    const password = formData.get("password")
    const errorDiv = this.querySelector("#errorMessage")
    const submitBtn = this.querySelector('button[type="submit"]')

    try {
      submitBtn.disabled = true
      submitBtn.textContent = "Iniciando sesión..."
      errorDiv.innerHTML = ""

      await authService.login(email, password)
      window.router.navigate("/home")
    } catch (error) {
      errorDiv.innerHTML = `
        <div class="error-message">
          ${error.message || "Error al iniciar sesión. Verifica tus credenciales."}
        </div>
      `
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = "Inicia Sesión"
    }
  }
}

customElements.define("login-view", LoginView)
