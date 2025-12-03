import authService from '../js/services/auth.service.js';
import ReviewService from '../js/services/review.service.js';

const reviewService = new ReviewService();

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
                total: 0, 
                enProgreso: 0, 
                completadas: 0, 
                compradas: 0 
            }, 
            reviews: [],
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
            // 1. Obtener datos básicos del usuario logueado
            await authService.getProfile(); 
            
            const updatedApiUser = authService.getUser();
            let userIdToFetch = null;

            if (updatedApiUser && updatedApiUser.displayName) {
                this.user = {
                    ...this.user, 
                    ...updatedApiUser 
                };
                
                // 🚨 CORRECCIÓN: Usar 'id' en lugar de '_id' 🚨
                userIdToFetch = updatedApiUser.id; 
                
                if (userIdToFetch) {
                    // 2. Cargar las reviews usando el ID real
                    await this.fetchReviews(userIdToFetch);
                } else {
                     console.warn('Usuario logueado, pero ID (propiedad "id") no encontrado.');
                }
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
   async fetchReviews(userId) {
        if (!userId) {
            console.warn('Advertencia: ID de usuario no disponible para cargar reviews.');
            return;
        }

        try {
            const reviewsResponse = await reviewService.getReviewsByUserId(userId);
            
            if (reviewsResponse && reviewsResponse.length > 0) { 
                this.user.reviews = reviewsResponse;
                this.updateStats(reviewsResponse);
            } else {
                 this.user.reviews = [];
                 this.updateStats([]);
            }

        } catch (error) {
            console.error('Error al cargar reviews del usuario:', error);
        }
    
    try {
            // Suponemos que reviewService tiene un método getReviewsByUserId
          const reviewsResponse = await reviewService.getReviewsByUserId(userId);
        
        if (reviewsResponse && reviewsResponse.length > 0) { 
            this.user.reviews = reviewsResponse;
            this.updateStats(reviewsResponse);
        } else {
             this.user.reviews = [];
             this.updateStats([]);
        }

    } catch (error) {
        console.error('Error al cargar reviews del usuario:', error);
    }
}
    
    // Función auxiliar para calcular stats desde las reviews
    updateStats(reviews) {
        if (!reviews || reviews.length === 0) {
            this.user.stats = { total: 0, enProgreso: 0, completadas: 0, compradas: 0 };
            return;
        }
        
        this.user.stats.total = reviews.length;
        this.user.stats.enProgreso = reviews.filter(r => r.status === 'progress').length;
        this.user.stats.completadas = reviews.filter(r => r.status === 'completed').length;
        // La lógica de 'compradas' dependerá de cómo lo maneje tu modelo/servicio
        // Si no tienes este campo en las reviews reales, lo dejamos en el valor mock inicial (0)
        // O lo calculamos si existe un status='purchased' o similar:
        // this.user.stats.compradas = reviews.filter(r => r.status === 'purchased').length; 
    }

    // --- 4. Métodos de Renderizado y Eventos ---
    renderReview(review) {
        // Usamos review.rating, review.title y asumimos que review.poster existe o usamos placeholder.
        const ratingStars = '★'.repeat(review.rating || 0) + '☆'.repeat(5 - (review.rating || 0)); 
        return `
            <div class="review-card">
                <img src="${review.posterUrl || 'placeholder.jpg'}" alt="Poster de ${review.title}">
                <div>
                    <p>"${review.body || review.title}"</p>
                    <p class="rating">${ratingStars}</p>
                </div>
            </div>
        `;
    }

   render() {
        if (this.isLoading) {
            return `<div style="text-align: center; padding: 50px; color: white;">Cargando perfil...</div>`;
        }

        if (!this.user || !this.user.displayName) {
             return `<p class="error-message" style="color:white; text-align:center;">Error: Usuario no logueado.</p>`;
        }
        
     this.innerHTML = `
            <style>
                /* Contenedor principal de 3 columnas */
                .profile-container { 
                    display: grid; 
                    /* Izquierda (Stats): 220px | Centro (Reviews): Flexible | Derecha (Perfil): 300px */
                    grid-template-columns: 220px 1fr 300px; 
                    gap: 20px; 
                    padding: 20px; 
                    color: white; 
                    max-width: 1600px;
                    margin: 0 auto;
                }

                /* Responsividad: En tablets pasa a 2 columnas, en móvil a 1 */
                @media (max-width: 1024px) {
                    .profile-container { grid-template-columns: 1fr 300px; }
                    /* Ocultar o mover stats en tablet si se desea, o cambiar el orden */
                }
                @media (max-width: 768px) {
                    .profile-container { grid-template-columns: 1fr; }
                }

                /* Estilos Generales */
                .column-box { display: flex; flex-direction: column; gap: 20px; }

                /* Columna Izquierda: Stats */
                .stats-box { display: flex; flex-direction: column; gap: 12px; }
                .stat-item { 
                    border: 1px solid #555; 
                    padding: 15px; 
                    border-radius: 8px; 
                    background-color: #1a1a1a;
                    text-align: center;
                }
                .stat-number { font-size: 1.5rem; font-weight: bold; color: #a00000; display: block; }

                /* Columna Centro: Reviews */
                .reviews-box { display: flex; flex-direction: column; gap: 15px; }
                .review-card { 
                    display: flex; 
                    gap: 15px; 
                    border: 1px solid #555; 
                    padding: 15px; 
                    border-radius: 10px; 
                    background-color: #1e1e1e;
                }
                .review-card img {
                    width: 80px; 
                    height: 120px; 
                    object-fit: cover; 
                    border-radius: 4px;
                }
                .review-title { font-weight: bold; font-size: 1.1em; margin-bottom: 5px; color: #fff;}
                .rating { color: #ffd700; margin-top: 5px; }

                /* Columna Derecha: Perfil */
                .user-card { 
                    border: 1px solid #555; 
                    padding: 20px; 
                    border-radius: 10px; 
                    text-align: center; 
                    background-color: #1a1a1a;
                    position: sticky; /* Hace que el perfil se quede fijo al hacer scroll */
                    top: 20px;
                }
                .user-img { 
                    width: 130px; 
                    height: 130px; 
                    border-radius: 50%; 
                    object-fit: cover; 
                    border: 4px solid #a00000; 
                    margin-bottom: 10px;
                }
                .edit-btn { 
                    margin-top: 15px; 
                    padding: 8px 15px; 
                    background: #1a73e8; 
                    color: white; 
                    border: none; 
                    border-radius: 6px; 
                    cursor: pointer; 
                    width: 100%;
                }
                .favorites { display: flex; gap: 10px; margin-top: 15px; justify-content: center; flex-wrap: wrap; }
                .favorites img { width: 60px; height: 90px; border-radius: 6px; object-fit: cover; border: 1px solid #444; }
            </style>

            <div class="profile-container">

                <div class="column-box">
                    <h2>Dashboard</h2>
                    <div class="stats-box">
                        <div class="stat-item">
                            Total 
                            <span class="stat-number">${this.user.stats.total}</span>
                        </div>
                        <div class="stat-item">
                            En progreso 
                            <span class="stat-number">${this.user.stats.enProgreso}</span>
                        </div>
                        <div class="stat-item">
                            Completadas 
                            <span class="stat-number">${this.user.stats.completadas}</span>
                        </div>
                        <div class="stat-item">
                            Compradas 
                            <span class="stat-number">${this.user.stats.compradas}</span>
                        </div>
                    </div>
                </div>

                <div class="column-box">
                    <h2>Tus reviews (${this.user.reviews.length})</h2>
                    <div class="reviews-box">
                        ${this.user.reviews.length > 0 
                            ? this.user.reviews.map(r => this.renderReview(r)).join("") 
                            : '<p style="color: #bbb;">Aún no tienes reviews registradas.</p>'}
                    </div>
                </div>

                <div class="column-box">
                    <div class="user-card">
                        <img class="user-img" src="${this.user.avatarUrl}" alt="Avatar" onerror="this.src='https://via.placeholder.com/150'">
                        <h2>${this.user.displayName || "Usuario"}</h2>
                        
                        <p style="color: #ccc; margin: 5px 0;">📍 ${this.user.city || "Ciudad no especificada"}</p>
                        <p style="font-size: 0.9em;">
                            <strong>${this.user.followers || 0}</strong> Followers | 
                            <strong>${this.user.following || 0}</strong> Following
                        </p>

                        <button class="edit-btn" id="editProfileBtn">Editar perfil</button>

                        <hr style="border: 0; border-top: 1px solid #444; margin: 20px 0;">

                        <h3>Favoritos</h3>
                        <div class="favorites">
                            ${this.user.favorites && this.user.favorites.length > 0 
                                ? this.user.favorites.map(f => `
                                    <img src="${f.poster || 'placeholder.jpg'}" title="Favorito">
                                `).join("") 
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
            editBtn.addEventListener("click", () => {
                console.log("Navegar a /edit-profile");
            });
        }
    }
}

customElements.define("profile-view", ProfileView);