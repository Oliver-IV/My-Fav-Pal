import User from '../users/entities/user.entity.js';

export default class MediaService {
  constructor() {}

  // Obtener watchlist de un usuario
  async getWatchlist(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user.watchlist;
  }

  // Agregar item a watchlist
  async addToWatchlist(userId, watchlistItem) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.watchlist.push(watchlistItem);
    await user.save();

    return user.watchlist;
  }

  // Actualizar item en watchlist
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

  // Eliminar item de watchlist
  async removeFromWatchlist(userId, itemId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.watchlist.pull(itemId);
    await user.save();

    return user.watchlist;
  }
}