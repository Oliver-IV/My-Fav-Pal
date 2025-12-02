class ProfileView extends HTMLElement {
  constructor() {
    super();
    
    // 🎯 DATOS LOCALES DUROS PARA TESTEO
    this.user = {
      id: "local_id_123",
      email: "local@test.com",
      displayName: "Oliver Local Tester",
      avatarUrl: "https://i.pravatar.cc/150?img=1", 
      city: "Ciudad Local",
      followers: 42,
      following: 10,
    };
    
    this.reviews = [
      { poster: "https://via.placeholder.com/70x100?text=Review+1", comment: "¡Me encantó esta serie local!", rating: 5, status: 'completed' },
      { poster: "https://via.placeholder.com/70x100?text=Review+2", comment: "Aún la estoy viendo...", rating: 3, status: 'progress' },
      { poster: "https://via.placeholder.com/70x100?text=Review+3", comment: "La compré, pero no he empezado.", rating: 4, status: 'purchased' },
    ];
    
    this.favorites = [
      { poster: "https://via.placeholder.com/70x100?text=Fav+1" },
      { poster: "https://via.placeholder.com/70x100?text=Fav+2" },
      { poster: "https://via.placeholder.com/70x100?text=Fav+3" },
      { poster: "https://via.placeholder.com/70x100?text=Fav+4" },
    ];

    this.stats = {
      total: this.reviews.length,
      inProgress: this.reviews.filter(r => r.status === 'progress').length,
      completed: this.reviews.filter(r => r.status === 'completed').length,
      purchased: this.reviews.filter(r => r.status === 'purchased').length
    };
    
    this.isLoading = false; // Ya no necesitamos carga asíncrona

    console.log("✅ ProfileView (Modo Local) cargado en constructor.");
  }

  connectedCallback() {
    // 🎯 Se llama a render inmediatamente con los datos locales
    this.render(); 
    this.attachEventListeners();
    console.log("✅ ProfileView (Modo Local) renderizado y listo.");
  }

  // Se eliminó la función loadData()

  render() {
    // Ya no se necesita el bloque isLoading
    
    this.innerHTML = `
      <style>
        .profile-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 20px;
          color: white;
        }

        .stats-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stat-item {
          border: 1px solid #555;
          padding: 15px;
          border-radius: 8px;
          font-size: 1.1rem;
        }

        .reviews-box {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .review-card {
          display: flex;
          gap: 15px;
          border: 1px solid #555;
          padding: 15px;
          border-radius: 10px;
        }

        .review-card img {
          width: 70px;
          height: 100px;
          object-fit: cover;
          border-radius: 6px;
        }

        .user-card {
          border: 1px solid #555;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
        }

        .user-img {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #a00000;
        }

        .favorites {
          display: flex;
          gap: 10px;
          margin-top: 10px;
          flex-wrap: wrap; 
          justify-content: center;
        }

        .favorites img {
          width: 70px;
          height: 100px;
          border-radius: 6px;
          object-fit: cover;
        }

        .edit-btn {
          margin-top: 15px;
          padding: 8px 15px;
          background: #1a73e8;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      </style>

      <div class="profile-container">

        <div>
          <h2>Dashboard (Datos Locales)</h2>
          <div class="stats-box">
            <div class="stat-item">Total <br> ${this.stats.total}</div>
            <div class="stat-item">En progreso <br> ${this.stats.inProgress}</div>
            <div class="stat-item">Completadas <br> ${this.stats.completed}</div>
            <div class="stat-item">Compradas <br> ${this.stats.purchased}</div>
          </div>

          <h3 style="margin-top:20px;">Tus reviews</h3>
          <div class="reviews-box">
            ${this.reviews.length > 0 ? this.reviews.map(r => `
              <div class="review-card">
                <img src="${r.poster || 'placeholder.jpg'}" alt="">
                <div>
                  <p>“${r.comment}”</p>
                  <p>${"★".repeat(r.rating || 0)}</p>
                </div>
              </div>
            `).join("") : '<p>Aún no tienes reviews.</p>'}
          </div>
        </div>

        <div>
          <div class="user-card">
            <img class="user-img" src="${this.user.avatarUrl || "default.jpg"}">

            <h2>${this.user.displayName || "Usuario Local"}</h2>
            <p>📍 ${this.user.city || "N/A"}</p>

            <p><strong>${this.user.followers || 0}</strong> Followers | 
            <strong>${this.user.following || 0}</strong> Following</p>

            <button class="edit-btn" id="editProfileBtn">Editar perfil</button>

            <h3 style="margin-top:15px;">Favoritos</h3>
            <div class="favorites">
              ${this.favorites.length > 0 ? this.favorites.map(f => `
                <img src="${f.poster || 'placeholder.jpg'}">
              `).join("") : '<p>Aún no tienes favoritos.</p>'}
            </div>
          </div>
        </div>

      </div>
    `;
  }

  attachEventListeners() {
    const editBtn = this.querySelector("#editProfileBtn");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        window.router.navigate("/edit-profile");
      });
    }
  }
}

customElements.define("profile-view", ProfileView);

/*import authService from '../js/services/auth.service.js';

class ProfileView extends HTMLElement {
  constructor() {
    super();
    this.user = null;
    this.reviews = [];
    this.favorites = [];
    this.isLoading = true;
    this.stats = {
      total: 0,
      inProgress: 0,
      completed: 0,
      purchased: 0
    };
  }

  connectedCallback() {
    this.render(); // Renderiza la estructura con el mensaje "Cargando..."
    this.loadData();
  }

  async loadData() {
    this.isLoading = true;

    // 🎯 Paso 1: Comprobar el Token (COMO LO HACE lists-view)
    const token = authService.getToken();
    if (!token) {
        console.error('❌ No se encontró el token de autenticación. Redirigiendo a /login.');
        this.isLoading = false;
        this.renderAuthError();
        // window.location.hash = '/login'; // Descomenta si usas enrutamiento por hash
        window.router.navigate('/login'); // Usa el método de tu router si lo tienes
        return;
    }

    const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
      // 🎯 Paso 2: Obtener datos del usuario (USANDO HEADERS Y TOKEN)
      const authResponse = await authService.getUser(token); // Asume que getUser usa el token para la llamada
      
      if (authResponse && authResponse.data && authResponse.data.length > 0) {
          this.user = authResponse.data[0];
      } else {
          this.user = null; 
      }

      if (this.user) {
        // 🎯 Paso 3: Usar URLs Absolutas (COMO LO HACE lists-view)
        const [reviewsRes, favoritesRes] = await Promise.all([
          fetch('http://localhost:3000/api/user/reviews', { headers: authHeaders }),
          fetch('http://localhost:3000/api/user/favorites', { headers: authHeaders })
        ]);
        
        this.reviews = await reviewsRes.json();
        this.favorites = await favoritesRes.json();

        this.stats.total = this.reviews.length;
        this.stats.inProgress = this.reviews.filter(r => r.status === 'progress').length;
        this.stats.completed = this.reviews.filter(r => r.status === 'completed').length;
        this.stats.purchased = this.reviews.filter(r => r.status === 'purchased').length;
      }
      
      this.isLoading = false;
      this.render();
      this.attachEventListeners();
      console.log("👍 Carga de datos del profile-view finalizada con éxito.");

    } catch (err) {
      this.isLoading = false;
      this.render();
      console.error("❌ Error grave al cargar o procesar el perfil:", err);
    }
  }

  renderAuthError() {
      this.innerHTML = `<div style="text-align:center; padding: 50px; color: white;">Debes iniciar sesión para ver tu perfil. Redirigiendo...</div>`;
  }

  render() {
    // Si isLoading es verdadero, renderizamos el mensaje de carga dentro de la estructura general
    if (this.isLoading) {
      this.innerHTML = `
        <style>
            .loading-container {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 50vh;
                color: white;
                font-size: 1.5rem;
            }
            .profile-container { padding: 20px; color: white; }
        </style>
        <div class="profile-container">
            <div class="loading-container">Cargando perfil...</div>
        </div>
      `;
      return;
    }
    
    // Si no hay usuario después de cargar, mostramos el error
    if (!this.user) {
        this.innerHTML = `<div style="text-align:center; padding: 50px; color: white;">Error: No se pudo cargar la información del perfil.</div>`;
        return;
    }

    // Renderizado final con los datos
    this.innerHTML = `
      <style>
        .profile-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 20px;
          color: white;
        }

        .stats-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stat-item {
          border: 1px solid #555;
          padding: 15px;
          border-radius: 8px;
          font-size: 1.1rem;
        }

        .reviews-box {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .review-card {
          display: flex;
          gap: 15px;
          border: 1px solid #555;
          padding: 15px;
          border-radius: 10px;
        }

        .review-card img {
          width: 70px;
          height: 100px;
          object-fit: cover;
          border-radius: 6px;
        }

        .user-card {
          border: 1px solid #555;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
        }

        .user-img {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #a00000;
        }

        .favorites {
          display: flex;
          gap: 10px;
          margin-top: 10px;
          flex-wrap: wrap; 
          justify-content: center;
        }

        .favorites img {
          width: 70px;
          height: 100px;
          border-radius: 6px;
          object-fit: cover;
        }

        .edit-btn {
          margin-top: 15px;
          padding: 8px 15px;
          background: #1a73e8;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      </style>

      <div class="profile-container">

        <div>
          <h2>Dashboard</h2>
          <div class="stats-box">
            <div class="stat-item">Total <br> ${this.stats.total}</div>
            <div class="stat-item">En progreso <br> ${this.stats.inProgress}</div>
            <div class="stat-item">Completadas <br> ${this.stats.completed}</div>
            <div class="stat-item">Compradas <br> ${this.stats.purchased}</div>
          </div>

          <h3 style="margin-top:20px;">Tus reviews</h3>
          <div class="reviews-box">
            ${this.reviews.length > 0 ? this.reviews.map(r => `
              <div class="review-card">
                <img src="${r.poster || 'placeholder.jpg'}" alt="">
                <div>
                  <p>“${r.comment}”</p>
                  <p>${"★".repeat(r.rating || 0)}</p>
                </div>
              </div>
            `).join("") : '<p>Aún no tienes reviews.</p>'}
          </div>
        </div>

        <div>
          <div class="user-card">
            <img class="user-img" src="${this.user.avatarUrl || "default.jpg"}">

            <h2>${this.user.displayName || "Usuario"}</h2>
            <p>📍 ${this.user.city || "N/A"}</p>

            <p><strong>${this.user.followers || 0}</strong> Followers | 
            <strong>${this.user.following || 0}</strong> Following</p>

            <button class="edit-btn" id="editProfileBtn">Editar perfil</button>

            <h3 style="margin-top:15px;">Favoritos</h3>
            <div class="favorites">
              ${this.favorites.length > 0 ? this.favorites.map(f => `
                <img src="${f.poster || 'placeholder.jpg'}">
              `).join("") : '<p>Aún no tienes favoritos.</p>'}
            </div>
          </div>
        </div>

      </div>
    `;
  }

  attachEventListeners() {
    const editBtn = this.querySelector("#editProfileBtn");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        window.router.navigate("/edit-profile");
      });
    }
  }
}

customElements.define("profile-view", ProfileView);
*/