import User from '../users/entities/user.entity.js';
import Media from './entities/media.entity.js'; // 1. Importa el modelo Media

export default class MediaService {
  constructor() {}

  async getWatchlist(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user.watchlist;
  }

  async addToWatchlist(userId, watchlistItem) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.watchlist.push(watchlistItem);
    await user.save();

    return user.watchlist;
  }

  async updateWatchlistItem(userId, itemId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const item = user.watchlist.id(itemId);
    if (!item) {
      throw new Error('Item no encontrado en watchlist');
    }

    Object.assign(item, updateData);
    await user.save();

    return user.watchlist;
  }

  async removeFromWatchlist(userId, itemId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.watchlist.pull(itemId);
    await user.save();

    return user.watchlist;
  }

  async searchMedia(query) {
    if (!query) {
      return [];
    }

    const searchRegex = new RegExp(query, 'i');
    return Media.find({ name: searchRegex })
      .limit(20)
      .select('name poster type platform'); 
  }
}