import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['Manga', 'Series', 'Movie', 'Book'] 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  link: String,
  platform: [String], 
  genres: [String], 
  status: String,
  rating: Number, 
}, {
    timestamps: true 
});


MediaSchema.index({ name: 1, type: 1 }, { unique: true });

const Media = mongoose.model('Media', MediaSchema);
export default Media;