import Review from './entities/review.entity.js';

class ReviewDAO {
    async findAll(filter = {}) {
        return await Review.find(filter).populate('userId', 'displayName avatarUrl').populate('mediaId', 'name type');
    }

    async findById(id) {
        return await Review.findById(id).populate('userId', 'displayName avatarUrl').populate('mediaId', 'name type');
    }
    
    async findByUserAndMedia(userId, mediaId) {
        return await Review.findOne({ userId, mediaId });
    }

    async create(reviewData) {
        const review = new Review(reviewData);
        const savedReview = await review.save();
        return this.findById(savedReview._id);
    }

    async update(id, updateData) {
        return await Review.findByIdAndUpdate(id, updateData, { new: true }).populate('userId', 'displayName avatarUrl').populate('mediaId', 'name type');
    }

    async delete(id) {
        return await Review.findByIdAndDelete(id);
    }
}

export default new ReviewDAO();