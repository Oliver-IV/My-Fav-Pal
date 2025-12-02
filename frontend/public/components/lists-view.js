import authService from '../js/services/auth.service.js';

class ListsView extends HTMLElement {
    constructor() {
        super();
        this.lists = [];
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
        this.fetchLists();
    }

    async fetchLists() {
        const token = authService.getToken();
        if (!token) {
            console.error('No token found');
            window.location.hash = '/login';
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/lists', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch lists');
            }

            const result = await response.json();
            console.log('[Frontend] Respuesta JSON recibida del API:', result); // <-- LOG 3

            this.lists = result.data;
            console.log('[Frontend] this.lists después de la asignación:', this.lists); // <-- LOG 4
            
            this.renderLists();
        } catch (error) {
            console.error('Error fetching lists:', error);
            this.lists = [
                { id: 1, name: 'Must Goon Too', description: 'Just the best gooning series on earth', items_count: 10000, likes_count: 69, visibility: 'public' },
                { id: 2, name: 'Webtoon Classics', description: 'A collection of classic webtoons.', items_count: 50, likes_count: 150, visibility: 'private' },
                { id: 3, name: 'Sci-Fi Movies', description: 'The best sci-fi movies of the last decade.', items_count: 25, likes_count: 88, visibility: 'public' },
            ];
            this.renderLists();
        }
    }

    render() {
        this.innerHTML = `
            <div class="lists-container">
                <div class="lists-header">
                    <h1>Lists</h1>
                    <p>Organize and share your favorite content</p>
                </div>
                
                <div class="search-filter-bar" style="margin-bottom: 2rem;">
                  <div class="search-box">
                    <input type="text" id="list-search" placeholder="Search your lists..." />
                  </div>
                  <button class="filter-btn">Filters</button>
                </div>

                <div id="lists-grid" class="lists-grid">
                    <p>Loading lists...</p>
                </div>
            </div>
        `;
    }

    renderLists() {
        const grid = this.querySelector('#lists-grid');
        const searchInput = this.querySelector('#list-search');
        if (!grid || !searchInput) return;

        const searchTerm = searchInput.value.toLowerCase();
        const filteredLists = this.lists.filter(list => 
            list.name.toLowerCase().includes(searchTerm) ||
            (list.description && list.description.toLowerCase().includes(searchTerm))
        );

        if (filteredLists.length === 0) {
            grid.innerHTML = '<p>No lists found.</p>';
            return;
        }

        grid.innerHTML = filteredLists.map(list => `
            <div class="list-card">
                <div class="list-card-header">
                    <span class="visibility">${list.visibility === 'public' ? '🌐 Public' : '🔒 Private'}</span>
                    <span class="info-icon">ⓘ</span>
                </div>
                <div class="list-card-body">
                    <h3>${list.name}</h3>
                    <p>${list.description}</p>
                </div>
                <div class="list-card-footer">
                    <span>${list.items?.length || 0} Items</span>
                    <span style="display: flex; align-items: center; gap: 0.3rem;">
                        <!-- Replaced SVG with a cleaner, outlined version -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        ${list.likes?.length || 0}
                    </span>
                </div>
            </div>
        `).join('');
    }

    attachEventListeners() {
        const searchInput = this.querySelector('#list-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderLists());
        }
    }
}

customElements.define('lists-view', ListsView);