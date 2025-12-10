import authService from './auth.service.js';

const API_URL = 'http://localhost:3000/api/media'; 

const getHeaders = () => {
    const token = authService.getToken(); 

    console.log('Token de autenticación obtenido (en getHeaders):', token); 
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

class MediaService {

    async getAllMedia() {
        const response = await fetch(API_URL, { headers: getHeaders() });

        if (!response.ok) {
            console.error('Error al obtener toda la media. Estado:', response.status);
            throw new Error(`Failed to fetch media list. Status: ${response.status}`);
        } 
        
        const result = await response.json();
        return result.data || [];
    }

    async searchMedia(query) {
        if (!query || query.trim() === '') return [];

        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, { headers: getHeaders() });

        if (!response.ok) {
            console.error('Error en la búsqueda de medios. Estado:', response.status);
            throw new Error('Failed to search media');
        } 
        
        const result = await response.json();
        
        console.log('Documento JSON COMPLETO de la petición (result):', result); 
        console.log('Datos de búsqueda de medios (result.data):', result.data); 
        
        console.log("resultado obtenido:",result.data);
        return result.data;
    }
}

const mediaService = new MediaService();
export default mediaService;