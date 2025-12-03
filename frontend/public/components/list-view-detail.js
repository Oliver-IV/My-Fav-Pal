import './lists-modal-dialog.js';

class ListViewDetail extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.listData = null;
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
                
                .list-header {
                    margin-bottom: 2rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .list-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin: 0 0 0.5rem 0;
                    color: var(--text-primary);
                }
                
                .list-meta {
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                }
                
                .list-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }
                
                .visibility-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.35rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    background: var(--background-tertiary);
                    color: var(--text-secondary);
                }
                
                .visibility-badge.public {
                    background: rgba(99, 102, 241, 0.15);
                    color: var(--primary-color);
                }
                
                .list-description {
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin: 0;
                }
                
                .empty-state {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: var(--text-secondary);
                }
                
                .empty-state svg {
                    width: 64px;
                    height: 64px;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }
                
                .media-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 1.5rem;
                    grid-auto-rows: max-content;
                    align-content: start;
                }
                
                .media-card {
                    position: relative;
                    border-radius: 10px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    background: var(--background-tertiary);
                }
                
                .media-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
                }
                
                .media-poster {
                    width: 100%;
                    aspect-ratio: 2 / 3;
                    object-fit: cover;
                    display: block;
                }
                
                .media-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 60%);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 1rem;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }
                
                .media-card:hover .media-overlay {
                    opacity: 1;
                }
                
                .media-title {
                    font-weight: 600;
                    font-size: 0.95rem;
                    margin: 0 0 0.25rem 0;
                    color: white;
                    line-height: 1.3;
                }
                
                .media-info {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.8);
                    text-transform: capitalize;
                }
                
                .action-buttons {
                    display: flex;
                    gap: 0.75rem;
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--border-color);
                }
                
                .btn {
                    padding: 0.7rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                }
                
                .btn-primary:hover {
                    background: var(--primary-dark);
                    transform: translateY(-1px);
                }
                
                .btn-secondary {
                    background: var(--background-tertiary);
                    color: var(--text-primary);
                }
                
                .btn-secondary:hover {
                    background: #475569;
                }
            </style>
            
            <modal-dialog id="view-modal" size="large">
                <span slot="header">List Details</span>
                <div slot="body" id="modal-content"></div>
            </modal-dialog>
        `;
    }

    open(listData) {
        this.listData = listData;
        this.renderContent();
        const modal = this.shadowRoot.querySelector('#view-modal');
        modal.show();
    }

    renderContent() {
        const content = this.shadowRoot.querySelector('#modal-content');
        if (!content || !this.listData) return;

        const { name, description, visibility, items = [], likes = [] } = this.listData;

        const mediaCardsHtml = items.length > 0
            ? items.map(item => {
                const media = item.mediaId;
                return `
                    <div class="media-card" data-media-id="${media._id}">
                        <img src="${media.poster}" alt="${media.name}" class="media-poster">
                        <div class="media-overlay">
                            <h4 class="media-title">${media.name}</h4>
                            <p class="media-info">${media.type} • ${media.platform}</p>
                        </div>
                    </div>
                `;
            }).join('')
            : `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                    </svg>
                    <p style="font-size: 1.1rem; margin: 0;">This list is empty</p>
                    <p style="font-size: 0.9rem; margin: 0.5rem 0 0 0;">Add some media to get started!</p>
                </div>
            `;

        content.innerHTML = `
            <div class="list-header">
                <h1 class="list-title">${name}</h1>
                <div class="list-meta">
                    <span class="visibility-badge ${visibility === 'public' ? 'public' : ''}">
                        ${visibility === 'public' ? '🌐' : '🔒'} ${visibility === 'public' ? 'Public' : 'Private'}
                    </span>
                    <span class="list-meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        ${items.length} ${items.length === 1 ? 'item' : 'items'}
                    </span>
                    <span class="list-meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        ${likes.length} ${likes.length === 1 ? 'like' : 'likes'}
                    </span>
                </div>
                ${description ? `<p class="list-description">${description}</p>` : ''}
            </div>
            
            <div class="media-grid">${mediaCardsHtml}</div>
            
            <div class="action-buttons">
                <button class="btn btn-primary" id="edit-list-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    Edit List
                </button>
                <button class="btn btn-secondary" id="close-btn">Close</button>
            </div>
        `;

        // Event listeners
        content.querySelector('#edit-list-btn')?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('edit', { detail: this.listData }));
            this.close();
        });

        content.querySelector('#close-btn')?.addEventListener('click', () => {
            this.close();
        });
    }

    close() {
        this.shadowRoot.querySelector('#view-modal').hide();
    }
}

customElements.define('list-view-detail', ListViewDetail);