
import authService from './auth.service.js';

const API_BASE_URL = 'http://localhost:3000/api';

class ReviewService {
    

   async getReviewsByUserId(userId) {
    const token = authService.getToken(); 
    
    console.log("Token recuperado del authService:", token);

    if (!token) {
        console.error('No hay token de autenticación disponible.');
        return [];
    }

        try {
            const response = await fetch(`${API_BASE_URL}/reviews/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error al cargar reviews: ${response.statusText}`);
            }

            const data = await response.json();
            
            return data.data || data; 

        } catch (error) {
            console.error('Fetch error:', error);
            return [];
        }
    }

    async getReviewsByMediaId(mediaId) {
      
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/media/${mediaId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error al cargar reviews del media`);
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Fetch error:', error);
            return [];
        }
    }
}



export default ReviewService;