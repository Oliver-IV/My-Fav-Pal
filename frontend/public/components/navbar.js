import authService from "../js/services/auth.service.js"

class Navbar extends HTMLElement {
  constructor() {
    super()
    this.user = null
  }

  connectedCallback() {
    this.user = authService.getUser()
    this.render()

    window.addEventListener("auth-changed", () => {
      this.user = authService.getUser()
      this.render()
    })
  }

  render() {
    this.innerHTML = `
      <style>
        nav {
          background: #14181C;
          padding: 1rem 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(71, 85, 105, 0.2);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: #e2e8f0;
          cursor: pointer;
          user-select: none;
          letter-spacing: 0.5px;
        }

        .nav-links {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .nav-btn {
          padding: 0.6rem 1.2rem;
          border: 1px solid rgba(100, 116, 139, 0.3);
          border-radius: 8px;
          background: rgba(91, 95, 222, 0.1);
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .nav-btn:hover {
          background: rgba(91, 95, 222, 0.2);
          color: #e2e8f0;
          border-color: rgba(91, 95, 222, 0.5);
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
          background: #14181C;
          border: 2px solid #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .welcome-text {
          color: #cbd5e1;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .nav-container {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .nav-links {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }

          .welcome-text {
            display: none;
          }
        }
      </style>

      <nav>
        <div class="nav-container">
          <div class="logo" onclick="window.router.navigate('${this.user ? "/home" : "/login"}')">
            🎬 My Fav Pal
          </div>
          <div class="nav-links">
            ${this.user ? this.renderAuthenticatedNav() : this.renderGuestNav()}
          </div>
        </div>
      </nav>
    `
    this.attachEventListeners()
  }

  renderGuestNav() {
    return `
      <button class="nav-btn" data-action="login">Iniciar Sesión</button>
      <button class="nav-btn" data-action="register">Registrarse</button>
    `
  }

  renderAuthenticatedNav() {
    const initials = this.user.displayName
      ? this.user.displayName.charAt(0).toUpperCase()
      : this.user.email.charAt(0).toUpperCase()

    return `
      <div class="user-info">
        <span class="welcome-text">Hola, ${this.user.displayName || "Usuario"}</span>
        ${
          this.user.avatarUrl
            ? `<img src="${this.user.avatarUrl}" alt="Avatar" class="avatar" />`
            : `<div class="avatar">${initials}</div>`
        }
        <button class="nav-btn" data-action="logout">Cerrar Sesión</button>
      </div>
    `
  }

  attachEventListeners() {
    const buttons = this.querySelectorAll("[data-action]")
    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const action = e.target.dataset.action

        switch (action) {
          case "login":
            window.router.navigate("/login")
            break
          case "register":
            window.router.navigate("/register")
            break
          case "logout":
            authService.logout()
            window.router.navigate("/login")
            break
        }
      })
    })
  }
}

customElements.define("app-navbar", Navbar)
