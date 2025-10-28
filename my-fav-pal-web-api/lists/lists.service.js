import listDAO from './lists.dao.js'; 

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

    async createList(createListDTO) {
        return listDAO.create(createListDTO);
    }

    async updateList(id, updateListDTO) {
        await this.getListById(id);
        return listDAO.update(id, updateListDTO);
    }

    async deleteList(id) {
        await this.getListById(id);
        const success = listDAO.delete(id);
        if (!success) {
            const error = new Error(`No se pudo eliminar la lista con ID ${id}.`);
            error.status = 500;
            throw error;
        }
    }
}

export default new ListService(); 