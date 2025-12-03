import listService from '../js/services/lists.service.js';
import './lists-modal-dialog.js';
import './list-create-wizard.js';
import './list-view-detail.js';
import './list-edit-wizard.js';

class ListsView extends HTMLElement {
    constructor() {
        super();
        this.lists = [];
    }

    connectedCallback() {
        this.render();
        this.fetchLists();
    }

    async fetchLists() {
        try {
            const result = await listService.getLists();
            this.lists = result.data;
            // --- LOG 1: VERIFICAR DATOS INICIALES ---
            console.log('1. Lists loaded into the component:', this.lists);
            this.renderLists();
        } catch (error) {
            console.error('Error fetching lists:', error);
            const grid = this.querySelector('#lists-grid');
            if(grid) grid.innerHTML = `<p class="error-message">Could not load your lists. Please try again later.</p>`;
        }
    }

    render() {
        this.innerHTML = `
            <style>
                :host {
                    display: block;
                    height: 100vh;
                    overflow: hidden;
                }
                
                .lists-wrapper {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                
                .lists-header-container {
                    flex-shrink: 0;
                    background: var(--background-primary);
                    border-bottom: 1px solid var(--border-color);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                
                .lists-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                
                .search-filter-bar {
                    padding: 0 2rem 1.5rem 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                
                .scrollable-content {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                }
                
                .lists-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                
                /* Scrollbar personalizada hermosa */
                .scrollable-content::-webkit-scrollbar {
                    width: 10px;
                }
                
                .scrollable-content::-webkit-scrollbar-track {
                    background: var(--background-primary);
                    border-radius: 10px;
                }
                
                .scrollable-content::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #475569 0%, #64748b 100%);
                    border-radius: 10px;
                    border: 2px solid var(--background-primary);
                    transition: background 0.2s ease;
                }
                
                .scrollable-content::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #64748b 0%, #94a3b8 100%);
                }
                
                /* Estilos que ya tenías */
                .list-items-container{max-height:60vh;overflow-y:auto;margin-top:1rem}.media-item{display:flex;align-items:center;gap:1rem;padding:.75rem 0;border-bottom:1px solid var(--border-color)}.media-item:last-child{border-bottom:none}.media-poster{width:50px;height:75px;object-fit:cover;border-radius:4px;background-color:var(--background-tertiary)}.media-details h4{margin:0 0 .25rem;color:var(--text-primary)}.media-details p{margin:0;font-size:.9rem;color:var(--text-secondary);text-transform:capitalize}.list-actions{display:flex;gap:.5rem}.action-btn{background:none;border:none;cursor:pointer;padding:.25rem;color:var(--text-secondary);transition:color .2s ease;display:flex;align-items:center;justify-content:center}.action-btn:hover{color:var(--primary-color)}.action-btn.delete:hover{color:var(--error)}.action-btn svg{pointer-events:none}
            </style>
            <div class="lists-wrapper">
                <div class="lists-header-container">
                    <div class="lists-header">
                        <div><h1>Lists</h1><p>Organize and share your favorite content</p></div>
                        <button id="create-list-btn" class="btn btn-primary">Create New List</button>
                    </div>
                    <div class="search-filter-bar">
                        <div class="search-box">
                            <input type="text" id="list-search" placeholder="Search your lists..."/>
                        </div>
                    </div>
                </div>
                
                <div class="scrollable-content">
                    <div class="lists-container">
                        <div id="lists-grid" class="lists-grid">
                            <p class="loading">Loading lists...</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modales y Asistentes -->
            <list-create-wizard id="list-create-wizard"></list-create-wizard>
            <list-view-detail id="list-view-detail"></list-view-detail>
            <list-edit-wizard id="list-edit-wizard"></list-edit-wizard>
        `;
        this.attachEventListeners();
    }

    renderLists() {
        const grid = this.querySelector('#lists-grid');
        if (!grid) return;
        
        const searchTerm = this.querySelector('#list-search').value.toLowerCase();
        const filteredLists = this.lists.filter(list => list.name.toLowerCase().includes(searchTerm));

        if (filteredLists.length === 0) {
            grid.innerHTML = '<p>No lists found.</p>';
            return;
        }

        grid.innerHTML = filteredLists.map(list => `
            <div class="list-card" data-id="${list._id}">
                <div class="list-card-header">
                    <span class="visibility">${list.visibility === 'public' ? '🌐 Public' : '🔒 Private'}</span>
                    <div class="list-actions">
                        <button class="action-btn" data-action="edit" data-id="${list._id}" title="Edit List"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
                        <button class="action-btn delete" data-action="delete" data-id="${list._id}" title="Delete List"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
                    </div>
                </div>
                <div class="list-card-body" data-action="view" data-id="${list._id}">
                    <h3>${list.name}</h3>
                    <p>${list.description || ''}</p>
                </div>
                <div class="list-card-footer" data-action="view" data-id="${list._id}">
                    <span>${list.items?.length || 0} Items</span>
                    <span style="display: flex; align-items: center; gap: 0.3rem;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>${list.likes?.length || 0}</span>
                </div>
            </div>
        `).join('');
    }

    async openViewModal(listId) {
        try {
            const { data: list } = await listService.getListById(listId);
            const viewDetail = this.querySelector('#list-view-detail');
            if (viewDetail && viewDetail.open) {
                viewDetail.open(list);
            } else {
                console.error('list-view-detail component not found or open method not available');
            }
        } catch (error) {
            console.error('Failed to open list details', error);
            alert('Could not load list details.');
        }
    }

    attachEventListeners() {
        this.addEventListener('click', async (e) => {
            const action = e.target.closest('[data-action]');
            if (!action) return;

            const id = action.dataset.id;

            switch (action.dataset.action) {
                case 'view':
                    this.openViewModal(id);
                    break;
                case 'edit': {
                    const { data: listDetails } = await listService.getListById(id);
                    // --- LOG 2: VERIFICAR DATOS ANTES DE EDITAR ---
                    console.log('2. Data sent to Edit Wizard:', listDetails);
                    const editWizard = this.querySelector('#list-edit-wizard');
                    if (editWizard && editWizard.open) {
                        editWizard.open(listDetails);
                    } else {
                        console.error('list-edit-wizard component not found or open method not available');
                    }
                    break;
                }
                case 'delete':
                    if (confirm('Are you sure you want to delete this list?')) {
                        try {
                            await listService.deleteList(id);
                            this.fetchLists();
                        } catch (error) {
                            console.error('Failed to delete list:', error);
                            alert('Could not delete the list.');
                        }
                    }
                    break;
            }
        });
        
        const createBtn = this.querySelector('#create-list-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                const wizard = this.querySelector('#list-create-wizard');
                if (wizard && wizard.open) {
                    wizard.open();
                } else {
                    console.error('list-create-wizard component not found or open method not available');
                }
            });
        }

        const searchInput = this.querySelector('#list-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderLists());
        }

        // Listener para el evento 'save' del asistente de creación
        const createWizard = this.querySelector('#list-create-wizard');
        if (createWizard) {
            createWizard.addEventListener('save', async (e) => {
                const data = e.detail;
                try {
                    await listService.createList(data);
                    this.fetchLists();
                } catch (error) {
                    console.error('Failed to create list:', error);
                    alert('Could not create the list.');
                }
            });
        }

        // Listener para cuando se hace click en "Edit" desde la vista de detalles
        const viewDetail = this.querySelector('#list-view-detail');
        if (viewDetail) {
            viewDetail.addEventListener('edit', async (e) => {
                const listData = e.detail;
                const editWizard = this.querySelector('#list-edit-wizard');
                if (editWizard && editWizard.open) {
                    editWizard.open(listData);
                }
            });
        }

        // Listener para el evento 'save' del asistente de edición
        const editWizard = this.querySelector('#list-edit-wizard');
        if (editWizard) {
            editWizard.addEventListener('save', async (e) => {
                const eventData = e.detail;
                console.log('3. Data received from Edit Wizard:', eventData);
                try {
                    const { id, ...restOfData } = eventData;

                    const normalizedItems = restOfData.items.map(item => {
                        const mediaIdValue = (typeof item.mediaId === 'object' && item.mediaId !== null)
                            ? item.mediaId._id  
                            : item.mediaId;   
                        
                        return { mediaId: mediaIdValue };
                    });

                    const updatePayload = {
                        ...restOfData,
                        items: normalizedItems
                    };
                    
                    await listService.updateList(id, updatePayload);
                    this.fetchLists();
                } catch (error) {
                    console.error('Failed to update list:', error);
                    alert('Could not update the list.');
                }
            });
        }
    }
}

customElements.define('lists-view', ListsView);