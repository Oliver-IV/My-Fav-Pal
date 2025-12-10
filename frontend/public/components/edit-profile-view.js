import authService from '../js/services/auth.service.js';

class EditProfileView extends HTMLElement {
    constructor() {
        super();
        this.user = authService.getUser() || {};
        this.watchlist = [];
        this.selectedFavorites = [];
        this.isLoading = true;
    }

    connectedCallback() {
        if (!authService.isAuthenticated()) {
            window.location.hash = "#/login";
            return;
        }
        this.loadData();
    }

    async loadData() {
        this.isLoading = true;
        this.render();

        try {
            await authService.getProfile();
            const currentUser = authService.getUser();

            if (currentUser) {
                this.user = currentUser;
                this.watchlist = this.user.watchlist || [];

                this.selectedFavorites = (this.user.favorites || []).map(f => f._id || f);
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            this.isLoading = false;
            this.render();
            this.attachEventListeners();
        }
    }

    toggleFavorite(mediaId) {

        const nameInput = this.querySelector('#displayName');
        const cityInput = this.querySelector('#nationality');

        if (nameInput) this.user.displayName = nameInput.value;
        if (cityInput) this.user.city = cityInput.value;

        const index = this.selectedFavorites.indexOf(mediaId);

        if (index > -1) {
            this.selectedFavorites.splice(index, 1);
        } else {
            if (this.selectedFavorites.length >= 3) {
                alert("Solo puedes seleccionar hasta 3 favoritos.");
                return;
            }
            this.selectedFavorites.push(mediaId);
        }

        this.render();
        this.attachEventListeners();


    }

    async handleSave(e) {
        e.preventDefault();

        const displayName = this.querySelector('#displayName').value;
        const city = this.querySelector('#nationality').value;
        const avatarUrl = this.user.avatarUrl || '';

        const btn = this.querySelector('.save-btn');
        const originalText = btn.textContent;

        try {
            btn.textContent = 'Guardando...';
            btn.disabled = true;

            await authService.updateProfile(displayName, avatarUrl, city);

            await authService.updateFavorites(this.selectedFavorites);

            await authService.getProfile();

            console.log('Perfil actualizado con éxito');

            window.location.hash = '#/profile';

        } catch (error) {
            alert('Error al actualizar: ' + error.message);
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    render() {
        if (this.isLoading) {
            this.innerHTML = `<div style="text-align:center; color:white; padding:50px;">Cargando editor...</div>`;
            return;
        }

        const styles = `
            <style>
                .edit-container { max-width: 800px; margin: 0 auto; padding: 20px; color: white; }
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; margin-bottom: 8px; font-weight: bold; }
                .form-group input { width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #555; background: #222; color: white; box-sizing: border-box; }
                
                .watchlist-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); 
                    gap: 15px; 
                    margin-top: 10px; 
                    max-height: 400px; 
                    overflow-y: auto;
                    padding: 10px;
                    border: 1px solid #444;
                    border-radius: 8px;
                    background: #1a1a1a;
                }
                
                .media-select-card {
                    position: relative;
                    cursor: pointer;
                    border: 3px solid transparent; /* Borde transparente para reservar espacio */
                    border-radius: 8px;
                    overflow: hidden;
                    transition: transform 0.2s, border-color 0.2s;
                }
                
                .media-select-card:hover { transform: scale(1.05); }
                
                /* Estilo seleccionado */
                .media-select-card.selected {
                    border-color: #ffd700; /* Dorado */
                    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
                }
                
                .media-select-card img { 
                    width: 100%; 
                    height: 140px; 
                    object-fit: cover; 
                    display: block; 
                    background-color: #333; 
                }
                
                .check-overlay {
                    position: absolute; top: 5px; right: 5px;
                    background: #ffd700; color: black;
                    border-radius: 50%; width: 22px; height: 22px;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: bold; font-size: 14px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .media-select-card.selected .check-overlay { opacity: 1; }

                .actions { margin-top: 30px; display: flex; gap: 15px; }
                .save-btn { background: #1a73e8; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 1rem; flex: 1;}
                .save-btn:hover { background: #1557b0; }
                .save-btn:disabled { background: #555; cursor: not-allowed; }
                
                .cancel-btn { background: #444; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-block; text-align: center; }
                .cancel-btn:hover { background: #666; }
            </style>
        `;

        const watchlistItems = this.watchlist.length > 0 ? this.watchlist.map(item => {
            const mediaId = item.mediaId || item._id;
            const isSelected = this.selectedFavorites.includes(mediaId);
            const poster = item.posterUrl || `https://placehold.co/100x150/444/FFF?text=Sin+Img`;
            const title = item.mediaName || 'Media';

            return `
                <div class="media-select-card ${isSelected ? 'selected' : ''}" data-id="${mediaId}" title="${title}">
                    <div class="check-overlay">✓</div>
                    <img src="${poster}" alt="${title}">
                </div>
            `;
        }).join('') : '<p style="padding: 20px; color: #aaa; text-align: center; grid-column: 1/-1;">Tu watchlist está vacía. <br> Agrega películas primero para seleccionarlas como favoritas.</p>';

        this.innerHTML = `
            ${styles}
            <div class="edit-container">
                <h1>Editar Perfil</h1>
                
                <form id="editForm">
                    <div class="form-group">
                        <label>Nombre (Display Name)</label>
                        <input type="text" id="displayName" value="${this.user.displayName || ''}" required>
                    </div>

                    <div class="form-group">
                        <label>Ciudad</label>
                        <input type="text" id="nationality" value="${this.user.city || ''}" placeholder="Ej: CDMX, México">
                    </div>

                    <div class="form-group">
                        <label>Elige tus 3 Favoritos (desde tu Watchlist)</label>
                        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 10px;">
                            Seleccionados: <strong style="color: ${this.selectedFavorites.length === 3 ? '#ffd700' : 'white'}">${this.selectedFavorites.length} / 3</strong>
                        </p>
                        
                        <div class="watchlist-grid">
                            ${watchlistItems}
                        </div>
                    </div>

                    <div class="actions">
                        <button type="submit" class="save-btn">Guardar Cambios</button>
                        <button type="button" class="cancel-btn" id="cancelBtn">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
    }

    attachEventListeners() {
        const form = this.querySelector('#editForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSave(e));
        }

        const cancelBtn = this.querySelector('#cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                window.location.hash = '#/profile';
            });
        }

        const cards = this.querySelectorAll('.media-select-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const mediaId = card.getAttribute('data-id');
                if (mediaId) this.toggleFavorite(mediaId);
            });
        });
    }
}

customElements.define('edit-profile-view', EditProfileView);