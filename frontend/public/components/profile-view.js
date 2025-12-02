class ProfileView extends HTMLElement {
  constructor() {
    super();
    this.user = null;
    this.reviews = [];
    this.favorites = [];
    this.stats = {
      total: 0,
      inProgress: 0,
      completed: 0,
      purchased: 0
    };
  }

  connectedCallback() {
    this.render();
    this.loadData();
  }

  async loadData() {
    try {
      const userRes = await fetch('/api/user/profile');
      this.user = await userRes.json();

      const reviewsRes = await fetch('/api/user/reviews');
      this.reviews = await reviewsRes.json();

      const favoritesRes = await fetch('/api/user/favorites');
      this.favorites = await favoritesRes.json();

      // Stats basadas en reviews
      this.stats.total = this.reviews.length;
      this.stats.inProgress = this.reviews.filter(r => r.status === 'progress').length;
      this.stats.completed = this.reviews.filter(r => r.status === 'completed').length;
      this.stats.purchased = this.reviews.filter(r => r.status === 'purchased').length;

      this.render();
      this.attachEventListeners();

    } catch (err) {
      console.error("Error loading profile:", err);
    }
  }

  render() {
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

        <!-- STATS -->
        <div>
          <h2>Dashboard</h2>
          <div class="stats-box">
            <div class="stat-item">Total <br> ${this.stats.total}</div>
            <div class="stat-item">En progreso <br> ${this.stats.inProgress}</div>
            <div class="stat-item">Completadas <br> ${this.stats.completed}</div>
            <div class="stat-item">Compradas <br> ${this.stats.purchased}</div>
          </div>

          <!-- Reviews -->
          <h3 style="margin-top:20px;">Tus reviews</h3>
          <div class="reviews-box">
            ${this.reviews.map(r => `
              <div class="review-card">
                <img src="${r.poster}" alt="">
                <div>
                  <p>“${r.comment}”</p>
                  <p>${"★".repeat(r.rating)}</p>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- USER CARD -->
        <div>
          <div class="user-card">
            <img class="user-img" src="${this.user?.photo || "default.jpg"}">

            <h2>${this.user?.name || ""}</h2>
            <p>📍 ${this.user?.city || ""}</p>

            <p><strong>${this.user?.followers || 0}</strong> Followers | 
            <strong>${this.user?.following || 0}</strong> Following</p>

            <button class="edit-btn" id="editProfileBtn">Editar perfil</button>

            <h3 style="margin-top:15px;">Favoritos</h3>
            <div class="favorites">
              ${this.favorites.map(f => `
                <img src="${f.poster}">
              `).join("")}
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
