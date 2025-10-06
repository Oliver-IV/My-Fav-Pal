import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  title: String,
  body: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ReviewSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Review = mongoose.model('Review', ReviewSchema);
export default Review;