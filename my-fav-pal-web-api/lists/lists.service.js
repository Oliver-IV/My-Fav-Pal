import List from './entities/list.entity.js'

export default class ListService {
  constructor() {}

  async createList(listData) {
    const list = new List(listData);
    return await list.save();
  }

  async getListsByOwner(ownerId) {
    return await List.find({ ownerId }).populate('items.mediaId', 'name type');
  }

  async getListById(id) {
    return await List.findById(id).populate('items.mediaId', 'name type');
  }

  async updateList(id, updateData) {
    return await List.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteList(id) {
    return await List.findByIdAndDelete(id);
  }
}