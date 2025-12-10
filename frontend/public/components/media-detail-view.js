import authService from '../js/services/auth.service.js';
import ReviewService from '../js/services/review.service.js';
import { extractProgressFromForm, renderProgressFields, formatProgress } from '../js/utils/progress-fields.js';

const reviewService = new ReviewService();

class MediaDetailView extends HTMLElement {
  constructor() {
    super();
    this.mediaItem = null;
    this.publicReviews = [];
    this.myReview = null;
    this.showEditModal = false;
    this.showReviewModal = false;
    this.isLoadingReviews = false;
  }

  async connectedCallback() {
    const watchlistId = this.getAttribute('media-id');
    if (watchlistId) {
      await this.loadMediaDetail(watchlistId);
    }
    this.render();
  }

  async loadMediaDetail(watchlistId) {
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
        this.mediaItem = watchlist.find(item => item._id === watchlistId);

        if (this.mediaItem && this.mediaItem.mediaId) {
          this.loadPublicReviews(this.mediaItem.mediaId);
        }
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
    }
  }

  async loadPublicReviews(globalMediaId) {
    this.isLoadingReviews = true;
    this.render();
    try {
      this.publicReviews = await reviewService.getReviewsByMediaId(globalMediaId);


      const currentUser = authService.getUser();
      if (currentUser && this.publicReviews.length > 0) {

        this.myReview = this.publicReviews.find(r => {
          const reviewUserId = r.userId._id || r.userId;
          return reviewUserId === currentUser.id || reviewUserId === currentUser._id;
        });
      } else {
        this.myReview = null;
      }


    } catch (error) {
      console.error("Error cargando reviews:", error);
    } finally {
      this.isLoadingReviews = false;
      this.render();
    }
  }


  async handleSaveReview(e) {
    e.preventDefault();

    if (!this.mediaItem.mediaId) {
      alert("Error: Ítem sin vinculación global. Edita el ítem primero.");
      return;
    }

    const formData = new FormData(e.target);
    const submitBtn = this.querySelector('#submitReviewBtn');

    const reviewData = {
      mediaId: this.mediaItem.mediaId,
      title: formData.get('title'),
      body: formData.get('body'),
      rating: Number(formData.get('rating'))
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    try {
      const token = authService.getToken();
      let response;

      if (this.myReview) {

        response = await fetch(`http://localhost:3000/api/reviews/${this.myReview._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(reviewData)
        });
      } else {

        response = await fetch('http://localhost:3000/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(reviewData)
        });
      }

      if (response.ok) {
        this.showReviewModal = false;

        await this.loadPublicReviews(this.mediaItem.mediaId);
      } else {
        const err = await response.json();
        alert(err.message || 'Error al guardar review');
      }

    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      this.render();
    }
  }


  async handleUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updateData = {
      mediaId: this.mediaItem.mediaId,
      mediaName: formData.get('mediaName'),
      type: formData.get('type'),
      platform: formData.get('platform'),
      status: formData.get('status'),
      rating: parseFloat(formData.get('rating')),
      link: formData.get('link'),
      posterUrl: formData.get('posterUrl'),
      progress: extractProgressFromForm(formData, formData.get('type'))
    };

    try {
      const token = authService.getToken();
      const res = await fetch(`http://localhost:3000/api/media/watchlist/${this.mediaItem._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) { this.showEditModal = false; await this.loadMediaDetail(this.mediaItem._id); this.render(); }
    } catch (error) { console.error(error); }
  }

  async handleDelete() {
    if (!confirm('¿Eliminar?')) return;
    const token = authService.getToken();
    await fetch(`http://localhost:3000/api/media/watchlist/${this.mediaItem._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    window.router.navigate('/home');
  }

  renderReviewsSection() {
    if (this.isLoadingReviews) return '<p style="color:#888;">Cargando opiniones...</p>';

    const reviewsHtml = (!this.publicReviews || this.publicReviews.length === 0)
      ? `<div class="empty-reviews"><p>No hay opiniones públicas aún.</p></div>`
      : `<div class="reviews-grid">
            ${this.publicReviews.map(review => `
                <div class="review-card" style="${this.myReview && this.myReview._id === review._id ? 'border-color: #58a6ff;' : ''}">
                    <div class="review-header">
                        <span class="user-name">
                            ${review.userId?.displayName || 'Usuario'}
                            ${this.myReview && this.myReview._id === review._id ? '<span style="color:#58a6ff; margin-left:5px;">(Tú)</span>' : ''}
                        </span>
                        <span class="review-rating">★ ${review.rating}/10</span>
                    </div>
                    ${review.title ? `<h4 class="review-title">${review.title}</h4>` : ''}
                    <p class="review-body">"${review.body || ''}"</p>
                </div>
            `).join('')}
           </div>`;

    const btnText = this.myReview ? '✎ Editar mi Review' : '+ Escribir Review';
    const btnClass = this.myReview ? 'btn-edit-review' : 'btn-primary-small';

    return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
             <h2>Opiniones de la Comunidad</h2>
             <button id="openReviewModalBtn" class="${btnClass}">${btnText}</button>
        </div>
        ${reviewsHtml}
      `;
  }

  renderReviewModal() {
    const titleVal = this.myReview ? this.myReview.title : '';
    const bodyVal = this.myReview ? this.myReview.body : '';
    const ratingVal = this.myReview ? this.myReview.rating : '';
    const modalTitle = this.myReview ? 'Editar tu Review' : 'Escribir Review';
    const btnText = this.myReview ? 'Actualizar' : 'Publicar';

    return `
      <div class="modal-overlay review-overlay">
        <div class="modal">
          <h2>${modalTitle}</h2>
          <form id="addReviewForm">
            <div class="form-group">
              <label>Título (Opcional)</label>
              <input type="text" name="title" value="${titleVal}" placeholder="Ej: Obra maestra..." />
            </div>
            <div class="form-group">
              <label>Nota (1-10)</label>
              <input type="number" name="rating" min="1" max="10" required value="${ratingVal}" />
            </div>
            <div class="form-group">
              <label>Opinión</label>
              <textarea name="body" rows="4" required style="width:100%; background:#0d1117; color:white; border-radius:6px; border:1px solid #333;">${bodyVal}</textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" id="closeReviewModal">Cancelar</button>
              <button type="submit" class="btn-submit" id="submitReviewBtn">${btnText}</button>
            </div>
          </form>
        </div>
      </div>
      `;
  }

  renderEditModal() {
    return `
      <div class="modal-overlay edit-overlay">
        <div class="modal">
          <h2>Editar Detalles</h2>
          <form id="editForm">
            <div class="form-group"><label>Título</label><input type="text" name="mediaName" required value="${this.mediaItem.mediaName}" /></div>
            <div class="form-group"><label>Tipo</label>
              <select name="type" required>
                <option value="Series" ${this.mediaItem.type === 'Series' ? 'selected' : ''}>Series</option>
                <option value="Movie" ${this.mediaItem.type === 'Movie' ? 'selected' : ''}>Movie</option>
                <option value="Manga" ${this.mediaItem.type === 'Manga' ? 'selected' : ''}>Manga</option>
                <option value="Book" ${this.mediaItem.type === 'Book' ? 'selected' : ''}>Book</option>
                <option value="Article" ${this.mediaItem.type === 'Article' ? 'selected' : ''}>Article</option>
              </select>
            </div>
            <div class="form-group"><label>Plataforma</label><input type="text" name="platform" value="${this.mediaItem.platform || ''}" /></div>
            <div class="form-group"><label>Poster URL</label><input type="url" name="posterUrl" value="${this.mediaItem.posterUrl || ''}" /></div>
            <div class="form-group"><label>Estado</label>
              <select name="status" required>
                <option value="Watching" ${this.mediaItem.status === 'Watching' ? 'selected' : ''}>Watching</option>
                <option value="Completed" ${this.mediaItem.status === 'Completed' ? 'selected' : ''}>Completed</option>
                <option value="On-Hold" ${this.mediaItem.status === 'On-Hold' ? 'selected' : ''}>On-Hold</option>
                <option value="Dropped" ${this.mediaItem.status === 'Dropped' ? 'selected' : ''}>Dropped</option>
                <option value="Plan to Watch" ${this.mediaItem.status === 'Plan to Watch' ? 'selected' : ''}>Plan to Watch</option>
              </select>
            </div>
            <div class="form-group"><label>Mi Nota (0-10)</label><input type="number" name="rating" min="0" max="10" step="0.1" value="${this.mediaItem.rating || ''}" /></div>
            <div class="form-actions"><button type="button" class="btn-cancel" id="closeModal">Cancelar</button><button type="submit" class="btn-submit" id="submitBtn">Actualizar</button></div>
          </form>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.mediaItem) return;

    this.innerHTML = `
      <style>
        .media-detail-container { max-width: 1200px; margin: 0 auto; padding: 2rem; color: white; }
        .back-button { cursor: pointer; color: white; background: none; border: 1px solid #444; padding: 10px; border-radius: 6px; margin-bottom: 20px;}
        .media-header { display: grid; grid-template-columns: 250px 1fr; gap: 2rem; background: #1f2428; border-radius: 12px; padding: 2rem; }
        .media-poster-large { width: 100%; border-radius: 8px; }
        .media-info { display: flex; flex-direction: column; gap: 1rem; }
        
        .btn-primary-small { background: #238636; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
        .btn-edit-review { background: #1f6feb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
        
        .review-card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 15px; margin-bottom: 10px; }
        .review-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: #1f2428; padding: 2rem; border-radius: 12px; width: 400px; }
        .btn-edit { background: #2563eb; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; }
        .btn-delete { color: #ef4444; border: 1px solid #ef4444; background: none; padding: 10px; border-radius: 6px; cursor: pointer; }
        
        /* Form styles */
        .form-group { margin-bottom: 15px; }
        .form-group label { display:block; margin-bottom:5px; color:#8b949e; }
        .form-group input, .form-group select { width:100%; padding:8px; background:#0d1117; border:1px solid #30363d; color:white; border-radius:6px; box-sizing: border-box;}
        .form-actions { display:flex; gap:10px; margin-top:20px; }
        .btn-submit { flex:1; background:#238636; color:white; border:none; padding:10px; border-radius:6px; cursor:pointer; }
        .btn-cancel { flex:1; background:transparent; border:1px solid #30363d; color:white; padding:10px; border-radius:6px; cursor:pointer; }
      </style>

      <div class="media-detail-container">
        <button class="back-button" id="backBtn">← Volver</button>
        <div class="media-header">
          <img src="${this.mediaItem.posterUrl || 'https://placehold.co/250x375'}" class="media-poster-large" />
          <div class="media-info">
            <h1>${this.mediaItem.mediaName}</h1>
            <p>Estado: ${this.mediaItem.status} | Mi Nota: ${this.mediaItem.rating || '-'}/10</p>
            <div style="display:flex; gap:10px;">
                <button class="btn-edit" id="editBtn">Editar Datos</button>
                <button class="btn-delete" id="deleteBtn">Eliminar</button>
            </div>
          </div>
        </div>

        <div class="reviews-section">
            ${this.renderReviewsSection()}
        </div>

        ${this.showEditModal ? this.renderEditModal() : ''}
        ${this.showReviewModal ? this.renderReviewModal() : ''}
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    this.querySelector('#backBtn')?.addEventListener('click', () => window.router.navigate('/home'));
    this.querySelector('#editBtn')?.addEventListener('click', () => { this.showEditModal = true; this.render(); });
    this.querySelector('#deleteBtn')?.addEventListener('click', () => this.handleDelete());

    this.querySelector('#closeModal')?.addEventListener('click', () => { this.showEditModal = false; this.render(); });
    this.querySelector('#closeReviewModal')?.addEventListener('click', () => { this.showReviewModal = false; this.render(); });

    this.querySelector('#openReviewModalBtn')?.addEventListener('click', () => { this.showReviewModal = true; this.render(); });

    this.querySelector('#addReviewForm')?.addEventListener('submit', (e) => this.handleSaveReview(e));
    this.querySelector('#editForm')?.addEventListener('submit', (e) => this.handleUpdate(e));
  }
}

customElements.define('media-detail-view', MediaDetailView);