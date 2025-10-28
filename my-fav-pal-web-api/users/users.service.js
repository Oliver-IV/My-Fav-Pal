import userDAO from './users.dao.js';

export default class UserService {
    
    async createUser(userData) {
        const existingUser = await userDAO.findByEmail(userData.email);
        if (existingUser) {
            const error = new Error('El correo electrónico ya está en uso.');
            error.status = 409; 
            throw error;
        }
        
        return userDAO.create(userData);
    }

    async getAllUsers() {
        return userDAO.findAll();
    }

    async getUserById(id) {
        const user = await userDAO.findById(id);
        if (!user) {
            const error = new Error(`Usuario con ID ${id} no encontrado.`);
            error.status = 404;
            throw error;
        }
        return user;
    }

    async updateUser(id, updateData) {
        await this.getUserById(id); 
        return userDAO.update(id, updateData);
    }

    async deleteUser(id) {
        await this.getUserById(id); 
        return userDAO.delete(id);
    }
}