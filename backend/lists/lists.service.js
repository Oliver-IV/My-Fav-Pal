
const listDAO = require('./lists.dao');

class ListService {
    async getAllLists() {
        return listDAO.findAll();
    }

    async getListById(id) {
        const list = await listDAO.findById(id);
        if (!list) {
            const error = new Error(`Lista con ID ${id} no encontrada.`);
            error.status = 404;
            throw error;
        }
        return list;
    }
    
    async createList(listData) {
        return listDAO.create(listData);
    }

    async updateList(id, updateData) {
        await this.getListById(id); 
        return listDAO.update(id, updateData);
    }
    
    async deleteList(id) {
        await this.getListById(id);
        return listDAO.delete(id);
    }
}

module.exports = new ListService();