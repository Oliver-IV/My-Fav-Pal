import List from './entities/list.entity.js';

export default class ListService {
  async getListsByUserId(userId) {
    if (!userId) {
      throw new Error('User ID is required.');
    }
    console.log(`[Service] Ejecutando find({ ownerId: "${userId}" }) en la colección de listas.`);
    return List.find({ ownerId: userId }).sort({ createdAt: -1 });
  }

  async createList(listData, userId) {
    const newList = new List({
      ...listData,
      user: userId, 
    });
    return newList.save();
  }

  async updateList(listId, updateListData, userId) {
    const list = await List.findOne({ _id: listId, user: userId });
    if (!list) {
      throw new Error('List not found or user does not have permission.');
    }
    Object.assign(list, updateListData);
    await list.save();
    return list;
  }

  async deleteList(listId, userId) {
    const list = await List.findOne({ _id: listId, user: userId });
    if (!list) {
      throw new Error('List not found or user does not have permission.');
    }
    await List.findByIdAndDelete(listId);
    return { message: 'List deleted successfully.' };
  }
}