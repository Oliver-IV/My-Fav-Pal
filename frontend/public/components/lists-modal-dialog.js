class ModalDialog extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --modal-width: 600px;
                    --modal-max-height: 85vh;
                }
                
                .backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(6px);
                    z-index: 1000;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.25s ease;
                }
                
                :host([open]) .backdrop {
                    display: flex;
                    opacity: 1;
                }
                
                .dialog {
                    background: var(--background-secondary);
                    border-radius: 16px;
                    width: 90%;
                    max-width: var(--modal-width);
                    max-height: var(--modal-max-height);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
                    border: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transform: scale(0.9) translateY(20px);
                    transition: transform 0.25s ease, opacity 0.25s ease;
                    opacity: 0;
                }
                
                :host([open]) .dialog {
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }
                
                /* Variante de ancho completo */
                :host([size="large"]) {
                    --modal-width: 1200px;
                }
                
                :host([size="full"]) .dialog {
                    width: 95%;
                    max-width: 1400px;
                    height: 90vh;
                    max-height: 90vh;
                }
                
                .header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid var(--border-color);
                    flex-shrink: 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--background-secondary);
                }
                
                .header h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .close-btn {
                    background: none;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                
                .close-btn:hover {
                    background: var(--background-tertiary);
                    color: var(--text-primary);
                }
                
                .body {
                    padding: 1.5rem 2rem;
                    overflow-y: auto;
                    flex: 1;
                    background: var(--background-primary);
                }
                
                .body::-webkit-scrollbar {
                    width: 8px;
                }
                
                .body::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .body::-webkit-scrollbar-thumb {
                    background-color: #475569;
                    border-radius: 10px;
                    border: 2px solid var(--background-primary);
                }
                
                .body::-webkit-scrollbar-thumb:hover {
                    background-color: #64748b;
                }
            </style>
            
            <div class="backdrop">
                <div class="dialog">
                    <div class="header">
                        <h2><slot name="header">Modal</slot></h2>
                        <button class="close-btn" title="Close">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="body">
                        <slot name="body"></slot>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const backdrop = this.shadowRoot.querySelector('.backdrop');
        const closeBtn = this.shadowRoot.querySelector('.close-btn');
        
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) this.hide();
        });
        
        closeBtn.addEventListener('click', () => this.hide());
        
        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.hasAttribute('open')) {
                this.hide();
            }
        });
    }

    show() {
        this.setAttribute('open', '');
        document.body.style.overflow = 'hidden';
    }

    hide() {
        this.removeAttribute('open');
        document.body.style.overflow = '';
        this.dispatchEvent(new CustomEvent('close'));
    }
}

customElements.define('modal-dialog', ModalDialog);