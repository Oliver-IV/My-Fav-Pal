import userDAO from './users.dao.js';
import bcrypt from 'bcryptjs';

export default class UserService {

    async createUser(userData) {
        const existingUser = await userDAO.findByEmail(userData.email);
        if (existingUser) {
            const error = new Error('El correo electrónico ya está en uso.');
            error.status = 409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        return userDAO.create({ ...userData, password: hashedPassword });
    }

   
    async validateUser(email, password) {
        const user = await userDAO.findByEmail(email);
        if (!user) {
            return null; 
        }

        const isMatch = await bcrypt.compare(password, user.password);
        return isMatch ? user : null;
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