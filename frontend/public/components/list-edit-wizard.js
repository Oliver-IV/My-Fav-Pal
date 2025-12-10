import './lists-modal-dialog.js';
import mediaService from '../js/services/media.service.js';

class ListEditWizard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._resetState();
    }

    _resetState() {
        this.listData = null;
        this.selectedMedia = new Map();
        this.searchResults = [];
        this.searchQuery = '';
        this.searchDebounce = null;
        this.hasChanges = false;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                
                .edit-container {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 2rem;
                    height: 75vh;
                    overflow: hidden;
                }
                
                .left-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    overflow-y: auto;
                    padding-right: 1rem;
                }
                
                .form-section {
                    background: var(--background-secondary);
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                }
                
                .form-section h3 {
                    margin: 0 0 1rem 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .form-group {
                    margin-bottom: 1rem;
                }
                
                .form-group:last-child {
                    margin-bottom: 0;
                }
                
                label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                
                input, textarea, select {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: var(--background-primary);
                    border: 1px solid #475569;
                    border-radius: 8px;
                    color: var(--text-primary);
                    font-size: 1rem;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                }
                
                input:focus, textarea:focus, select:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
                }
                
                textarea {
                    resize: vertical;
                    min-height: 100px;
                    font-family: inherit;
                }
                
                .right-panel {
                    display: flex;
                    flex-direction: column;
                    background: var(--background-secondary);
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                    overflow: hidden;
                }
                
                .media-manager {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                
                .media-manager-header {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                    flex-shrink: 0;
                }
                
                .media-manager-header h3 {
                    margin: 0 0 1rem 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                }
                
                #media-search {
                    width: 100%;
                    padding: 0.7rem 1rem;
                    font-size: 0.95rem;
                }
                
                .media-tabs {
                    display: flex;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    background: var(--background-primary);
                    border-bottom: 1px solid var(--border-color);
                    flex-shrink: 0;
                }
                
                .tab-btn {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: none;
                    border-radius: 6px;
                    color: var(--text-secondary);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.9rem;
                }
                
                .tab-btn.active {
                    background: var(--background-secondary);
                    color: var(--primary-color);
                }
                
                .tab-btn:hover:not(.active) {
                    background: var(--background-tertiary);
                    color: var(--text-primary);
                }
                
                .media-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                }
                
                .media-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 0.75rem;
                    grid-auto-rows: max-content;
                    align-content: start;
                }
                
                .media-card {
                    position: relative;
                    aspect-ratio: 2 / 3;
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    border: 2px solid transparent;
                }
                
                .media-card:hover {
                    transform: scale(1.05);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
                }
                
                .media-card.in-list {
                    border-color: var(--primary-color);
                    opacity: 0.6;
                }
                
                .media-card.in-list::after {
                    content: '✓';
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    width: 20px;
                    height: 20px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                }
                
                .media-poster {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .media-title {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 0.5rem;
                    background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 600;
                    line-height: 1.2;
                }
                
                .current-items {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                
                .current-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem;
                    background: var(--background-primary);
                    border-radius: 6px;
                    border: 1px solid #475569;
                }
                
                .current-item-poster {
                    width: 40px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 4px;
                    flex-shrink: 0;
                }
                
                .current-item-name {
                    flex: 1;
                    font-size: 0.85rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .remove-btn {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 50%;
                    display: flex;
                    transition: all 0.2s ease;
                }
                
                .remove-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--error);
                }
                
                .footer-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    padding-top: 1.5rem;
                    margin-top: 1.5rem;
                    border-top: 1px solid var(--border-color);
                }
                
                .btn {
                    padding: 0.7rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                }
                
                .btn-primary:hover {
                    background: var(--primary-dark);
                }
                
                .btn-primary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .btn-secondary {
                    background: var(--background-tertiary);
                    color: var(--text-primary);
                }
                
                .btn-secondary:hover {
                    background: #475569;
                }
                
                .placeholder {
                    text-align: center;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    padding: 2rem 1rem;
                }
                
                .left-panel::-webkit-scrollbar,
                .media-content::-webkit-scrollbar {
                    width: 8px;
                }
                
                .left-panel::-webkit-scrollbar-track,
                .media-content::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .left-panel::-webkit-scrollbar-thumb,
                .media-content::-webkit-scrollbar-thumb {
                    background-color: #475569;
                    border-radius: 10px;
                    border: 2px solid var(--background-primary);
                }
            </style>
            
            <modal-dialog id="edit-modal" size="full">
                <span slot="header">Edit List</span>
                <div slot="body" id="modal-content"></div>
            </modal-dialog>
        `;
    }

    open(listData) {
        this._resetState();
        this.listData = { ...listData };
        this.selectedMedia = new Map(
            (listData.items || []).map(item => [item.mediaId._id, item.mediaId])
        );
        this.renderContent();
        const modal = this.shadowRoot.querySelector('#edit-modal');
        modal.show();
    }

    renderContent() {
        const content = this.shadowRoot.querySelector('#modal-content');
        if (!content) return;

        const currentItemsHtml = Array.from(this.selectedMedia.values())
            .map(media => `
                <div class="current-item">
                    <img src="${media.poster}" alt="${media.name}" class="current-item-poster">
                    <span class="current-item-name">${media.name}</span>
                    <button class="remove-btn" data-media-id="${media._id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `).join('');

        const searchResultsHtml = this.searchResults
            .map(media => {
                const inList = this.selectedMedia.has(media._id);
                return `
                    <div class="media-card ${inList ? 'in-list' : ''}" data-media-id="${media._id}">
                        <img src="${media.poster}" alt="${media.name}" class="media-poster">
                        <div class="media-title">${media.name}</div>
                    </div>
                `;
            }).join('');

        content.innerHTML = `
            <div class="edit-container">
                <div class="left-panel">
                    <div class="form-section">
                        <h3>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            Basic Information
                        </h3>
                        <div class="form-group">
                            <label for="name">List Name</label>
                            <input type="text" id="name" value="${this.listData?.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description">${this.listData?.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="visibility">Visibility</label>
                            <select id="visibility">
                                <option value="private" ${this.listData?.visibility !== 'public' ? 'selected' : ''}>Private</option>
                                <option value="public" ${this.listData?.visibility === 'public' ? 'selected' : ''}>Public</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            Current Items (${this.selectedMedia.size})
                        </h3>
                        <div class="current-items">
                            ${currentItemsHtml || '<p class="placeholder">No items in this list yet.</p>'}
                        </div>
                    </div>
                    
                    <div class="footer-actions">
                        <button class="btn btn-secondary" id="cancel-btn">Cancel</button>
                        <button class="btn btn-primary" id="save-btn">Save Changes</button>
                    </div>
                </div>
                
                <div class="right-panel">
                    <div class="media-manager">
                        <div class="media-manager-header">
                            <h3>Add Media</h3>
                            <input type="search" id="media-search" placeholder="Search movies, series..." autofocus>
                        </div>
                        <div class="media-tabs">
                            <button class="tab-btn active" data-tab="search">Search Results</button>
                        </div>
                        <div class="media-content">
                            <div class="media-grid">
                                ${searchResultsHtml || '<p class="placeholder">Search for media to add to your list.</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this._attachEventListeners();
    }

    _attachEventListeners() {
        const content = this.shadowRoot.querySelector('#modal-content');
        if (!content) return;

        const searchInput = content.querySelector('#media-search');
        searchInput?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            clearTimeout(this.searchDebounce);

            this.searchDebounce = setTimeout(async () => {
                this.searchResults = await mediaService.searchMedia(this.searchQuery);
                this.renderContent();

                const newSearchInput = this.shadowRoot.querySelector('#media-search');
                newSearchInput?.focus();
                newSearchInput?.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
            }, 350);
        });

        content.addEventListener('click', (e) => {
            const mediaCard = e.target.closest('.media-card');
            if (mediaCard && !mediaCard.classList.contains('in-list')) {
                const mediaId = mediaCard.dataset.mediaId;
                const mediaObject = this.searchResults.find(m => m._id === mediaId);

                if (mediaObject) {
                    this.selectedMedia.set(mediaId, mediaObject);
                    this.hasChanges = true;
                    this.renderContent();
                    this.shadowRoot.querySelector('#media-search')?.focus();
                }
            }

            const removeBtn = e.target.closest('.remove-btn');
            if (removeBtn) {
                const mediaId = removeBtn.dataset.mediaId;
                this.selectedMedia.delete(mediaId);
                this.hasChanges = true;
                this.renderContent();
            }

            if (e.target.id === 'save-btn') {
                this.save();
            }

            if (e.target.id === 'cancel-btn') {
                this.close();
            }
        });

        ['#name', '#description', '#visibility'].forEach(selector => {
            content.querySelector(selector)?.addEventListener('input', () => {
                this.hasChanges = true;
            });
        });
    }

    save() {
        const content = this.shadowRoot.querySelector('#modal-content');
        if (!content) return;

        const name = content.querySelector('#name').value.trim();
        const description = content.querySelector('#description').value.trim();
        const visibility = content.querySelector('#visibility').value;

        if (!name) {
            alert('Please enter a list name.');
            return;
        }

        const data = {
            id: this.listData._id,
            name,
            description,
            visibility,
            items: Array.from(this.selectedMedia.keys()).map(id => ({ mediaId: id }))
        };

        this.hasChanges = false;
        this.dispatchEvent(new CustomEvent('save', { detail: data }));
        this.close();
    }

    close() {
        if (this.hasChanges) {
            if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
                return;
            }
        }
        this.shadowRoot.querySelector('#edit-modal').hide();
    }
}

customElements.define('list-edit-wizard', ListEditWizard);