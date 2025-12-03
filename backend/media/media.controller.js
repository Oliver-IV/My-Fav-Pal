import MediaService from './media.service.js';
import { WatchlistItemDTO } from '../users/dtos/user.dto.js';

const mediaService = new MediaService();

export const searchMedia = async (req, res) => {
  try {
    const query = req.query.q || '';
    const results = await mediaService.searchMedia(query);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error searching media', error: error.message });
  }
};

export const getWatchlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const watchlist = await mediaService.getWatchlist(userId);

    res.status(200).json({
      success: true,
      data: watchlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addToWatchlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const watchlistItemDTO = new WatchlistItemDTO(req.body);
    const errors = watchlistItemDTO.validate();

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const watchlist = await mediaService.addToWatchlist(userId, watchlistItemDTO);

    res.status(201).json({
      success: true,
      message: 'Item agregado a watchlist',
      data: watchlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateWatchlistItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const updateData = req.body;

    const watchlist = await mediaService.updateWatchlistItem(userId, itemId, updateData);

    res.status(200).json({
      success: true,
      message: 'Item actualizado en watchlist',
      data: watchlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;

    const watchlist = await mediaService.removeFromWatchlist(userId, itemId);

    res.status(200).json({
      success: true,
      message: 'Item eliminado de watchlist',
      data: watchlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getWatchlist,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
  searchMedia, 
};
