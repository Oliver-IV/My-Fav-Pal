import UserService from './users.service.js';
import CreateUserDTO from './dtos/users.createDTO.js';
import UpdateUserDTO from './dtos/users.updateDTO.js';

const userService = new UserService();

export const createUser = async (req, res) => {
    try {
        const createUserDTO = new CreateUserDTO(req.body);
        const newUser = await userService.createUser(createUserDTO);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        res.status(200).json(user);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateUserDTO = new UpdateUserDTO(req.body);
        const updatedUser = await userService.updateUser(id, updateUserDTO);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userService.deleteUser(id);
        res.status(204).send();
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};