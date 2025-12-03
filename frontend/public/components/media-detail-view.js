import authService from '../js/services/auth.service.js';
import { extractProgressFromForm, renderProgressFields, formatProgress } from '../js/utils/progress-fields.js';

class MediaDetailView extends HTMLElement {
  constructor() {
    super();
    this.mediaItem = null;
    this.showEditModal = false;
  }

  async connectedCallback() {
    const mediaId = this.getAttribute('media-id');
    if (mediaId) {
      await this.loadMediaDetail(mediaId);
    }
    this.render();
  }

  async loadMediaDetail(mediaId) {
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
        const watchlist = data.data || [];
        this.mediaItem = watchlist.find(item => item._id === mediaId);
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
    }
  }

  async handleUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const submitBtn = this.querySelector('#submitBtn');
    const mediaType = formData.get('type');
    
    const updateData = {
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
      submitBtn.textContent = 'Updating...';

      const token = authService.getToken();
      const response = await fetch(`http://localhost:3000/api/media/watchlist/${this.mediaItem._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        this.showEditModal = false;
        await this.loadMediaDetail(this.mediaItem._id);
        this.render();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al actualizar item');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar item');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update';
      }
    }
  }

  async handleDelete() {
    if (!confirm('¿Estás seguro de que quieres eliminar este item?')) {
      return;
    }

    try {
      const token = authService.getToken();
      const response = await fetch(`http://localhost:3000/api/media/watchlist/${this.mediaItem._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        window.router.navigate('/home');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al eliminar item');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar item');
    }
  }

  render() {
    if (!this.mediaItem) {
      this.innerHTML = `
        <div class="loading-container">
          <div class="loading">Cargando detalles...</div>
        </div>
      `;
      return;
    }

    this.innerHTML = `
      <style>
        .media-detail-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          animation: fadeIn 0.5s ease-out;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 6px;
          color: var(--text-primary);
          cursor: pointer;
          margin-bottom: 2rem;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          background: #1f2428;
        }

        .media-header {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
          background: #1f2428;
          border-radius: 12px;
          padding: 2rem;
        }

        .media-poster-large {
          width: 100%;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .media-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .media-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .media-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .meta-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .meta-value {
          font-size: 1.1rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .rating-large {
          font-size: 2rem;
          font-weight: 700;
          color: #fbbf24;
        }

        .status-badge-large {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .status-watching {
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
        }

        .status-completed {
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
        }

        .status-on-hold {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
        }

        .status-dropped {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
        }

        .status-plan-to-watch {
          background: rgba(168, 85, 247, 0.1);
          color: #c084fc;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-top: auto;
        }

        .btn-edit {
          flex: 1;
          padding: 0.75rem 1.5rem;
          background: var(--primary-color);
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn-edit:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 224, 84, 0.3);
        }

        .btn-delete {
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.5);
          border-radius: 6px;
          color: #f87171;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn-delete:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .media-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          border: none;
          border-radius: 6px;
          color: white;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .media-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 224, 84, 0.3);
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
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
          .media-header {
            grid-template-columns: 1fr;
          }

          .media-title {
            font-size: 1.5rem;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      </style>

      <div class="media-detail-container">
        <button class="back-button" id="backBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Watchlist
        </button>

        <div class="media-header">
          <img src="${this.mediaItem.posterUrl || 'https://placehold.co/300x450/cccccc/969696.png?text=MFP&font=lato'}" 
               alt="${this.mediaItem.mediaName}" 
               class="media-poster-large" />
          
          <div class="media-info">
            <h1 class="media-title">${this.mediaItem.mediaName}</h1>
            
            <div class="media-meta">
              <div class="meta-item">
                <span class="meta-label">Type</span>
                <span class="meta-value">${this.mediaItem.type || 'N/A'}</span>
              </div>
              
              ${this.mediaItem.platform ? `
                <div class="meta-item">
                  <span class="meta-label">Platform</span>
                  <span class="meta-value">${this.mediaItem.platform}</span>
                </div>
              ` : ''}
              
              ${this.mediaItem.progress && Object.keys(this.mediaItem.progress).length > 0 ? `
                <div class="meta-item">
                  <span class="meta-label">Progress</span>
                  <span class="meta-value">${formatProgress(this.mediaItem.progress, this.mediaItem.type)}</span>
                </div>
              ` : ''}
              
              ${this.mediaItem.rating ? `
                <div class="meta-item">
                  <span class="meta-label">My rating</span>
                  <span class="rating-large">${this.mediaItem.rating}/5</span>
                </div>
              ` : ''}
            </div>

            <div>
              <span class="meta-label" style="display: block; margin-bottom: 0.5rem;">Status</span>
              <span class="status-badge-large status-${(this.mediaItem.status || 'watching').toLowerCase().replace(/\s+/g, '-')}">
                ${this.mediaItem.status || 'Watching'}
              </span>
            </div>

            ${this.mediaItem.link ? `
              <a href="${this.mediaItem.link}" target="_blank" class="media-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Open Link
              </a>
            ` : ''}

            <div class="action-buttons">
              <button class="btn-edit" id="editBtn">Edit Media</button>
              <button class="btn-delete" id="deleteBtn">Delete</button>
            </div>
          </div>
        </div>

        ${this.showEditModal ? this.renderEditModal() : ''}
      </div>
    `;

    this.attachEventListeners();
  }

  renderEditModal() {
    return `
      <div class="modal-overlay">
        <div class="modal">
          <h2>Edit Media Details</h2>
          <form id="editForm">
            <div class="form-group">
              <label for="mediaName">Title *</label>
              <input type="text" id="mediaName" name="mediaName" required value="${this.mediaItem.mediaName}" />
            </div>

            <div class="form-group">
              <label for="type">Type *</label>
              <select id="type" name="type" required>
                <option value="series" ${this.mediaItem.type === 'series' ? 'selected' : ''}>Series</option>
                <option value="movie" ${this.mediaItem.type === 'movie' ? 'selected' : ''}>Movie</option>
                <option value="manga" ${this.mediaItem.type === 'manga' ? 'selected' : ''}>Manga</option>
                <option value="book" ${this.mediaItem.type === 'book' ? 'selected' : ''}>Book</option>
                <option value="article" ${this.mediaItem.type === 'article' ? 'selected' : ''}>Article</option>
              </select>
            </div>

            <div class="form-group">
              <label for="platform">Platform</label>
              <input type="text" id="platform" name="platform" value="${this.mediaItem.platform || ''}" />
            </div>

            <div class="form-group">
              <label for="link">Link</label>
              <input type="url" id="link" name="link" value="${this.mediaItem.link || ''}" />
            </div>

            <div class="form-group">
              <label for="posterUrl">Cover Picture URL</label>
              <input type="url" id="posterUrl" name="posterUrl" value="${this.mediaItem.posterUrl || ''}" />
            </div>

            <div class="form-group">
              <label for="status">Status *</label>
              <select id="status" name="status" required>
                <option value="Watching" ${this.mediaItem.status === 'Watching' ? 'selected' : ''}>Watching</option>
                <option value="Completed" ${this.mediaItem.status === 'Completed' ? 'selected' : ''}>Completed</option>
                <option value="On-Hold" ${this.mediaItem.status === 'On-Hold' ? 'selected' : ''}>On-Hold</option>
                <option value="Dropped" ${this.mediaItem.status === 'Dropped' ? 'selected' : ''}>Dropped</option>
                <option value="Plan to Watch" ${this.mediaItem.status === 'Plan to Watch' ? 'selected' : ''}>Plan to Watch</option>
              </select>
            </div>

            <div id="progressFieldsContainer">
              <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-weight: 500; font-size: 0.9rem;">Progress</label>
              ${renderProgressFields(this.mediaItem.type, this.mediaItem.progress)}
            </div>

            <div class="form-group">
              <label for="rating">Rating (0-10)</label>
              <input type="number" id="rating" name="rating" min="0" max="10" step="0.1" value="${this.mediaItem.rating || ''}" />
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" id="closeModal">Cancel</button>
              <button type="submit" class="btn-submit" id="submitBtn">Update</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const backBtn = this.querySelector('#backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.router.navigate('/home');
      });
    }

    const editBtn = this.querySelector('#editBtn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.showEditModal = true;
        this.render();
      });
    }

    const deleteBtn = this.querySelector('#deleteBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        this.handleDelete();
      });
    }

    const closeModalBtn = this.querySelector('#closeModal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        this.showEditModal = false;
        this.render();
      });
    }

    const modalOverlay = this.querySelector('.modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.showEditModal = false;
          this.render();
        }
      });
    }

    const editForm = this.querySelector('#editForm');
    if (editForm) {
      editForm.addEventListener('submit', async (e) => {
        await this.handleUpdate(e);
      });

      const typeSelect = editForm.querySelector('#type');
      if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
          const newType = e.target.value;
          const container = editForm.querySelector('#progressFieldsContainer');
          if (container) {
            container.innerHTML = `
              <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-weight: 500; font-size: 0.9rem;">Progress</label>
              ${renderProgressFields(newType, this.mediaItem.progress)}
            `;
          }
        });
      }
    }
  }
}

customElements.define('media-detail-view', MediaDetailView);
