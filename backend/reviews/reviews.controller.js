import Review from './entities/review.entity.js';
import mongoose from 'mongoose';
import Media from '../media/entities/media.entity.js';

export const getReviewsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'ID de usuario inválido.' });
        }

        // Ahora Media ya está importado correctamente, así que el modelo se registra.
        // Podemos usar la variable 'Media' directamente en el populate.

        const reviews = await Review.find({ userId: userId })
                                     .populate({
                                         path: 'mediaId',
                                         model: Media, // Usamos la clase importada
                                         select: 'name type posterUrl'
                                     })
                                     .lean(); 

        if (!reviews || reviews.length === 0) {
            return res.status(200).json({ 
                success: true, 
                data: [], 
                message: 'El usuario no tiene reviews.' 
            });
        }

        res.status(200).json({
            success: true,
            data: reviews,
            count: reviews.length
        });

    } catch (error) {
        console.error("Error al obtener reviews por usuario:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export const createReview = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: 'No autenticado.' });
    }
    
    const userId = req.user.id; 
    const { mediaId, rating, title, body } = req.body;

    if (!mediaId || !rating) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios: mediaId y rating.' });
    }

    try {
        const newReview = await Review.create({ 
            mediaId, 
            userId, 
            rating, 
            title, 
            body 
        });

        res.status(201).json({ 
            success: true, 
            message: 'Review creada con éxito.',
            data: newReview 
        });
    } catch (error) {
        console.error("Error al crear review:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('userId', 'displayName') 
            .populate('mediaId', 'name type');
            
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review no encontrada.' });
        }

        res.status(200).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

export const updateReview = async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review no encontrada.' });
        }

        if (review.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para actualizar esta review.' });
        }

        review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, message: 'Review actualizada con éxito.', data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review no encontrada.' });
        }

        if (review.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar esta review.' });
        }

        await review.deleteOne(); 

        res.status(200).json({ success: true, message: 'Review eliminada con éxito.', data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};