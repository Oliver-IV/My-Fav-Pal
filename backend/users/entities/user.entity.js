import mongoose from 'mongoose';

const WatchlistItemSchema = new mongoose.Schema({
  mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' }, 
  mediaName: { type: String, required: true },
  type: { type: String, required: true },
  platform: String,
  progress: {
    season: Number,
    episode: Number,
    volume: Number,
    chapter: Number,
    page: Number,
    totalPages: Number,
    timestamp: String,
    percentage: Number,
  },
  link: String,
  lastUrl: String,
  status: { type: String, required: true, enum: ['Watching', 'Completed', 'On-Hold', 'Dropped', 'Plan to Watch'] },
  rating: Number,
  posterUrl: String,
  updatedAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, required: true },
  avatarUrl: String,

  city: { type: String },

  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],

  watchlist: [WatchlistItemSchema],
  waitlist: [WatchlistItemSchema],
  lists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
export default User;