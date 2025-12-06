import mediaService from "../js/services/media.service.js";

class StartView extends HTMLElement {
    constructor() {
        super();
        this.media = [];
        this.error = null;
        this.isLoading = true;
    }

    async connectedCallback() {
        console.log("abierta Home");
        this.render();
        await this.fetchInitialMedia(); 
    }

    async fetchInitialMedia() {
        this.media = [];
        this.error = null;
        this.isLoading = true;
        this.render();
        try {
            const mediaList = await mediaService.getAllMedia(); 
            this.media = mediaList || []; 
        } catch (error) {
            console.error("Error al cargar la media inicial:", error);
            this.error = error.message || "Error desconocido al contactar al servidor.";
        } finally {
            this.isLoading = false;
            this.render(); 
        }
    }

    attachEventListeners() {
        const searchInput = this.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('keyup', this.handleSearch.bind(this));
        }
    }

    handleSearch(event) {
        if (event.key === 'Enter') {
            const query = event.target.value.trim();
            this.fetchSearchMedia(query);
        }
    }

    async fetchSearchMedia(query) {
        if (!query) {
            return this.fetchInitialMedia(); 
        }
        
        this.media = [];
        this.error = null;
        this.isLoading = true;
        this.render();

        try {
            const mediaList = await mediaService.searchMedia(query); 
            this.media = mediaList || []; 
        } catch (error) {
            console.error("Error al buscar media:", error);
            this.error = error.message || "Error al realizar la búsqueda.";
        } finally {
            this.isLoading = false;
            this.render();
        }
    }

    renderLoadingOrStatus() {
        if (this.error) {
            return `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #ef4444;">
                    <strong>Error de Carga:</strong> ${this.error}
                    <br>
                    Por favor, verifica la consola para detalles.
                </div>
            `;
        }

        if (this.isLoading || this.media.length === 0) {
            const message = this.isLoading ? 'Cargando contenido...' : 'No se encontraron resultados para la búsqueda.';

            return `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #9ca3af;">
                    ${message}
                </div>
            `;
        }
        
        return '';
    }

    render() {
        const statusContent = this.renderLoadingOrStatus(); 

        const galleryContent = statusContent
            ? statusContent
            : this.media.map(mediaItem => this.renderMovieCard(mediaItem)).join('');
            
        this.innerHTML = `
            <style>
                /* ... Tu CSS completo se mantiene aquí ... */
                :host {
                    display: block;
                    background-color: #14181C;
                    min-height: 100vh;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    color: #ffffff;
                }
                .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
                .top-bar { margin-bottom: 2rem; }
                .search-container { margin-bottom: 1rem; }
                .search-input { width: 100%; padding: 0.75rem 1rem; background: #1F2937; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #fff; font-size: 0.95rem; }
                .search-input:focus { outline: none; border-color: #6366f1; }
                .filters { display: flex; gap: 0.5rem; }
                .filter-tag { background: #E5E7EB; color: #1f2937; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
                .filter-tag:hover { background: #d1d5db; }
                .filter-tag.active { background: #ffffff; }
                .dashboard-grid { display: grid; grid-template-columns: 240px 1fr 240px; gap: 2rem; align-items: start; }
                .section-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: #e5e7eb; }
                .friends-list { display: flex; flex-direction: column; gap: 1rem; }
                .friend-item { display: flex; gap: 0.75rem; align-items: flex-start; }
                .friend-avatar { width: 48px; height: 48px; background: #e5e7eb; color: #1f2937; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0; }
                .friend-info { display: flex; flex-direction: column; }
                .friend-name { font-weight: 700; font-size: 0.9rem; color: #fff; }
                .friend-status { font-size: 0.8rem; color: #9ca3af; line-height: 1.3; }
                .gallery-section { background: transparent; }
                .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; }
                .media-card { background: #e5e7eb; aspect-ratio: 2/3; border-radius: 6px; position: relative; overflow: hidden; cursor: pointer; transition: transform 0.2s; display: flex; align-items: flex-end; justify-content: center; }
                .media-card:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
                .poster-placeholder { width: 100%; height: 100%; background: #d1d5db; display: flex; align-items: center; justify-content: center; color: #6b7280; font-weight: bold; text-align: center; padding: 0.5rem; }
                .media-title { position: absolute; bottom: 0; left: 0; right: 0; padding: 0.5rem; background: rgba(0,0,0,0.7); color: white; font-size: 0.85rem; text-align: center; }
                .right-sidebar { display: flex; flex-direction: column; gap: 2rem; }
                .watchlist-preview { display: flex; gap: 0.5rem; }
                .watchlist-item { width: 64px; height: 96px; background: #e5e7eb; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; color: #6b7280; }
                .lists-links { list-style: none; padding: 0; margin: 0; }
                .lists-links li { margin-bottom: 0.5rem; }
                .lists-links a { color: #d1d5db; text-decoration: none; font-size: 0.9rem; transition: color 0.2s; display: flex; align-items: center; gap: 0.5rem; }
                .lists-links a:before { content: "•"; color: #fff; }
                .lists-links a:hover { color: #fff; text-decoration: underline; }
                @media (max-width: 1024px) {
                    .dashboard-grid { grid-template-columns: 1fr; }
                    .top-bar { display: flex; flex-direction: column; gap: 1rem; }
                }
            </style>

            <div class="container">
                <div class="top-bar">
                    <div class="search-container">
                        <input type="text" class="search-input" placeholder="Buscar..." />
                    </div>
                    <div class="filters">
                        <button class="filter-tag active">Películas</button>
                        <button class="filter-tag">Series</button>
                        <button class="filter-tag">Videos</button>
                        <button class="filter-tag">Manga</button>
                        <button class="filter-tag">Anime</button>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <aside class="left-sidebar">
                        <h3 class="section-title">Amigos</h3>
                        <div class="friends-list">
                            <div class="friend-item">
                                <div class="friend-avatar">48x48</div>
                                <div class="friend-info">
                                    <span class="friend-name">Carlos</span>
                                    <span class="friend-status">Gran película</span>
                                </div>
                            </div>
                            <div class="friend-item">
                                <div class="friend-avatar">48x48</div>
                                <div class="friend-info">
                                    <span class="friend-name">Ivan</span>
                                    <span class="friend-status">Esa escena fue increíble</span>
                                </div>
                            </div>
                            <div class="friend-item">
                                <div class="friend-avatar">48x48</div>
                                <div class="friend-info">
                                    <span class="friend-name">Andres</span>
                                    <span class="friend-status">Así se ve un sueño</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <main class="gallery-section">
                        <h3 class="section-title">Inicio - Galería</h3>
                        <div class="gallery-grid">
                            ${galleryContent}
                        </div>
                    </main>

                    <aside class="right-sidebar">
                        <div class="watchlist-widget">
                            <h3 class="section-title">Watchlist</h3>
                            <div class="watchlist-preview">
                                <div class="watchlist-item">64x96</div>
                                <div class="watchlist-item">64x96</div>
                                <div class="watchlist-item">64x96</div>
                            </div>
                        </div>

                        <div class="lists-widget">
                            <h3 class="section-title">Listas</h3>
                            <ul class="lists-links">
                                <li><a href="#">Favoritas</a></li>
                                <li><a href="#">Para ver</a></li>
                                <li><a href="#">Drama</a></li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        `;
        this.attachEventListeners();
    }

    renderMovieCard(mediaItem) {
        const title = mediaItem.name || mediaItem.title || 'Título Desconocido';
        const posterUrl = mediaItem.poster;
        
        console.log(`Renderizando tarjeta para: ${title}`); 

        return `
            <div class="media-card">
                ${posterUrl 
                    ? `<img src="${posterUrl}" alt="Póster de ${title}" style="width:100%; height:100%; object-fit:cover;">`
                    : `<div class="poster-placeholder">${title}</div>`
                }
                <div class="media-title">${title}</div>
            </div>
        `;
    }
}

customElements.define("start-view", StartView);