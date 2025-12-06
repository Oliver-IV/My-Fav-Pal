import express from 'express';
import {
  getWatchlist,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
  searchMedia, 
  getAllMedia,
} from './media.controller.js';
import { authenticate } from '../utils/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getAllMedia);
router.get('/search', authenticate, searchMedia);

router.get('/watchlist', authenticate, getWatchlist);
router.post('/watchlist', authenticate, addToWatchlist);
router.put('/watchlist/:itemId', authenticate, updateWatchlistItem);
router.delete('/watchlist/:itemId', authenticate, removeFromWatchlist);

export default router;
