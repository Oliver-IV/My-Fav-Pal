export default class UpdateReviewDTO {
    constructor({ rating, comment }) {
        if (rating !== undefined) {
            if (rating < 1 || rating > 10) {
                throw new Error('La calificación (rating) debe estar entre 1 y 10.');
            }
            this.rating = rating;
        }
        if (comment !== undefined) this.comment = comment;
    }
}