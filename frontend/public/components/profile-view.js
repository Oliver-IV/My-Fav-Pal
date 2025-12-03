import authService from '../js/services/auth.service.js';
import ReviewService from '../js/services/review.service.js';

const reviewService = new ReviewService();

class ProfileView extends HTMLElement {
    constructor() {
        super();
        this.user = this.getInitialUserData();
        this.isLoading = true;
        this.favoriteMedia = []; 
    }

    connectedCallback() {
        this.fetchProfileDataFromAPI();
    }

    getInitialUserData() {
        const cachedUser = authService.getUser();

        const mockData = {
            displayName: 'Cargando...',
            avatarUrl: 'default-avatar.png',
            stats: { total: 0, enProgreso: 0, completadas: 0, compradas: 0 },
            reviews: [],
            favorites: [],
            watchlist: [],
            city: 'Ciudad Local',
            followers: 0,
            following: 0
        };

        if (cachedUser) {
            return { ...mockData, ...cachedUser };
        }
        return mockData;
    }

    async fetchProfileDataFromAPI() {
        this.isLoading = true;
        this.render();

        try {
            await authService.getProfile();

            const updatedApiUser = authService.getUser();

            if (updatedApiUser) {
                this.user = {
                    ...this.user,
                    ...updatedApiUser,
                    favorites: updatedApiUser.favorites || []
                };

                this.processFavorites(this.user.favorites);

                const userIdToFetch = this.user.id || this.user._id;
                if (userIdToFetch) {
                    await this.fetchReviews(userIdToFetch);
                }
            }
        } catch (error) {
            console.error('Error al cargar datos del perfil:', error.message);
            this.user.displayName = 'Error de conexión';
        } finally {
            this.isLoading = false;
            this.render();
            this.attachEventListeners();
        }
    }

    processFavorites(favorites) {
        if (!favorites || !Array.isArray(favorites)) {
            this.favoriteMedia = [];
            return;
        }

        const userWatchlist = this.user.watchlist || [];

        this.favoriteMedia = favorites.map(fav => {
            let title = 'Cargando...';
            let id = fav;
            let poster = 'https://placehold.co/100x150?text=No+Img';

            if (typeof fav === 'object' && fav !== null) {
                id = fav._id || fav.id;
                title = fav.name || fav.title || 'Media';

                const matchInWatchlist = userWatchlist.find(w => w.mediaName === title);

                if (matchInWatchlist && matchInWatchlist.posterUrl) {
                    poster = matchInWatchlist.posterUrl;
                } else if (fav.posterUrl) {
                    poster = fav.posterUrl;
                }
            }
            
            return { id, title, poster };
        });
    }

    async fetchReviews(userId) {
        if (!userId) return;
        try {
            const reviewsResponse = await reviewService.getReviewsByUserId(userId);
            this.user.reviews = reviewsResponse || [];
            this.updateStats(this.user.reviews);
        } catch (error) {
            console.error('Error al cargar reviews:', error);
            this.user.reviews = [];
        }
    }

    updateStats(reviews) {
        if (!reviews) return;
        this.user.stats.total = reviews.length;
        this.user.stats.enProgreso = reviews.filter(r => r.status === 'progress').length;
        this.user.stats.completadas = reviews.filter(r => r.status === 'completed').length;
    }

    renderReview(review) {
        const rating = review.rating || 0;
        const stars = '★'.repeat(Math.min(5, Math.max(0, rating))) + '☆'.repeat(Math.max(0, 5 - rating));
        
        return `
            <div class="review-card">
                <img src="${review.posterUrl || 'https://placehold.co/100'}" alt="${review.title}" onerror="this.src='https://placehold.co/100'">
                <div>
                    <p style="font-weight:bold;">"${review.title || 'Review'}"</p>
                    <p>"${review.body || ''}"</p>
                    <p class="rating">${stars}</p>
                </div>
            </div>
        `;
    }

    render() {
        if (this.isLoading) {
            this.innerHTML = `<div style="text-align: center; padding: 50px; color: white;">Cargando perfil...</div>`;
            return;
        }
        
        if (!this.user || !this.user.email) { 

        }

        this.innerHTML = `
            <style>
                .profile-container { display: grid; grid-template-columns: 220px 1fr 300px; gap: 20px; padding: 20px; color: white; max-width: 1600px; margin: 0 auto; }
                @media (max-width: 1024px) { .profile-container { grid-template-columns: 1fr 300px; } }
                @media (max-width: 768px) { .profile-container { grid-template-columns: 1fr; } }
                
                .column-box { display: flex; flex-direction: column; gap: 20px; }
                
                /* Stats */
                .stats-box { display: flex; flex-direction: column; gap: 12px; }
                .stat-item { border: 1px solid #555; padding: 15px; border-radius: 8px; background-color: #1a1a1a; text-align: center; }
                .stat-number { font-size: 1.5rem; font-weight: bold; color: #a00000; display: block; }

                /* Reviews */
                .reviews-box { display: flex; flex-direction: column; gap: 15px; }
                .review-card { display: flex; gap: 15px; border: 1px solid #555; padding: 15px; border-radius: 10px; background-color: #1e1e1e; }
                .review-card img { width: 80px; height: 120px; object-fit: cover; border-radius: 4px; }
                .rating { color: #ffd700; margin-top: 5px; }

                /* User Profile */
                .user-card { border: 1px solid #555; padding: 20px; border-radius: 10px; text-align: center; background-color: #1a1a1a; position: sticky; top: 20px; }
                .user-img { width: 130px; height: 130px; border-radius: 50%; object-fit: cover; border: 4px solid #a00000; margin-bottom: 10px; }
                .edit-btn { margin-top: 15px; padding: 8px 15px; background: #1a73e8; color: white; border: none; border-radius: 6px; cursor: pointer; width: 100%; transition: background 0.3s;}
                .edit-btn:hover { background: #1557b0; }
                
                /* Favorites */
                .favorites { display: flex; gap: 10px; margin-top: 15px; justify-content: center; flex-wrap: wrap; }
                .favorites img { width: 60px; height: 90px; border-radius: 6px; object-fit: cover; border: 1px solid #444; }
            </style>

            <div class="profile-container">
                <div class="column-box">
                    <h2>Dashboard</h2>
                    <div class="stats-box">
                        <div class="stat-item">Total <span class="stat-number">${this.user.stats.total || 0}</span></div>
                        <div class="stat-item">En progreso <span class="stat-number">${this.user.stats.enProgreso || 0}</span></div>
                        <div class="stat-item">Completadas <span class="stat-number">${this.user.stats.completadas || 0}</span></div>
                        <div class="stat-item">Compradas <span class="stat-number">${this.user.stats.compradas || 0}</span></div>
                    </div>
                </div>

                <div class="column-box">
                    <h2>Tus reviews (${this.user.reviews ? this.user.reviews.length : 0})</h2>
                    <div class="reviews-box">
                        ${this.user.reviews && this.user.reviews.length > 0 
                            ? this.user.reviews.map(r => this.renderReview(r)).join("") 
                            : '<p style="color:#bbb;">Aún no tienes reviews.</p>'}
                    </div>
                </div>

                <div class="column-box">
                    <div class="user-card">
                        <img class="user-img" src="${this.user.avatarUrl}" alt="Avatar" onerror="this.src='https://placehold.co/150'">
                        <h2>${this.user.displayName || "Usuario"}</h2>
                        <p style="color: #ccc; margin: 5px 0;">📍 ${this.user.city || "Ciudad no especificada"}</p>
                        <p style="font-size: 0.9em;">
                            <strong>${this.user.followers || 0}</strong> Followers | <strong>${this.user.following || 0}</strong> Following
                        </p>
                        
                        <button type="button" class="edit-btn" id="editProfileBtn">Editar perfil</button>
                        
                        <hr style="border: 0; border-top: 1px solid #444; margin: 20px 0;">
                        
                        <h3>Favoritos</h3>
                        <div class="favorites">
                            ${this.favoriteMedia.length > 0 
                                ? this.favoriteMedia.map(f => `<img src="${f.poster}" title="${f.title}" onerror="this.src='https://placehold.co/60x90?text=Error'">`).join("")
                                : '<p style="font-size: 0.8em; color: #888;">Sin favoritos.</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const editBtn = this.querySelector("#editProfileBtn");
        if (editBtn) {
            editBtn.addEventListener("click", (e) => {
                e.preventDefault();
                console.log("Navegando a editar perfil...");

                if (window.router) {
                    window.router.navigate("/edit-profile-view");
                } else {
                    window.location.hash = "#/edit-profile-view";
                }
            });
        }
    }
}

customElements.define("profile-view", ProfileView);