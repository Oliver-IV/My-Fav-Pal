import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['Manga', 'Series', 'Movie', 'Book'] },
  name: { type: String, required: true },
  description: String,
  link: String,
  platform: [String], 
  genres: [String], 
  status: String,
  rating: Number, 
});

const Media = mongoose.model('Media', MediaSchema);
export default Media;