import jwt from 'jsonwebtoken';
import UserService from '../users/users.service.js';


const JWT_SECRET = 'tu_secreto_super_secreto_y_largo';

const userService = new UserService();

class AuthService {
    async register(userData) {
      
        return userService.createUser(userData);
    }

    async login(email, password) {
        const user = await userService.validateUser(email, password);
        
        if (!user) {
            const error = new Error('Credenciales inválidas.');
            error.status = 401;
            throw error;
        }

   
        const payload = {
            id: user._id,
            email: user.email,
            displayName: user.displayName
        };

   
        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '1h' 
        });

        return { user: payload, token };
    }
}

export default new AuthService();