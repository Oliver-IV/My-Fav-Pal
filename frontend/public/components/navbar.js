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
        :host {
          display: block;
          width: 100%;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        nav {
          background: #14181C;
          padding: 0.75rem 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(71, 85, 105, 0.15);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: auto 1fr auto; /* Logo | Centro | Perfil */
          align-items: center;
          gap: 1rem;
        }

        /* --- LOGO --- */
        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          color: #ffffff;
          cursor: pointer;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
        }

        /* --- NAVEGACIÓN CENTRAL --- */
        .nav-center {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .nav-link {
          appearance: none; /* Quita estilos por defecto del navegador */
          -webkit-appearance: none;
          background: transparent; /* Importante: Fondo transparente */
          border: none; /* Sin bordes */
          padding: 0.5rem 1rem;
          border-radius: 8px;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          height: 40px; /* Altura fija para uniformidad */
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .nav-link.active {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }

        /* --- ICONOS --- */
        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Forzamos el tamaño del SVG para que no se vea gigante */
        .nav-icon svg {
          width: 20px !important;
          height: 20px !important;
          min-width: 20px;
          fill: currentColor;
        }

        /* --- PERFIL / DERECHA --- */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          justify-content: flex-end;
        }

        .user-info {
          position: relative;
          cursor: pointer;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .user-profile:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #374151;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-weight: 600;
          color: white;
          border: 2px solid rgba(255,255,255,0.1);
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

        /* --- DROPDOWN --- */
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: #1A1D21; /* Fondo oscuro sólido */
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          min-width: 200px;
          z-index: 1000;
          overflow: hidden;
          padding: 0.5rem;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #cbd5e1;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          border-radius: 6px;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .dropdown-item.logout:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .dropdown-icon {
          width: 18px;
          height: 18px;
        }

        .nav-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-login {
           background: transparent;
           color: #cbd5e1;
           border: 1px solid rgba(255,255,255,0.1);
        }
        
        .btn-register {
           background: #6366f1;
           color: white;
           border: none;
        }

        /* MOVIL */
        @media (max-width: 768px) {
          .nav-container {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .nav-center {
            order: 2;
            width: 100%;
            justify-content: center;
            border-top: 1px solid rgba(255,255,255,0.05);
            padding-top: 1rem;
          }
          .user-name { display: none; }
        }
      </style>

      <nav>
        <div class="nav-container">
          <div class="logo" onclick="window.router.navigate('${this.user ? "/home" : "/login"}')">
            MFP
          </div>
          
          <div class="nav-center">
            ${this.user ? this.renderCenterNav() : ''}
          </div>
          
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
        <button class="nav-link ${currentPath === '/home' ? 'active' : ''}" data-action="home">
          <span class="nav-icon">
            <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a1.5 1.5 0 01.413 1.001v2.882c0 .59-.448 1.086-1.01 1.144L18 17.5l-.25.044c-.722.124-1.458-.337-1.458-1.077v-3.819c0-.523-.423-.948-.948-.948h-1.5c-.523 0-.948.423-.948.948v3.819c0 .74-.736 1.201-1.458 1.077L8 17.5l-.25-.044c-.562-.058-1.01-.554-1.01-1.144v-2.882a1.5 1.5 0 01.413-1.001l8.69-8.69z" />
            </svg>
          </span>
          Home
        </button>
        <button class="nav-link ${currentPath === '/watchlist' ? 'active' : ''}" data-action="watchlist">
          <span class="nav-icon">
            <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zM21 9.375A.375.375 0 0020.625 9h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zM10.875 18.75a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5zM3.375 15h7.5a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375zm0-3.75h7.5a.375.375 0 00.375-.375v-1.5A.375.375 0 0010.875 9h-7.5A.375.375 0 003 9.375v1.5c0 .207.168.375.375.375z" clip-rule="evenodd" />
            </svg>
          </span>
          Watchlist
        </button>
        <button class="nav-link ${currentPath === '/lists' ? 'active' : ''}" data-action="lists">
          <span class="nav-icon">
            <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.625 3.75a2.625 2.625 0 100 5.25h12.75a2.625 2.625 0 000-5.25H5.625zM3.75 11.25a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H3.75zM3 15.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM3.75 18.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H3.75z" />
            </svg>
          </span>
          My Lists
        </button>
    `
  }

  renderGuestNav() {
    return `
      <button class="nav-btn btn-login" data-action="login">Iniciar Sesión</button>
      <button class="nav-btn btn-register" data-action="register">Registrarse</button>
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
            window.router.navigate("/start")
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
          case "watchlist":
             window.router.navigate("/home")
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