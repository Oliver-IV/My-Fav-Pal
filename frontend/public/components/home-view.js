import authService from '../js/services/auth.service.js';
import mediaService from '../js/services/media.service.js';
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
    
    // Variables para el modal
    this.selectedTypeForAdd = 'series';
    this.selectedMediaId = null; 
  }

  async connectedCallback() {
    await this.loadUserData();
    if (this.user) {
        await this.loadWatchlist();
        this.render();
    }
  }

  async loadUserData() {
    try {
      const response = await authService.getProfile();
      this.user = response.data;
    } catch (error) {
      console.error("Error cargando perfil:", error);
      // Intenta leer del cache local
      this.user = authService.getUser();
      
      // FIX: Si aun así es nulo (backend caído + sin cache), redirigir a login
      if (!this.user) {
          alert("Sesión expirada o error de conexión. Por favor inicia sesión nuevamente.");
          window.router.navigate('/login');
      }
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
      } else {
          // Si el backend da error, inicializamos vacío para que no rompa la UI
          this.watchlist = [];
      }
    } catch (error) {
      console.error('Error cargando watchlist:', error);
      this.watchlist = [];
    }
  }

  async handleAddItem(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const submitBtn = this.querySelector('#submitBtn');
    const mediaType = formData.get('type');
    
    const data = {
      mediaId: this.selectedMediaId, // Enviamos el ID o null
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
      submitBtn.textContent = 'Guardando...';

      const token = authService.getToken();
      const response = await fetch('http://localhost:3000/api/media/watchlist', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        this.showAddModal = false;
        this.selectedMediaId = null;
        await this.loadWatchlist();
        this.render();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al agregar item');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Agregar a Watchlist'; }
    }
  }

  attachModalListeners() {
    const addForm = this.querySelector('#addWatchlistForm');
    if (!addForm) return;

    // Buscador API
    const modalSearchInput = this.querySelector('#modalSearchInput');
    const resultsContainer = this.querySelector('#modalSearchResults');

    if (modalSearchInput) {
        modalSearchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            if (query.length === 0) this.selectedMediaId = null;

            if (query.length < 3) {
                resultsContainer.innerHTML = '';
                return;
            }
            
            if (this.addModalSearchDebounce) clearTimeout(this.addModalSearchDebounce);
            this.addModalSearchDebounce = setTimeout(async () => {
                const results = await mediaService.searchMedia(query);
                this.renderModalSearchResults(results);
            }, 300);
        });
    }

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

    addForm.addEventListener('submit', (e) => this.handleAddItem(e));
  }

  renderModalSearchResults(results) {
      const container = this.querySelector('#modalSearchResults');
      if (!container) return;

      if (results.length === 0) {
          container.innerHTML = `<div style="padding:10px; color:#888; font-size:0.9em;">No encontrado. Puedes agregarlo manualmente abajo.</div>`;
          return;
      }

      container.innerHTML = results.map(item => `
        <div class="search-result-item" data-item='${JSON.stringify(item)}'>
            <img src="${item.poster || 'https://placehold.co/30'}" />
            <div>
                <div style="font-weight:bold;">${item.name}</div>
                <div style="font-size:0.8em; color:#888;">${item.type} • ${item.platform.join(', ')}</div>
            </div>
        </div>
      `).join('');

      container.querySelectorAll('.search-result-item').forEach(el => {
          el.addEventListener('click', () => {
              const item = JSON.parse(el.getAttribute('data-item'));
              this.fillAddForm(item);
              container.innerHTML = ''; 
              this.querySelector('#modalSearchInput').value = '';
          });
      });
  }

  fillAddForm(item) {
      this.querySelector('#mediaName').value = item.name;
      this.querySelector('#type').value = item.type.toLowerCase();
      this.querySelector('#platform').value = item.platform[0] || '';
      if(item.poster) this.querySelector('#posterUrl').value = item.poster;
      
      this.selectedMediaId = item._id; 
      
      this.querySelector('#type').dispatchEvent(new Event('change'));
  }

  renderAddModal() {
    return `
      <div class="modal-overlay">
        <div class="modal">
          <h2>Add to Watchlist</h2>
          
          <div style="margin-bottom: 20px; background: #2d333b; padding: 15px; border-radius: 8px; border: 1px solid #444;">
            <label style="color: #58a6ff; font-weight: bold; font-size: 0.9em; display:block; margin-bottom:8px;">🔍 Buscar en Base de Datos (Recomendado)</label>
            <input type="text" id="modalSearchInput" placeholder="Ej: Naruto, Avengers..." style="width:100%; padding:10px; background:#0d1117; border:1px solid #30363d; color:white; border-radius:6px; box-sizing:border-box;">
            <div id="modalSearchResults" class="search-results-dropdown"></div>
            <p style="font-size: 0.8em; color: #888; margin-top: 5px;">* Esto habilita las reviews públicas.</p>
          </div>

          <form id="addWatchlistForm">
            <div class="form-group">
              <label for="mediaName">Title *</label>
              <input type="text" id="mediaName" name="mediaName" required placeholder="Escribe el nombre aquí..." />
            </div>

            <div class="form-group">
              <label for="type">Type *</label>
              <select id="type" name="type" required>
                <option value="Series">Series</option>
                <option value="Movie">Movie</option>
                <option value="Manga">Manga</option>
                <option value="Book">Book</option>
                <option value="Article">Article</option>
              </select>
            </div>

            <div class="form-group"><label for="platform">Platform</label><input type="text" id="platform" name="platform" /></div>
            <div class="form-group"><label for="link">Link</label><input type="url" id="link" name="link" /></div>
            <div class="form-group"><label for="posterUrl">Cover Picture URL</label><input type="url" id="posterUrl" name="posterUrl" /></div>

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
              ${renderProgressFields('series')}
            </div>

            <div class="form-group"><label for="rating">Rating (0-10)</label><input type="number" id="rating" name="rating" min="0" max="10" step="0.1" /></div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" id="closeModal">Cancel</button>
              <button type="submit" class="btn-submit" id="submitBtn">Add to Watchlist</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  updateTableOnly() {
    const tableContainer = this.querySelector('.watchlist-table');
    if (tableContainer) {
      tableContainer.innerHTML = this.renderWatchlistTable();
      this.querySelectorAll('tbody tr[data-media-id]').forEach(row => {
        row.addEventListener('click', () => window.router.navigate(`/media/${row.getAttribute('data-media-id')}`));
      });
    }
  }

  updateTabs() {
    this.querySelectorAll('.tab[data-filter]').forEach(tab => {
      if (tab.getAttribute('data-filter') === this.activeFilter) tab.classList.add('active');
      else tab.classList.remove('active');
    });
  }

  attachEventListeners() {
    const addBtn = this.querySelector('#addItemBtn');
    if (addBtn) addBtn.addEventListener('click', () => { this.showAddModal = true; this.render(); });

    const searchInput = this.querySelector('#searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => { this.updateTableOnly(); }, 300);
      });
    }

    this.querySelectorAll('.tab[data-filter]').forEach(tab => {
      tab.addEventListener('click', () => {
        this.activeFilter = tab.getAttribute('data-filter');
        this.updateTabs();
        this.updateTableOnly();
      });
    });

    const closeModal = () => { this.showAddModal = false; this.render(); };
    this.querySelector('#closeModal')?.addEventListener('click', closeModal);
    this.querySelector('.modal-overlay')?.addEventListener('click', (e) => { if(e.target === e.currentTarget) closeModal(); });

    this.querySelectorAll('tbody tr[data-media-id]').forEach(row => {
      row.addEventListener('click', () => {
        window.router.navigate(`/media/${row.getAttribute('data-media-id')}`);
      });
    });

    this.attachModalListeners();
  }

  renderWatchlistTable() {
    let filtered = this.watchlist;
    if (this.activeFilter !== 'All') {
        filtered = filtered.filter(i => i.type?.toLowerCase() === this.activeFilter.toLowerCase());
    }
    if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        filtered = filtered.filter(i => i.mediaName?.toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
      return `<div class="empty-state"><h3>Your watchlist is empty</h3><p>Start adding content to track!</p></div>`;
    }

    return `
      <table>
        <thead>
          <tr><th>Name</th><th>Type</th><th>Platform</th><th>Progress</th><th>Status</th><th>Rating</th></tr>
        </thead>
        <tbody>
          ${filtered.map(item => `
            <tr data-media-id="${item._id}">
              <td>
                <div class="media-info">
                  <img src="${item.posterUrl || 'https://placehold.co/50'}" class="media-poster" />
                  <span class="media-title">${item.mediaName}</span>
                </div>
              </td>
              <td>${item.type}</td>
              <td>${item.platform || '-'}</td>
              <td>${formatProgress(item.progress, item.type)}</td>
              <td><span class="status-badge status-${(item.status||'watching').toLowerCase().replace(/\s/g,'-')}">${item.status}</span></td>
              <td><span class="rating">${item.rating || '-'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  render() {
    if (!this.user) {
      // Si llegamos aquí, loadUserData falló y no hay cache.
      this.innerHTML = '<div class="loading">Cargando perfil...</div>';
      return;
    }

    // ... (El resto del método render y estilos se mantiene igual) ...
    // Para ahorrar espacio, asume que aquí van los estilos y el HTML principal que ya tenías
    // Solo me aseguré de que el modalSearchInput y la lógica de renderAddModal estén correctos arriba.
    
    // NOTA: Para que funcione al copiar y pegar, aquí te dejo el render COMPLETO otra vez:
    this.innerHTML = `
      <style>
        .watchlist-container { max-width: 1400px; margin: 0 auto; padding: 2rem; animation: fadeIn 0.5s ease-out; }
        .watchlist-header { margin-bottom: 2rem; }
        .watchlist-header h1 { font-size: 2rem; color: var(--text-primary); margin-bottom: 1.5rem; }
        .search-filter-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center; }
        .search-box { flex: 1; position: relative; }
        .search-box input { width: 100%; padding: 0.75rem 1rem; background: #1f2428; border: 1px solid rgba(71, 85, 105, 0.3); border-radius: 8px; color: var(--text-primary); font-size: 0.95rem; box-sizing: border-box; }
        .search-box input:focus { outline: none; border-color: rgba(100, 116, 139, 0.5); }
        .filter-btn, .add-btn { padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s ease; display: flex; align-items: center; gap: 0.5rem; }
        .filter-btn { background: #1f2428; border: 1px solid rgba(71, 85, 105, 0.3); color: var(--text-primary); }
        .add-btn { background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border: none; color: white; }
        .add-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 224, 84, 0.3); }
        .tabs { display: flex; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(71, 85, 105, 0.3); }
        .tab { padding: 0.75rem 1.25rem; background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--text-secondary); cursor: pointer; font-size: 0.95rem; font-weight: 500; }
        .tab.active { color: var(--text-primary); border-bottom-color: var(--text-primary); }
        .watchlist-table { background: #1f2428; border-radius: 8px; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        thead { background: #14181C; border-bottom: 1px solid rgba(71, 85, 105, 0.3); }
        th { padding: 1rem; text-align: left; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; }
        tbody tr { border-bottom: 1px solid rgba(71, 85, 105, 0.2); cursor: pointer; transition: background 0.2s; }
        tbody tr:hover { background: rgba(255, 255, 255, 0.05); }
        td { padding: 1rem; color: var(--text-primary); font-size: 0.95rem; }
        .media-info { display: flex; align-items: center; gap: 1rem; }
        .media-poster { width: 50px; height: 70px; border-radius: 4px; object-fit: cover; background: #2c3440; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem; font-weight: 500; }
        .status-watching { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
        .rating { font-weight: 600; color: #fbbf24; }
        .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-secondary); }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: #1f2428; border-radius: 12px; padding: 2rem; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); }
        .form-group { margin-bottom: 1.25rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem; }
        .form-group input, .form-group select { width: 100%; padding: 0.75rem; background: #14181C; border: 1px solid rgba(71, 85, 105, 0.3); border-radius: 6px; color: var(--text-primary); box-sizing: border-box; }
        .form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
        .btn-cancel { flex: 1; padding: 0.75rem; background: transparent; border: 1px solid #444; color: white; border-radius: 6px; cursor: pointer; }
        .btn-submit { flex: 1; padding: 0.75rem; background: var(--primary-color); border: none; color: white; border-radius: 6px; cursor: pointer; }
        .search-results-dropdown { background: #2d333b; border: 1px solid #444; border-radius: 0 0 6px 6px; max-height: 200px; overflow-y: auto; margin-top: -5px; position: relative; z-index: 10; }
        .search-result-item { padding: 10px; display: flex; align-items: center; gap: 10px; cursor: pointer; border-bottom: 1px solid #444; }
        .search-result-item:hover { background: #22272e; }
        .search-result-item img { width: 30px; height: 45px; object-fit: cover; }
      </style>

      <div class="watchlist-container">
        <div class="watchlist-header">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h1>My Watchlist</h1>
            <button class="add-btn" id="addItemBtn"><span>+</span> Add Item</button>
          </div>
          <div class="search-filter-bar">
            <div class="search-box">
              <input type="text" id="searchInput" placeholder="Search your watchlist..." value="${this.searchQuery}" />
            </div>
            <button class="filter-btn">Filters</button>
          </div>
          <div class="tabs">
            <button class="tab ${this.activeFilter === 'All' ? 'active' : ''}" data-filter="All">All (${this.watchlist.length})</button>
            <button class="tab ${this.activeFilter === 'Manga' ? 'active' : ''}" data-filter="Manga">Manga</button>
            <button class="tab ${this.activeFilter === 'Series' ? 'active' : ''}" data-filter="Series">Series</button>
            <button class="tab ${this.activeFilter === 'Movie' ? 'active' : ''}" data-filter="Movie">Movies</button>
            <button class="tab ${this.activeFilter === 'Book' ? 'active' : ''}" data-filter="Book">Books</button>
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
}

customElements.define('home-view', HomeView);