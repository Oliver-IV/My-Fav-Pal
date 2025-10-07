import Review from './entities/review.entity.js';

export default class ReviewService {
  constructor() {}

  async createReview(reviewData) {
    const review = new Review(reviewData);
    return await review.save();
  }

  async getReviewsByMediaId(mediaId) {
    return await Review.find({ mediaId }).populate('userId', 'displayName avatarUrl');
  }

  async getReviewsByUserId(userId) {
    return await Review.find({ userId }).populate('mediaId', 'name type');
  }

  async updateReview(id, updateData) {
    updateData.updatedAt = new Date();
    return await Review.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteReview(id) {
    return await Review.findByIdAndDelete(id);
  }
}