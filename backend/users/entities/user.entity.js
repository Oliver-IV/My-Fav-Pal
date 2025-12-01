import mongoose from 'mongoose';

const WatchlistItemSchema = new mongoose.Schema({
  mediaName: { type: String, required: true }, 
  type: { type: String, required: true },      
  platform: String,                           
  progress: {
    chapter: Number,
    episode: Number,
    page: Number,
    timestamp: String,
  },
  link: String,  // URL externa del contenido
  lastUrl: String,
  status: { type: String, required: true, enum: ['Watching', 'Completed', 'On-Hold', 'Dropped', 'Plan to Watch'] },
  rating: Number,
  posterUrl: String,  // URL de la imagen/poster
  updatedAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, required: true },
  avatarUrl: String,
  watchlist: [WatchlistItemSchema], 
  waitlist: [WatchlistItemSchema], // Mismo schema que watchlist
  lists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
export default User;