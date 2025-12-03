import authService from '../js/services/auth.service.js';

class ProfileView extends HTMLElement {
    constructor() {
        super();
        this.user = this.getInitialUserData(); 
        this.isLoading = true;
    }

    connectedCallback() {
        this.fetchProfileDataFromAPI();
    }

    getInitialUserData() {
        const cachedUser = authService.getUser();
        
        const mockData = {
            displayName: 'Cargando...', 
            avatarUrl: 'default-avatar.png', 
            stats: { 
                total: 3, 
                enProgreso: 1, 
                completadas: 1, 
                compradas: 1 
            }, 
            reviews: [
                { title: "¡Me encantó esta serie local!", rating: 5, poster: 'placeholder.jpg' },
                { title: "Aún la estoy viendo...", rating: 3, poster: 'placeholder.jpg' },
                { title: "La compré, pero no he empezado.", rating: 4, poster: 'placeholder.jpg' }
            ],
            favorites: [{poster: 'placeholder.jpg'}, {poster: 'placeholder.jpg'}, {poster: 'placeholder.jpg'}], 
            city: 'Ciudad Local',
            followers: 42,
            following: 10
        };

        if (cachedUser) {
            return {
                ...mockData, 
                ...cachedUser 
            };
        }
        
        return mockData;
    }

    async fetchProfileDataFromAPI() {
        this.isLoading = true;
        this.render();

        try {
            await authService.getProfile(); 
            
            const updatedApiUser = authService.getUser();

            if (updatedApiUser && updatedApiUser.displayName) {
                this.user.displayName = updatedApiUser.displayName;
                this.user.avatarUrl = updatedApiUser.avatarUrl || this.user.avatarUrl; 
            }
        } catch (error) {
            console.error('Error al cargar datos del perfil:', error.message);
            this.user.displayName = 'Error de Carga (Revisar Login)';
        } finally {
            this.isLoading = false;
            this.render();
            this.attachEventListeners();
        }
    }

    renderReview(review) {
        const ratingStars = '★'.repeat(review.rating || 0) + '☆'.repeat(5 - (review.rating || 0)); 
        return `
            <div class="review-card">
                <img src="${review.poster || 'placeholder.jpg'}" alt="">
                <div>
                    <p>"${review.title}"</p>
                    <p class="rating">${ratingStars}</p>
                </div>
            </div>
        `;
    }

    render() {
        if (this.isLoading) {
            this.innerHTML = `<div style="text-align: center; padding: 50px;">Cargando perfil de ${this.user.displayName}...</div>`;
            return;
        }

        if (!this.user.displayName || this.user.displayName === 'Cargando...') {
            this.innerHTML = `<p class="error-message">Error: Usuario no logueado o token inválido.</p>`;
            return;
        }
        
        this.innerHTML = `
            <style>
                /* Estilos que tenías en el código comentado */
                .profile-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px; color: white; }
                .user-card { border: 1px solid #555; padding: 20px; border-radius: 10px; text-align: center; }
                .user-img { width: 130px; height: 130px; border-radius: 50%; object-fit: cover; border: 4px solid #a00000; }
                .stats-box, .reviews-box { display: flex; flex-direction: column; gap: 12px; }
                .stat-item { border: 1px solid #555; padding: 15px; border-radius: 8px; }
                .favorites { display: flex; gap: 10px; margin-top: 10px; justify-content: center; }
                .favorites img { width: 70px; height: 100px; border-radius: 6px; object-fit: cover; }
                .review-card { display: flex; gap: 15px; border: 1px solid #555; padding: 15px; border-radius: 10px; }
                .edit-btn { margin-top: 15px; padding: 8px 15px; background: #1a73e8; color: white; border: none; border-radius: 6px; cursor: pointer; }
            </style>

            <div class="profile-container">

                <div>
                    <h2>Dashboard (Datos Locales)</h2>
                    <div class="stats-box">
                        <div class="stat-item">Total <br> ${this.user.stats.total}</div>
                        <div class="stat-item">En progreso <br> ${this.user.stats.enProgreso}</div>
                        <div class="stat-item">Completadas <br> ${this.user.stats.completadas}</div>
                        <div class="stat-item">Compradas <br> ${this.user.stats.compradas}</div>
                    </div>

                    <h3 style="margin-top:20px;">Tus reviews</h3>
                    <div class="reviews-box">
                        ${this.user.reviews.length > 0 ? this.user.reviews.map(r => this.renderReview(r)).join("") : '<p>Aún no tienes reviews.</p>'}
                    </div>
                </div>

                <div>
                    <div class="user-card">
                        <img class="user-img" src="${this.user.avatarUrl}" alt="Avatar">
                        <h2>${this.user.displayName || "Usuario"}</h2>
                        
                        <p>📍 ${this.user.city || "N/A"}</p>
                        <p><strong>${this.user.followers || 0}</strong> Followers | 
                        <strong>${this.user.following || 0}</strong> Following</p>

                        <button class="edit-btn" id="editProfileBtn">Editar perfil</button>

                        <h3 style="margin-top:15px;">Favoritos</h3>
                        <div class="favorites">
                            ${this.user.favorites.length > 0 ? this.user.favorites.map(f => `
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
                console.log("Navegar a /edit-profile");
            });
        }
    }
}

customElements.define("profile-view", ProfileView);
