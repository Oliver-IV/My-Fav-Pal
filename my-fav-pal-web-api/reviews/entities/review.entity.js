import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
        index: true 
    },
    mediaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media', 
        required: true,
        index: true 
    },
    rating: {
        type: Number,
        required: [true, 'La calificación es obligatoria.'],
        min: 1, 
        max: 10 
    },
    comment: {
        type: String,
        trim: true
    }
}, {
    timestamps: true 
});

ReviewSchema.index({ userId: 1, mediaId: 1 }, { unique: true });

const Review = mongoose.model('Review', ReviewSchema);
export default Review;