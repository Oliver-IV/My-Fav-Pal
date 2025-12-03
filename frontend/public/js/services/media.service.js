import authService from './auth.service.js';

const API_URL = 'http://localhost:3000/api/media';

const getHeaders = () => {
    const token = authService.getToken();
    return { 'Authorization': `Bearer ${token}` };
};

class MediaService {
    
    async searchMedia(query) {
        if (!query || query.trim() === '') return [];
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to search media');
        const result = await response.json();
        return result.data;
    }
}

const mediaService = new MediaService();
export default mediaService;