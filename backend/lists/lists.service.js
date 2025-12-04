import List from './entities/list.entity.js';
import Media from '../media/entities/media.entity.js';
import mongoose from 'mongoose'; 

export default class ListService {
  async getListsByUserId(userId) {
    if (!userId) {
      throw new Error('User ID is required.');
    }
    console.log(`[Service] Ejecutando find({ ownerId: "${userId}" }) en la colección de listas.`);
    return List.find({ ownerId: userId }).sort({ createdAt: -1 });
  }

  async getListById(listId, userId) {
    const list = await List.findOne({ _id: listId, ownerId: userId })
      .populate('items.mediaId', 'name type platform poster');

    if (!list) {
      throw new Error('List not found or user does not have permission.');
    }
    return list;
  }

  async createList(listData, userId) {
    const newList = new List({
      ...listData,
      ownerId: userId,
    });
    return newList.save();
  }

  async updateList(listId, updateListData, userId) {
    const list = await List.findOne({ _id: listId, ownerId: userId });
    if (!list) {
      throw new Error('List not found or user does not have permission.');
    }

    list.name = updateListData.name;
    list.description = updateListData.description;
    list.visibility = updateListData.visibility;

    if (updateListData.items) {
      const validItems = updateListData.items.filter(item =>
        mongoose.Types.ObjectId.isValid(item.mediaId)
      );

      if (validItems.length !== updateListData.items.length) {
        throw new Error('Some media IDs are invalid.');
      }

      list.items = validItems.map(item => ({ mediaId: item.mediaId }));
    }

    await list.save();
    await list.populate('items.mediaId', 'name type platform poster');

    return list;
  }

  async deleteList(listId, userId) {
    const list = await List.findOne({ _id: listId, ownerId: userId });
    if (!list) {
      throw new Error('List not found or user does not have permission.');
    }
    await List.findByIdAndDelete(listId);
    return { message: 'List deleted successfully.' };
  }
}