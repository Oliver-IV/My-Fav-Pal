import reviewDAO from './reviews.dao.js';
import userDAO from '../users/users.dao.js';
import mediaDAO from '../media/media.dao.js';

export default class ReviewService {

    async createReview(reviewData) {
        const userExists = await userDAO.findById(reviewData.userId);
        if (!userExists) {
            const error = new Error(`El usuario con ID ${reviewData.userId} no existe.`);
            error.status = 400; 
            throw error;
        }
        const mediaExists = await mediaDAO.findById(reviewData.mediaId);
        if (!mediaExists) {
            const error = new Error(`El medio con ID ${reviewData.mediaId} no existe.`);
            error.status = 400; 
            throw error;
        }

        const existingReview = await reviewDAO.findByUserAndMedia(reviewData.userId, reviewData.mediaId);
        if (existingReview) {
            const error = new Error('Este usuario ya ha creado una reseña para este medio.');
            error.status = 409; 
            throw error;
        }
        
        return reviewDAO.create(reviewData);
    }

    async getAllReviews(filter) {
        return reviewDAO.findAll(filter);
    }

    async getReviewById(id) {
        const review = await reviewDAO.findById(id);
        if (!review) {
            const error = new Error(`Reseña con ID ${id} no encontrada.`);
            error.status = 404;
            throw error;
        }
        return review;
    }

    async updateReview(id, updateData) {
        await this.getReviewById(id);
        return reviewDAO.update(id, updateData);
    }

    async deleteReview(id) {
        await this.getReviewById(id);
        return reviewDAO.delete(id);
    }
}