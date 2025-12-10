import MediaService from './media.service.js';
import { WatchlistItemDTO } from '../users/dtos/user.dto.js';

const mediaService = new MediaService();

export const getAllMedia = async (req, res) => {
    try {
        const results = await mediaService.getAllMedia('');
        
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching all media:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener toda la media', 
            error: error.message 
        });
    }
};


export const searchMedia = async (req, res) => {
    try {
        const query = req.query.q || '';

        if (query.length < 2 && query.length > 0) {
             return res.status(400).json({ success: false, message: 'La consulta de búsqueda debe tener al menos 2 caracteres.' });
        }
        
        const results = await mediaService.searchMedia(query);
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        console.error('Error searching media:', error);
        res.status(500).json({ success: false, message: 'Error en la búsqueda de media', error: error.message });
    }
};

export const getWatchlist = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ success: false, message: 'No autorizado: ID de usuario no disponible.' });
        }
        const userId = req.user.userId;
        const watchlist = await mediaService.getWatchlist(userId);

        res.status(200).json({
            success: true,
            data: watchlist,
        });
    } catch (error) {
        console.error('Error getting watchlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la Watchlist',
            error: error.message,
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
                message: 'Datos de entrada no válidos.',
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
        console.error('Error adding to watchlist:', error);
        const statusCode = error.message.includes('duplicado') ? 409 : 500; 
        res.status(statusCode).json({
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
        if (!watchlist) {
            return res.status(404).json({ success: false, message: 'Item no encontrado para actualizar.' });
        }

        res.status(200).json({
            success: true,
            message: 'Item actualizado en watchlist',
            data: watchlist,
        });
    } catch (error) {
        console.error('Error updating watchlist item:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el item de Watchlist',
            error: error.message,
        });
    }
};

export const removeFromWatchlist = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemId } = req.params;

        const watchlist = await mediaService.removeFromWatchlist(userId, itemId);
        if (!watchlist) {
             return res.status(404).json({ success: false, message: 'Item no encontrado para eliminar.' });
        }

        res.status(200).json({
            success: true,
            message: 'Item eliminado de watchlist',
            data: watchlist,
        });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el item de Watchlist',
            error: error.message,
        });
    }
};

export default {
    getWatchlist,
    addToWatchlist,
    updateWatchlistItem,
    removeFromWatchlist,
    searchMedia,
    getAllMedia, 
};