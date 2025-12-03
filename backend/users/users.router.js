import express from 'express';
import {
	register,
	login,
	getProfile,
	updateProfile,
	updateFavorites, 
	changePassword,
	deleteAccount,
	getAllUsers,
	getUserById,
} from './users.controller.js';
import { authenticate } from '../utils/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/', getAllUsers);
router.get('/:id', getUserById);

router.get('/me/profile', authenticate, getProfile);

router.put('/me/profile', authenticate, updateProfile);

router.patch('/me/favorites', authenticate, updateFavorites);

router.put('/me/change-password', authenticate, changePassword);

router.delete('/me/account', authenticate, deleteAccount);

export default router;