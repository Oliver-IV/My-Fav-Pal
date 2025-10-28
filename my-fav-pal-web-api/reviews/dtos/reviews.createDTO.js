export default class CreateReviewDTO {
    constructor({ userId, mediaId, rating, comment }) {
        if (!userId || !mediaId || rating === undefined) {
            throw new Error('Los campos userId, mediaId y rating son obligatorios.');
        }

        if (rating < 1 || rating > 10) {
            throw new Error('La calificación (rating) debe estar entre 1 y 10.');
        }

        this.userId = userId;
        this.mediaId = mediaId;
        this.rating = rating;
        this.comment = comment;
    }
}