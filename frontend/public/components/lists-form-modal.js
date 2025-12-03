import './lists-modal-dialog.js';
import mediaService from '../js/services/media.service.js';

class ListFormModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        // --- Estado interno del componente ---
        this._listData = null;
        this._items = [];
        this._mode = 'create';
        this._isMediaSelectorOpen = false;
        this._searchResults = [];
        this._searchDebounceTimeout = null;
    }

    connectedCallback() {
        // 1. Renderizar el "esqueleto" del modal UNA SOLA VEZ.
        this.shadowRoot.innerHTML = `
            <style>:host{--form-spacing:1.25rem}.form-group{margin-bottom:var(--form-spacing)}.label{display:block;margin-bottom:.5rem;color:var(--text-secondary);font-weight:500;font-size:.875rem}input,textarea,select{width:100%;padding:.65rem 1rem;background-color:var(--background-primary);border:1px solid #475569;border-radius:8px;color:var(--text-primary);font-size:1rem;transition:all .2s ease;box-sizing:border-box}input:focus,textarea:focus,select:focus{outline:0;border-color:var(--primary-color);box-shadow:0 0 0 3px rgba(99,102,241,.2)}textarea{resize:vertical;min-height:80px;font-family:inherit}select{appearance:none;background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");background-position:right .75rem center;background-repeat:no-repeat;background-size:1.25em}.items-section{margin-top:calc(var(--form-spacing) * 1.5);padding-top:var(--form-spacing);border-top:1px solid var(--border-color)}.items-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}.items-header h4{margin:0;color:var(--text-primary);font-weight:600;font-size:1rem}.items-list-container{display:flex;flex-direction:column;gap:.5rem}.media-item{display:flex;align-items:center;justify-content:space-between;padding:.5rem;border-radius:6px;background-color:var(--background-primary)}.media-info{display:flex;align-items:center;gap:1rem;min-width:0}.media-poster{width:36px;height:54px;object-fit:cover;border-radius:4px;flex-shrink:0}.media-name{font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.remove-item-btn{background:0 0;border:none;color:var(--text-secondary);cursor:pointer;padding:.25rem;border-radius:50%;display:flex;transition:all .2s ease}.remove-item-btn:hover{color:var(--error);background-color:rgba(239,68,68,.1)}.btn{padding:.75rem 1.5rem;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;transition:all .2s ease;text-align:center;width:100%;margin-top:1rem}.btn-primary{background:var(--primary-color);color:#fff}.btn-primary:hover{background:var(--primary-dark)}.btn-secondary{background:var(--background-tertiary);color:var(--text-primary);padding:.5rem 1rem;font-size:.875rem;width:auto;margin:0}.btn-secondary:hover{opacity:.9}.media-selector-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:10;display:flex;align-items:center;justify-content:center}.media-selector{width:90%;max-width:450px;background:var(--background-secondary);border-radius:8px;box-shadow:0 5px 15px rgba(0,0,0,.3);display:flex;flex-direction:column;max-height:70vh}.media-selector-header{padding:1rem;border-bottom:1px solid var(--border-color);font-weight:600}.media-selector-list{overflow-y:auto;padding:.5rem}.media-selector-item{display:flex;align-items:center;gap:1rem;padding:.75rem;border-radius:6px;cursor:pointer}.media-selector-item:hover{background:var(--background-tertiary)}.media-selector-item input[type=checkbox]{width:18px;height:18px}.media-selector-footer{padding:1rem;border-top:1px solid var(--border-color);display:flex;justify-content:flex-end;gap:.5rem}</style>
            <modal-dialog id="form-modal">
                <span slot="header" id="modal-title"></span>
                <div slot="body" id="modal-content"></div>
            </modal-dialog>
        `;

        // 2. Usar delegación de eventos en el shadowRoot para manejar todas las interacciones.
        this.shadowRoot.addEventListener('submit', this._onSubmit.bind(this));
        this.shadowRoot.addEventListener('click', this._handleClicks.bind(this));
        this.shadowRoot.addEventListener('input', this._handleInputs.bind(this));
    }

    _renderContent() {
        const title = this._mode === 'create' ? 'Create New List' : 'Edit List';
        const buttonText = this._mode === 'create' ? 'Create List' : 'Save Changes';

        const titleEl = this.shadowRoot.getElementById('modal-title');
        const contentEl = this.shadowRoot.getElementById('modal-content');

        if (titleEl) titleEl.textContent = title;
        if (!contentEl) return;

        // 3. Este método solo actualiza el CONTENIDO, no el modal en sí.
        contentEl.innerHTML = `
            <form id="list-form">
                <div class="form-group"><label for="name" class="label">Name</label><input type="text" id="name" name="name" value="${this._listData?.name || ''}" required></div>
                <div class="form-group"><label for="description" class="label">Description</label><textarea id="description" name="description">${this._listData?.description || ''}</textarea></div>
                <div class="form-group"><label for="visibility" class="label">Visibility</label><select id="visibility" name="visibility"><option value="private" ${this._listData?.visibility !== 'public' ? 'selected' : ''}>Private</option><option value="public" ${this._listData?.visibility === 'public' ? 'selected' : ''}>Public</option></select></div>
                ${this._renderItemsSection()}
                <button type="submit" class="btn btn-primary">${buttonText}</button>
                ${this._isMediaSelectorOpen ? this._renderMediaSelector() : ''}
            </form>
        `;
    }

    _renderItemsSection() {
        const itemsHtml = this._items.map(item => {
            const media = item.mediaId;
            return `<div class="media-item" data-media-id="${media._id}"><div class="media-info"><img src="${media.poster}" alt="${media.name}" class="media-poster"><span class="media-name">${media.name}</span></div><button type="button" class="remove-item-btn" title="Remove from list"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div>`
        }).join('');
        return `<div class="items-section"><div class="items-header"><h4>Items in list</h4><button type="button" class="btn btn-secondary add-item-btn">Add Media</button></div><div class="items-list-container">${itemsHtml || '<p style="font-size: 0.9rem; color: var(--text-secondary);">No items yet. Click "Add Media" to get started.</p>'}</div></div>`;
    }

    _renderMediaSelector() {
        const currentItemIds = new Set(this._items.map(item => item.mediaId._id));
        const resultsHtml = this._searchResults.filter(media => !currentItemIds.has(media._id)).map(media => `<div class="media-selector-item" data-media='${JSON.stringify(media)}'><img src="${media.poster}" class="media-poster" /><span class="media-name">${media.name}</span></div>`).join('');
        return `<div class="media-selector-overlay"><div class="media-selector"><div class="media-selector-header"><input type="search" id="media-search-input" placeholder="Search for movies, series..." style="width: 100%;"></div><div class="media-selector-list">${resultsHtml}</div><div class="media-selector-footer"><button type="button" class="btn btn-secondary cancel-selection-btn">Close</button></div></div></div>`;
    }

    _handleClicks(e) {
        const target = e.target;
        if (target.matches('.add-item-btn')) {
            this._isMediaSelectorOpen = true;
            this._renderContent();
            this.shadowRoot.querySelector('#media-search-input')?.focus();
        } else if (target.matches('.cancel-selection-btn')) {
            this._isMediaSelectorOpen = false;
            this._renderContent();
        } else if (target.closest('.media-selector-item')) {
            const mediaData = JSON.parse(target.closest('.media-selector-item').dataset.media);
            this._items.push({ mediaId: mediaData });
            this._isMediaSelectorOpen = false;
            this._renderContent();
        } else if (target.closest('.remove-item-btn')) {
            const mediaIdToRemove = target.closest('.media-item').dataset.mediaId;
            this._items = this._items.filter(item => item.mediaId._id !== mediaIdToRemove);
            this._renderContent();
        }
    }

    _handleInputs(e) {
        if (e.target.matches('#media-search-input')) {
            clearTimeout(this._searchDebounceTimeout);
            this._searchDebounceTimeout = setTimeout(async () => {
                const query = e.target.value;
                this._searchResults = await mediaService.searchMedia(query);
                this._renderContent();
                e.target.focus();
            }, 300);
        }
    }

    _onSubmit(e) {
        if (e.target.id !== 'list-form') return;
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.id = this._listData?._id;
        data.items = this._items.map(item => ({ mediaId: item.mediaId._id }));
        this.dispatchEvent(new CustomEvent('save', { detail: data }));
        this.hide();
    }

    openForCreate() {
        this._mode = 'create';
        this._listData = null;
        this._items = [];
        this._isMediaSelectorOpen = false; // <-- LA CORRECCIÓN CLAVE: resetear estado
        this._searchResults = [];
        this._renderContent();
        this.shadowRoot.querySelector('#form-modal').show();
    }

    openForEdit(list) {
        this._mode = 'edit';
        this._listData = list;
        this._items = list.items || [];
        this._isMediaSelectorOpen = false; // <-- LA CORRECCIÓN CLAVE: resetear estado
        this._searchResults = [];
        this._renderContent();
        this.shadowRoot.querySelector('#form-modal').show();
    }

    hide() {
        this.shadowRoot.querySelector('#form-modal').hide();
    }
}

customElements.define('list-form-modal', ListFormModal);