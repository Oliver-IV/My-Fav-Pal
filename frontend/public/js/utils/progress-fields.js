// Definición de campos de progreso según tipo de media
export const progressFieldsByType = {
  series: [
    { name: 'season', label: 'Season', type: 'number', min: 0, placeholder: 'Season number' },
    { name: 'episode', label: 'Episode', type: 'number', min: 0, placeholder: 'Current episode' }
  ],
  movie: [
    { name: 'timestamp', label: 'Timestamp', type: 'text', placeholder: '01:23:45' }
  ],
  manga: [
    { name: 'volume', label: 'Volume', type: 'number', min: 0, placeholder: 'Current volume' },
    { name: 'chapter', label: 'Chapter', type: 'number', min: 0, placeholder: 'Current chapter' }
  ],
  book: [
    { name: 'page', label: 'Current Page', type: 'number', min: 0, placeholder: 'Current page' },
    { name: 'totalPages', label: 'Total Pages', type: 'number', min: 0, placeholder: 'Total pages' }
  ],
  article: [
    { name: 'percentage', label: 'Progress (%)', type: 'number', min: 0, max: 100, placeholder: 'Percentage read' }
  ]
};


export function getProgressFields(mediaType) {
  const type = (mediaType || '').toLowerCase();
  return progressFieldsByType[type] || [];
}


export function formatProgress(progress, mediaType) {
  if (!progress) return '-';
  
  const type = (mediaType || '').toLowerCase();
  
  switch (type) {
    case 'series':
      if (progress.season && progress.episode) {
        return `S${progress.season}E${progress.episode}`;
      } else if (progress.episode) {
        return `Episode ${progress.episode}`;
      }
      break;
      
    case 'manga':
      if (progress.volume && progress.chapter) {
        return `Vol. ${progress.volume}, Ch. ${progress.chapter}`;
      } else if (progress.chapter) {
        return `Chapter ${progress.chapter}`;
      }
      break;
      
    case 'book':
      if (progress.page && progress.totalPages) {
        return `${progress.page}/${progress.totalPages} pages`;
      } else if (progress.page) {
        return `Page ${progress.page}`;
      }
      break;
      
    case 'movie':
      if (progress.timestamp) {
        return progress.timestamp;
      }
      break;
      
    case 'article':
      if (progress.percentage !== undefined && progress.percentage !== null) {
        return `${progress.percentage}%`;
      }
      break;
  }
  

  if (progress.episode) return `Episode ${progress.episode}`;
  if (progress.chapter) return `Chapter ${progress.chapter}`;
  if (progress.page) return `Page ${progress.page}`;
  
  return '-';
}


export function extractProgressFromForm(formData, mediaType) {
  const fields = getProgressFields(mediaType);
  const progress = {};
  
  fields.forEach(field => {
    const value = formData.get(field.name);
    if (value && value.trim()) {
      if (field.type === 'number') {
        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
          progress[field.name] = numValue;
        }
      } else {
        progress[field.name] = value;
      }
    }
  });
  
  return Object.keys(progress).length > 0 ? progress : {};
}


export function renderProgressFields(mediaType, currentProgress = {}) {
  const fields = getProgressFields(mediaType);
  
  if (fields.length === 0) {
    return '<p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">No progress tracking for this media type</p>';
  }
  
  return fields.map(field => {
    const value = currentProgress[field.name] || '';
    const attrs = [
      `type="${field.type}"`,
      `id="${field.name}"`,
      `name="${field.name}"`,
      `placeholder="${field.placeholder}"`,
      field.min !== undefined ? `min="${field.min}"` : '',
      field.max !== undefined ? `max="${field.max}"` : '',
      field.type === 'number' ? 'step="1"' : '',
      value ? `value="${value}"` : ''
    ].filter(Boolean).join(' ');
    
    return `
      <div class="form-group">
        <label for="${field.name}">${field.label}</label>
        <input ${attrs} />
      </div>
    `;
  }).join('');
}
