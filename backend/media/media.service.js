import User from '../users/entities/user.entity.js';
import Media from './entities/media.entity.js';

export default class MediaService {
  constructor() { }

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

    if (!watchlistItem.mediaId) {

      let globalMedia = await Media.findOne({
        name: { $regex: new RegExp(`^${watchlistItem.mediaName}$`, 'i') },
        type: watchlistItem.type
      });

      if (!globalMedia) {
        globalMedia = new Media({
          name: watchlistItem.mediaName,
          type: watchlistItem.type,
          poster: watchlistItem.posterUrl,
          platform: watchlistItem.platform ? [watchlistItem.platform] : [],
          description: 'Agregado por la comunidad',
          rating: 0
        });
        await globalMedia.save();
        console.log(`[MediaService] Nueva entrada global creada: ${globalMedia.name} (${globalMedia._id})`);
      }


      watchlistItem.mediaId = globalMedia._id;
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
async getAllMedia() {
        return Media.find(); 
    }
  async searchMedia(query) {
    if (!query) return [];
    const searchRegex = new RegExp(query, 'i');
    return Media.find({ name: searchRegex })
      .limit(20)
      .select('name poster type platform _id');
  }
}