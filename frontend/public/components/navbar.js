import authService from "../js/services/auth.service.js"

class Navbar extends HTMLElement {
  constructor() {
    super()
    this.user = null
    this.dropdownOpen = false
  }

  connectedCallback() {
    this.user = authService.getUser()
    this.render()

    window.addEventListener("auth-changed", () => {
      this.user = authService.getUser()
      this.render()
    })

    // Cerrar dropdown al hacer click fuera
    document.addEventListener("click", (e) => {
      if (!this.contains(e.target) && this.dropdownOpen) {
        this.dropdownOpen = false
        this.render()
      }
    })
  }

  render() {
    this.innerHTML = `
      <style>
        nav {
          background: #14181C;
          padding: 0.75rem 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(71, 85, 105, 0.15);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 2rem;
        }

        .logo {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          cursor: pointer;
          user-select: none;
          letter-spacing: 1px;
        }

        .nav-center {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          justify-content: center;
        }

        .nav-link {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #e5e7eb;
        }

        .nav-link.active {
          color: #ffffff;
        }

        .nav-icon {
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-icon svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          position: relative;
        }

        .user-info:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: #1f2937;
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          min-width: 200px;
          z-index: 1000;
          overflow: hidden;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #e5e7eb;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .dropdown-item.logout {
          color: #ef4444;
          border-top: 1px solid rgba(71, 85, 105, 0.3);
        }

        .dropdown-item.logout:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .dropdown-icon {
          width: 18px;
          height: 18px;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #2d3748;
          border: 2px solid #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 600;
          font-size: 0.85rem;
          overflow: hidden;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-name {
          color: #e5e7eb;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-btn {
          padding: 0.5rem 1rem;
          border: 1px solid rgba(100, 116, 139, 0.3);
          border-radius: 6px;
          background: rgba(91, 95, 222, 0.1);
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .nav-btn:hover {
          background: rgba(91, 95, 222, 0.2);
          color: #e2e8f0;
          border-color: rgba(91, 95, 222, 0.5);
        }

        @media (max-width: 768px) {
          .nav-container {
            grid-template-columns: 1fr;
            gap: 1rem;
            text-align: center;
          }

          .nav-center {
            order: 2;
          }

          .user-name {
            display: none;
          }
        }
      </style>

      <nav>
        <div class="nav-container">
          <div class="logo" onclick="window.router.navigate('${this.user ? "/home" : "/login"}')">
            MFP
          </div>
          
          ${this.user ? this.renderCenterNav() : ''}
          
          <div class="nav-right">
            ${this.user ? this.renderAuthenticatedNav() : this.renderGuestNav()}
          </div>
        </div>
      </nav>
    `
    this.attachEventListeners()
  }

  renderCenterNav() {
    const currentPath = window.location.pathname
    return `
      <div class="nav-center">
        <button class="nav-link ${currentPath === '/home' ? 'active' : ''}" data-action="home">
          <span class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zM21 9.375A.375.375 0 0020.625 9h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zM10.875 18.75a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5zM3.375 15h7.5a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375zm0-3.75h7.5a.375.375 0 00.375-.375v-1.5A.375.375 0 0010.875 9h-7.5A.375.375 0 003 9.375v1.5c0 .207.168.375.375.375z" clip-rule="evenodd" />
            </svg>
          </span>
          Watchlist
        </button>
        <button class="nav-link ${currentPath === '/lists' ? 'active' : ''}" data-action="lists">
          <span class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.625 3.75a2.625 2.625 0 100 5.25h12.75a2.625 2.625 0 000-5.25H5.625zM3.75 11.25a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H3.75zM3 15.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM3.75 18.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H3.75z" />
            </svg>
          </span>
          My Lists
        </button>
      </div>
    `
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
      <div class="user-info" data-action="toggle-dropdown">
        <div class="user-profile">
          ${
            this.user.avatarUrl
              ? `<div class="avatar"><img src="${this.user.avatarUrl}" alt="Avatar" /></div>`
              : `<div class="avatar">${initials}</div>`
          }
          <span class="user-name">${this.user.displayName || this.user.email.split('@')[0]}</span>
        </div>
        ${this.dropdownOpen ? this.renderDropdown() : ''}
      </div>
    `
  }

  renderDropdown() {
    return `
      <div class="dropdown-menu">
        <button class="dropdown-item" data-action="profile">
          <svg class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
          </svg>
          Perfil
        </button>
        <button class="dropdown-item logout" data-action="logout">
          <svg class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clip-rule="evenodd" />
          </svg>
          Cerrar Sesión
        </button>
      </div>
    `
  }

  attachEventListeners() {
    const buttons = this.querySelectorAll("[data-action]")
    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation()
        const action = e.target.closest('[data-action]').dataset.action

        switch (action) {
          case "home":
            window.router.navigate("/home")
            break
          case "lists":
            window.router.navigate("/lists")
            break
          case "login":
            window.router.navigate("/login")
            break
          case "register":
            window.router.navigate("/register")
            break
          case "toggle-dropdown":
            this.dropdownOpen = !this.dropdownOpen
            this.render()
            break
          case "profile":
            this.dropdownOpen = false
            window.router.navigate("/profile")
            break
          case "logout":
            this.dropdownOpen = false
            authService.logout()
            window.router.navigate("/login")
            break
        }
      })
    })
  }
}

customElements.define("app-navbar", Navbar)
