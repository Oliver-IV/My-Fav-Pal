import Media from './media.entity.js';

export default class MediaService {
  constructor() {}

  async createMedia(mediaData) {
    const media = new Media(mediaData);
    return await media.save();
  }

  async getAllMedia(filter = {}) {
    return await Media.find(filter);
  }

  async getMediaById(id) {
    return await Media.findById(id);
  }

  async updateMedia(id, updateData) {
    return await Media.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteMedia(id) {
    return await Media.findByIdAndDelete(id);
  }
}