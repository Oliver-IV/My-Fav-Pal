// users/users.entity.js
import mongoose from 'mongoose';

const WatchlistItemSchema = new mongoose.Schema({
  mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
  mediaName: { type: String, required: true }, 
  type: { type: String, required: true },      
  platform: String,                           
  progress: {
    chapter: Number,
    episode: Number,
    page: Number,
    timestamp: String,
  },
  lastUrl: String,
  status: { type: String, required: true, enum: ['Watching', 'Completed', 'On-Hold', 'Dropped', 'Plan to Watch'] },
  rating: Number,
  reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  updatedAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, required: true },
  avatarUrl: String,
  watchlist: [WatchlistItemSchema], 
  waitlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }], 
  lists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
export default User;