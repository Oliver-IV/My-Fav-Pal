import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getAllUsers,
  getUserById,
  getWatchlist,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
} from './users.controller.js';
import { authenticate } from '../utils/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', getAllUsers);
router.get('/:id', getUserById);

router.get('/me/profile', authenticate, getProfile);
router.put('/me/profile', authenticate, updateProfile);
router.post('/me/change-password', authenticate, changePassword);
router.delete('/me/account', authenticate, deleteAccount);

router.get('/me/watchlist', authenticate, getWatchlist);
router.post('/me/watchlist', authenticate, addToWatchlist);
router.put('/me/watchlist/:itemId', authenticate, updateWatchlistItem);
router.delete('/me/watchlist/:itemId', authenticate, removeFromWatchlist);

export default router;
