import mediaService from '../js/services/media.service.js';

class ListCreateWizard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._resetState();
    }

    _resetState() {
        this.step = 1;
        this.listDetails = { name: '', description: '', visibility: 'private' };
        this.selectedMedia = new Map(); 
        this.searchResults = [];
        this.searchQuery = '';
        this.searchDebounce = null;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: none; }
                :host([open]) { display: flex; align-items: center; justify-content: center; position: fixed; inset: 0; background-color: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); z-index: 1000; animation: fadeIn 0.3s ease forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                .wizard-container { width: 90%; max-width: 1200px; height: 85vh; display: flex; flex-direction: column; color: var(--text-primary); background-color: var(--background-secondary); border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 20px 50px rgba(0,0,0,0.3); overflow: hidden; }
                .wizard-header { padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
                .wizard-header h2 { margin: 0; font-size: 1.25rem; }
                .wizard-header .steps { color: var(--text-secondary); font-weight: 500;}
                .wizard-body { flex-grow: 1; padding: 1.5rem 2rem; overflow-y: auto; background-color: var(--background-primary); }
                .wizard-footer { padding: 1.25rem 2rem; display: flex; justify-content: flex-end; align-items: center; gap: 1rem; border-top: 1px solid var(--border-color); flex-shrink: 0; }
                
                .btn { padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all .2s ease; border: 1px solid var(--border-color); }
                .btn-primary { background: var(--primary-color); color: white; border-color: var(--primary-color); }
                .btn-secondary { background: transparent; color: var(--text-secondary); }
                .btn:disabled { opacity: 0.5; cursor: not-allowed; }

                input, textarea, select { width: 100%; padding: 0.75rem 1rem; background: var(--background-primary); border: 1px solid #475569; border-radius: 8px; color: var(--text-primary); font-size: 1rem; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
                input:focus, textarea:focus, select:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); }

                .form-step-container { display: flex; justify-content: center; padding: 2rem 0; }
                .form-step { width: 100%; max-width: 550px; }
                .form-group { margin-bottom: 1.5rem; }
                label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem; }

                .media-step { display: flex; gap: 1.5rem; height: 100%; overflow: hidden; }
                
                .search-panel {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    min-width: 0;
                    overflow: hidden;
                }
                #media-search { padding: 0.8rem 1.25rem; font-size: 1rem; flex-shrink: 0; }

                .media-grid {
                    flex: 1;
                    min-height: 0;
                    overflow-y: auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    grid-auto-rows: max-content;
                    gap: 1rem;
                    padding-right: 0.5rem;
                    align-content: start;
                }
                    
                .media-card { aspect-ratio: 2 / 3; border-radius: 8px; background-size: cover; background-position: center; position: relative; cursor: pointer; overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease; border: 2px solid transparent; }
                .media-card.selected { border-color: var(--primary-color); }

                .media-card:hover { box-shadow: 0 10px 25px rgba(0,0,0,0.4); z-index: 10; }
                .media-card:not(.selected):hover { transform: scale(1.05); }
                
                .media-card .overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent 50%); display: flex; align-items: flex-end; padding: 0.75rem; }
                .media-card .title { font-weight: 600; font-size: 0.9rem; }
                .media-card .selection-indicator { position: absolute; top: 10px; right: 10px; width: 24px; height: 24px; background-color: var(--primary-color); border-radius: 50%; display: none; align-items: center; justify-content: center; color: white; }
                .media-card.selected .selection-indicator { display: flex; }
                
                .selection-panel { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; background-color: var(--background-secondary); border-radius: 12px; padding: 1rem; overflow: hidden; border: 1px solid var(--border-color); }
                .selection-panel h4 { margin: 0 0 1rem 0; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; font-weight: 600; }
                .selected-list { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; padding-right: 0.5rem; }
                .selected-media-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 6px; background-color: var(--background-primary); border: 1px solid #475569; }
                .selected-media-poster { width: 40px; height: 60px; object-fit: cover; border-radius: 4px; flex-shrink: 0; }
                .selected-media-name { flex-grow: 1; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .remove-selected-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 0.25rem; border-radius: 50%; display: flex; transition: all 0.2s ease; }
                .remove-selected-btn:hover { color: var(--error); background-color: rgba(239, 68, 68, 0.1); }
                .placeholder { font-size: 0.9rem; color: var(--text-secondary); text-align: center; margin-top: 2rem; }

                .wizard-body::-webkit-scrollbar, .media-grid::-webkit-scrollbar, .selected-list::-webkit-scrollbar { width: 8px; }
                .wizard-body::-webkit-scrollbar-track, .media-grid::-webkit-scrollbar-track, .selected-list::-webkit-scrollbar-track { background: transparent; }
                .wizard-body::-webkit-scrollbar-thumb, .media-grid::-webkit-scrollbar-thumb, .selected-list::-webkit-scrollbar-thumb { background-color: #475569; border-radius: 10px; border: 2px solid var(--background-primary); }
                .wizard-body::-webkit-scrollbar-thumb:hover, .media-grid::-webkit-scrollbar-thumb:hover, .selected-list::-webkit-scrollbar-thumb:hover { background-color: #64748b; }
            </style>
            <div class="wizard-container">
                ${this.renderHeader()}
                <div class="wizard-body">
                    ${this.step === 1 ? this.renderStep1() : this.renderStep2()}
                </div>
                ${this.renderFooter()}
            </div>
        `;
        this._addEventListeners();
    }

    renderHeader() { return `<header class="wizard-header"><h2>Create a New List</h2><span class="steps">Step ${this.step} of 2</span></header>`; }
    
    renderFooter() {
        const nextDisabled = this.step === 1 && !this.listDetails.name.trim();
        const finishText = this.selectedMedia.size > 0 ? `Create List (${this.selectedMedia.size} items)` : 'Create List';
        return `<footer class="wizard-footer"><button class="btn btn-secondary" id="action-btn">${this.step === 1 ? 'Cancel' : 'Back'}</button><button class="btn btn-primary" id="next-finish-btn" ${nextDisabled ? 'disabled' : ''}>${this.step === 1 ? 'Next' : finishText}</button></footer>`;
    }

    renderStep1() {
        return `<div class="form-step-container"><div class="form-step"><div class="form-group"><label for="name">List Name</label><input type="text" id="name" value="${this.listDetails.name}" required placeholder="e.g., Epic Sci-Fi Movies"></div><div class="form-group"><label for="description">Description</label><textarea id="description" rows="4" placeholder="A short description of what this list is about.">${this.listDetails.description}</textarea></div><div class="form-group"><label for="visibility">Visibility</label><select id="visibility"><option value="private" ${this.listDetails.visibility === 'private' ? 'selected' : ''}>Private</option><option value="public" ${this.listDetails.visibility === 'public' ? 'selected' : ''}>Public</option></select></div></div></div>`;
    }

    renderStep2() {
        const selectedItemsHtml = Array.from(this.selectedMedia.values()).map(media => `
            <div class="selected-media-item" data-media-id="${media._id}">
                <img src="${media.poster}" alt="${media.name}" class="selected-media-poster">
                <span class="selected-media-name">${media.name}</span>
                <button type="button" class="remove-selected-btn" title="Remove">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `).join('');

        const searchResultsHtml = this.searchResults.map(media => `
            <div class="media-card ${this.selectedMedia.has(media._id) ? 'selected' : ''}" style="background-image: url('${media.poster}')" data-media-id="${media._id}">
                <div class="overlay"><span class="title">${media.name}</span></div>
                <div class="selection-indicator">&#10003;</div>
            </div>
        `).join('');

        return `
            <div class="media-step">
                <div class="search-panel">
                    <input type="search" id="media-search" value="${this.searchQuery}" placeholder="Search for media to add..." autofocus>
                    <div class="media-grid">
                        ${searchResultsHtml || (this.searchQuery ? '<p class="placeholder">No results found.</p>' : '<p class="placeholder">Search results will appear here.</p>')}
                    </div>
                </div>
                <div class="selection-panel">
                    <h4>Selected Items (${this.selectedMedia.size})</h4>
                    <div class="selected-list">
                        ${selectedItemsHtml || '<p class="placeholder">Click on an item to add it to your list.</p>'}
                    </div>
                </div>
            </div>
        `;
    }

    _addEventListeners() {
        this.shadowRoot.querySelector('#action-btn')?.addEventListener('click', () => { this.step === 1 ? this.close() : (this.step = 1, this.render()); });
        this.shadowRoot.querySelector('#next-finish-btn')?.addEventListener('click', () => { if (this.step === 1) { this.listDetails.name = this.shadowRoot.querySelector('#name').value; this.listDetails.description = this.shadowRoot.querySelector('#description').value; this.listDetails.visibility = this.shadowRoot.querySelector('#visibility').value; this.step = 2; this.render(); } else { const listData = { ...this.listDetails, items: Array.from(this.selectedMedia.keys()).map(id => ({ mediaId: id })) }; this.dispatchEvent(new CustomEvent('save', { detail: listData })); this.close(); } });
        
        const searchInput = this.shadowRoot.querySelector('#media-search');
        searchInput?.addEventListener('input', (e) => { this.searchQuery = e.target.value; clearTimeout(this.searchDebounce); this.searchDebounce = setTimeout(async () => { this.searchResults = await mediaService.searchMedia(this.searchQuery); this.render(); const newSearchInput = this.shadowRoot.querySelector('#media-search'); newSearchInput?.focus(); newSearchInput?.setSelectionRange(this.searchQuery.length, this.searchQuery.length); }, 350); });
        this.shadowRoot.querySelector('#name')?.addEventListener('input', (e) => { this.listDetails.name = e.target.value; this.shadowRoot.querySelector('#next-finish-btn').disabled = !this.listDetails.name.trim(); });

        this.shadowRoot.querySelector('.wizard-body')?.addEventListener('click', (e) => {
            const mediaCard = e.target.closest('.media-card');
            const removeBtn = e.target.closest('.remove-selected-btn');

            if (mediaCard) {
                const mediaId = mediaCard.dataset.mediaId;
                if (this.selectedMedia.has(mediaId)) {
                    this.selectedMedia.delete(mediaId);
                } else {
                    const mediaObject = this.searchResults.find(m => m._id === mediaId);
                    if (mediaObject) this.selectedMedia.set(mediaId, mediaObject);
                }
                this.render();
                this.shadowRoot.querySelector('#media-search')?.focus();
            }

            if (removeBtn) {
                const mediaId = removeBtn.closest('.selected-media-item').dataset.mediaId;
                if (mediaId && this.selectedMedia.has(mediaId)) {
                    this.selectedMedia.delete(mediaId);
                    this.render();
                    this.shadowRoot.querySelector('#media-search')?.focus();
                }
            }
        });
    }

    open() { this._resetState(); this.render(); this.setAttribute('open', ''); }
    close() { this.removeAttribute('open'); }
}

customElements.define('list-create-wizard', ListCreateWizard);