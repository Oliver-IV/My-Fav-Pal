import authService from "../js/services/auth.service.js"

class LoginView extends HTMLElement {
  connectedCallback() {
    this.render()
  }

  render() {
    this.innerHTML = `
      <div class="login-page">
        <div class="login-marketing">
          <div class="marketing-logo">MFP</div>
          <div class="marketing-content">
            <h2>Opina sobre tu contenido favorito</h2>
            <p>Explaya tus opiniones aquí, tu red social para discutir acerca de tus videos, mangas, anime, películas, y más.</p>
            
            <div class="categories-grid">
              <div class="category-card card-manga">Manga & Libros</div>
              <div class="category-card card-videos">Videos</div>
              <div class="category-card card-series">Series</div>
              <div class="category-card card-movies">Películas</div>
            </div>
            
          </div>
        </div>

        <div class="login-section">
          <div class="login-container fade-in">
            <div class="login-header">
              <h1>Bienvenido de nuevo</h1>
              <p>Inicia sesión en tu cuenta para seguir puntuando tu contenido favorito.</p>
            </div>
            <form id="loginForm">
              <div id="errorMessage"></div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" placeholder="tu@email.com" required />
              </div>
              <div class="form-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" placeholder="••••••••" required />
              </div>
              <button type="submit" class="btn-login">Inicia Sesión</button>
            </form>
            <div class="form-footer">
              ¿No tienes una cuenta? <a id="registerLink">Regístrate</a>
            </div>
          </div>
        </div>
      </div>
    `;
    this.attachEventListeners();
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
