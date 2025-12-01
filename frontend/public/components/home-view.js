import authService from '../js/services/auth.service.js';
import { extractProgressFromForm, renderProgressFields, formatProgress } from '../js/utils/progress-fields.js';

class HomeView extends HTMLElement {
  constructor() {
    super();
    this.user = null;
    this.watchlist = [];
    this.showAddModal = false;
    this.activeFilter = 'All';
    this.searchQuery = '';
    this.searchDebounceTimer = null;
    this.selectedTypeForAdd = 'series';
  }

  async connectedCallback() {
    await this.loadUserData();
    await this.loadWatchlist();
    this.render();
  }

  async loadUserData() {
    try {
      const response = await authService.getProfile();
      this.user = response.data;
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      this.user = authService.getUser();
    }
  }

  async loadWatchlist() {
    try {
      const token = authService.getToken();
      const response = await fetch('http://localhost:3000/api/media/watchlist', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.watchlist = data.data || [];
      }
    } catch (error) {
      console.error('Error al cargar watchlist:', error);
      this.watchlist = [];
    }
  }

  render() {
    if (!this.user) {
      this.innerHTML = '<div class="loading">Cargando perfil...</div>';
      return;
    }

    this.innerHTML = `
      <style>
        .watchlist-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          animation: fadeIn 0.5s ease-out;
        }

        .watchlist-header {
          margin-bottom: 2rem;
        }

        .watchlist-header h1 {
          font-size: 2rem;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .search-filter-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          align-items: center;
        }

        .search-box {
          flex: 1;
          position: relative;
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #1f2428;
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        .search-box input::placeholder {
          color: var(--text-secondary);
        }

        .search-box input:focus {
          outline: none;
          border-color: rgba(100, 116, 139, 0.5);
        }

        .filter-btn {
          padding: 0.75rem 1.5rem;
          background: #1f2428;
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 8px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
        }

        .filter-btn:hover {
          background: #2c3440;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(71, 85, 105, 0.3);
        }

        .tab {
          padding: 0.75rem 1.25rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .tab:hover {
          color: var(--text-primary);
        }

        .tab.active {
          color: var(--text-primary);
          border-bottom-color: var(--text-primary);
        }

        .tab-count {
          margin-left: 0.5rem;
          color: var(--text-secondary);
        }

        .watchlist-table {
          background: #1f2428;
          border-radius: 8px;
          overflow: hidden;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #14181C;
          border-bottom: 1px solid rgba(71, 85, 105, 0.3);
        }

        th {
          padding: 1rem;
          text-align: left;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        tbody tr {
          border-bottom: 1px solid rgba(71, 85, 105, 0.2);
          transition: background 0.2s ease;
          cursor: pointer;
        }

        tbody tr:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        tbody tr:last-child {
          border-bottom: none;
        }

        td {
          padding: 1rem;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        .media-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .media-poster {
          width: 50px;
          height: 70px;
          border-radius: 4px;
          object-fit: cover;
          background: #2c3440;
        }

        .media-title {
          font-weight: 500;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-ongoing {
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
        }

        .rating {
          font-weight: 600;
          color: #fbbf24;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
        }

        .empty-state h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .add-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 224, 84, 0.3);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        .modal {
          background: #1f2428;
          border-radius: 12px;
          padding: 2rem;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .modal h2 {
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          background: #14181C;
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary-color);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-cancel {
          flex: 1;
          padding: 0.75rem;
          background: transparent;
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 6px;
          color: var(--text-primary);
          cursor: pointer;
          font-weight: 500;
        }

        .btn-submit {
          flex: 1;
          padding: 0.75rem;
          background: var(--primary-color);
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          font-weight: 600;
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .watchlist-container {
            padding: 1rem;
          }

          .search-filter-bar {
            flex-direction: column;
          }

          table {
            font-size: 0.85rem;
          }

          th, td {
            padding: 0.75rem 0.5rem;
          }

          .media-poster {
            width: 40px;
            height: 56px;
          }
        }
      </style>

      <div class="watchlist-container">
        <div class="watchlist-header">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h1>My Watchlist</h1>
            <button class="add-btn" id="addItemBtn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Item
            </button>
          </div>
          
          <div class="search-filter-bar">
            <div class="search-box">
              <input type="text" id="searchInput" placeholder="Search your watchlist..." value="${this.searchQuery}" />
            </div>
            <button class="filter-btn">Filters</button>
          </div>

          <div class="tabs">
            <button class="tab ${this.activeFilter === 'All' ? 'active' : ''}" data-filter="All">
              All <span class="tab-count">(${this.watchlist.length})</span>
            </button>
            <button class="tab ${this.activeFilter === 'Manga' ? 'active' : ''}" data-filter="Manga">Manga</button>
            <button class="tab ${this.activeFilter === 'Series' ? 'active' : ''}" data-filter="Series">Series</button>
            <button class="tab ${this.activeFilter === 'Movie' ? 'active' : ''}" data-filter="Movie">Movies</button>
            <button class="tab ${this.activeFilter === 'Book' ? 'active' : ''}" data-filter="Book">Books</button>
            <button class="tab ${this.activeFilter === 'Article' ? 'active' : ''}" data-filter="Article">Articles</button>
          </div>
        </div>

        <div class="watchlist-table">
          ${this.renderWatchlistTable()}
        </div>

        ${this.showAddModal ? this.renderAddModal() : ''}
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const addBtn = this.querySelector('#addItemBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.showAddModal = true;
        this.render();
      });
    }

    // Search input con debouncing
    const searchInput = this.querySelector('#searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        
        // Cancelar el timer anterior
        if (this.searchDebounceTimer) {
          clearTimeout(this.searchDebounceTimer);
        }
        
        // Crear nuevo timer para actualizar después de 300ms sin escribir
        this.searchDebounceTimer = setTimeout(() => {
          this.updateTableOnly();
        }, 300);
      });
    }

    // Tab filters
    const tabs = this.querySelectorAll('.tab[data-filter]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const newFilter = tab.getAttribute('data-filter');
        if (this.activeFilter !== newFilter) {
          this.activeFilter = newFilter;
          this.updateTabs();
          this.updateTableOnly();
        }
      });
    });

    const closeModalBtn = this.querySelector('#closeModal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        this.showAddModal = false;
        this.render();
      });
    }

    const modalOverlay = this.querySelector('.modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.showAddModal = false;
          this.render();
        }
      });
    }

    const addForm = this.querySelector('#addWatchlistForm');
    if (addForm) {
      addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleAddItem(e);
      });
      
      // Listener para cambiar campos de progreso cuando cambia el tipo
      const typeSelect = addForm.querySelector('#type');
      if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
          this.selectedTypeForAdd = e.target.value;
          const container = addForm.querySelector('#progressFieldsContainer');
          if (container) {
            container.innerHTML = `
              <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-weight: 500; font-size: 0.9rem;">Progress</label>
              ${renderProgressFields(this.selectedTypeForAdd)}
            `;
          }
        });
      }
    }

    // Row click handlers
    const rows = this.querySelectorAll('tbody tr[data-media-id]');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        const mediaId = row.getAttribute('data-media-id');
        window.router.navigate(`/media/${mediaId}`);
      });
    });
  }

  updateTableOnly() {
    const tableContainer = this.querySelector('.watchlist-table');
    if (tableContainer) {
      tableContainer.innerHTML = this.renderWatchlistTable();
      
      const rows = this.querySelectorAll('tbody tr[data-media-id]');
      rows.forEach(row => {
        row.addEventListener('click', () => {
          const mediaId = row.getAttribute('data-media-id');
          window.router.navigate(`/media/${mediaId}`);
        });
      });
    }
  }

  updateTabs() {
    const tabs = this.querySelectorAll('.tab[data-filter]');
    tabs.forEach(tab => {
      const filter = tab.getAttribute('data-filter');
      if (filter === this.activeFilter) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  async handleAddItem(e) {
    const formData = new FormData(e.target);
    const submitBtn = this.querySelector('#submitBtn');
    const mediaType = formData.get('type');
    
    const data = {
      mediaName: formData.get('mediaName'),
      type: mediaType,
      platform: formData.get('platform'),
      status: formData.get('status'),
      rating: parseFloat(formData.get('rating')) || undefined,
      link: formData.get('link') || undefined,
      posterUrl: formData.get('posterUrl') || undefined,
      progress: extractProgressFromForm(formData, mediaType)
    };

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Adding...';

      const token = authService.getToken();
      const response = await fetch('http://localhost:3000/api/media/watchlist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        this.showAddModal = false;
        await this.loadWatchlist();
        this.render();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al agregar item');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar item');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add to Watchlist';
      }
    }
  }

  renderAddModal() {
    return `
      <div class="modal-overlay">
        <div class="modal">
          <h2>Add to Watchlist</h2>
          <form id="addWatchlistForm">
            <div class="form-group">
              <label for="mediaName">Title *</label>
              <input type="text" id="mediaName" name="mediaName" required placeholder="Name of the series, movie, etc." />
            </div>

            <div class="form-group">
              <label for="type">Type *</label>
              <select id="type" name="type" required>
                <option value="">Select type</option>
                <option value="series" ${this.selectedTypeForAdd === 'series' ? 'selected' : ''}>Series</option>
                <option value="movie" ${this.selectedTypeForAdd === 'movie' ? 'selected' : ''}>Movie</option>
                <option value="manga" ${this.selectedTypeForAdd === 'manga' ? 'selected' : ''}>Manga</option>
                <option value="book" ${this.selectedTypeForAdd === 'book' ? 'selected' : ''}>Book</option>
                <option value="article" ${this.selectedTypeForAdd === 'article' ? 'selected' : ''}>Article</option>
              </select>
            </div>

            <div class="form-group">
              <label for="platform">Platform</label>
              <input type="text" id="platform" name="platform" placeholder="Netflix, Crunchyroll, etc." />
            </div>

            <div class="form-group">
              <label for="link">Link</label>
              <input type="url" id="link" name="link" placeholder="https://..." />
            </div>

            <div class="form-group">
              <label for="posterUrl">Cover Picture URL</label>
              <input type="url" id="posterUrl" name="posterUrl" placeholder="https://..." />
            </div>

            <div class="form-group">
              <label for="status">Status *</label>
              <select id="status" name="status" required>
                <option value="Watching">Watching</option>
                <option value="Completed">Completed</option>
                <option value="On-Hold">On-Hold</option>
                <option value="Dropped">Dropped</option>
                <option value="Plan to Watch">Plan to Watch</option>
              </select>
            </div>

            <div id="progressFieldsContainer">
              <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-weight: 500; font-size: 0.9rem;">Progress</label>
              ${renderProgressFields(this.selectedTypeForAdd)}
            </div>

            <div class="form-group">
              <label for="rating">Rating (0-10)</label>
              <input type="number" id="rating" name="rating" min="0" max="10" step="0.1" placeholder="8.5" />
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" id="closeModal">Cancel</button>
              <button type="submit" class="btn-submit" id="submitBtn">Add to Watchlist</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderWatchlistTable() {
    // Filtrar watchlist según el filtro activo y búsqueda
    let filteredWatchlist = this.activeFilter === 'All' 
      ? this.watchlist 
      : this.watchlist.filter(item => {
          const itemType = (item.type || '').toLowerCase();
          const filterType = this.activeFilter.toLowerCase();
          return itemType === filterType;
        });

    // Aplicar filtro de búsqueda
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filteredWatchlist = filteredWatchlist.filter(item => {
        const mediaName = (item.mediaName || '').toLowerCase();
        const type = (item.type || '').toLowerCase();
        const platform = (item.platform || '').toLowerCase();
        const status = (item.status || '').toLowerCase();
        
        return mediaName.includes(query) || 
               type.includes(query) || 
               platform.includes(query) || 
               status.includes(query);
      });
    }

    if (filteredWatchlist.length === 0) {
      return `
        <div class="empty-state">
          <h3>${this.activeFilter === 'All' ? 'Your watchlist is empty' : `No ${this.activeFilter} items found`}</h3>
          <p>${this.activeFilter === 'All' ? 'Start adding movies, series, and more to keep track of what you want to watch!' : 'Try adding some items of this type to your watchlist.'}</p>
        </div>
      `;
    }

    return `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Platform</th>
            <th>Link</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          ${filteredWatchlist.map(item => `
            <tr data-media-id="${item._id}">
              <td>
                <div class="media-info">
                  <img src="${item.posterUrl || 'https://placehold.co/50x70/cccccc/969696.png?text=MFP&font=lato'}" alt="${item.mediaName}" class="media-poster" />
                  <span class="media-title">${item.mediaName || 'Unknown'}</span>
                </div>
              </td>
              <td>${item.type || 'N/A'}</td>
              <td>${item.platform || 'N/A'}</td>
              <td>
                ${item.link ? `<a href="${item.link}" target="_blank" style="color: #60a5fa;">View</a>` : 'N/A'}
              </td>
              <td>${formatProgress(item.progress, item.type)}</td>
              <td>
                <span class="status-badge status-${(item.status || 'ongoing').toLowerCase().replace(' ', '-')}">
                  ${item.status || 'Ongoing'}
                </span>
              </td>
              <td><span class="rating">${item.rating || '-'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}

customElements.define('home-view', HomeView);
