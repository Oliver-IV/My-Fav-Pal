import authService from './auth.service.js';
import CreateUserDTO from '../users/dtos/user.createDTO.js';

export const register = async (req, res, next) => {
    try {
        const createUserDTO = new CreateUserDTO(req.body);
        const user = await authService.register(createUserDTO);
    
        const { password, ...userResponse } = user.toObject();
        res.status(201).json({ message: "Usuario registrado exitosamente", user: userResponse });
    } catch (error) {
        next(error); 
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            const error = new Error('Email y contraseña son requeridos.');
            error.status = 400;
            throw error;
        }
        const data = await authService.login(email, password);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};