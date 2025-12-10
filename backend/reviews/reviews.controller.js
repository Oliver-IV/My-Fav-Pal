import ReviewService from './reviews.service.js';
import mongoose from 'mongoose';

const reviewService = new ReviewService();

export const getReviewsByMediaId = async (req, res) => {
    try {
        const { mediaId } = req.params;
        const reviews = await reviewService.getReviewsByMediaId(mediaId);

        res.status(200).json({
            success: true,
            data: reviews,
            count: reviews.length
        });
    } catch (error) {
        console.error("Error obteniendo reviews de media:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getReviewsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'ID de usuario inválido.' });
        }

        const reviews = await reviewService.getReviewsByUserId(userId);

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
    // CORRECCIÓN: Usamos req.user.userId
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ success: false, message: 'No autenticado.' });
    }

    const userId = req.user.userId;
    const { mediaId, rating, title, body } = req.body;

    if (!mediaId || !rating) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
    }

    try {
        const newReview = await reviewService.createReview({
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
        // Manejo de duplicados (Upsert prevention)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya tienes una review para este título. Edítala en su lugar.'
            });
        }
        console.error("Error al crear review:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getReviewById = async (req, res) => {
    try {
        const review = await reviewService.getReviewById(req.params.id);

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
        // Obtenemos la review sin populate para verificar el ID crudo
        // Nota: Importamos el modelo Review en el servicio, pero aquí usamos el método del servicio
        // Si tu servicio hace populate, necesitamos acceder a userId._id o userId

        // Forma segura: Buscar directamente con Mongoose aquí para validar propiedad
        const ReviewModel = mongoose.model('Review');
        let review = await ReviewModel.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review no encontrada.' });
        }

        // CORRECCIÓN CRÍTICA AQUÍ: Comparar con req.user.userId
        if (review.userId.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para actualizar esta review.' });
        }

        const updated = await reviewService.updateReview(req.params.id, req.body);

        res.status(200).json({ success: true, message: 'Review actualizada con éxito.', data: updated });
    } catch (error) {
        console.error("Error updateReview:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const ReviewModel = mongoose.model('Review');
        const review = await ReviewModel.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review no encontrada.' });
        }

        // CORRECCIÓN CRÍTICA AQUÍ: Comparar con req.user.userId
        if (review.userId.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar esta review.' });
        }

        await reviewService.deleteReview(req.params.id);

        res.status(200).json({ success: true, message: 'Review eliminada con éxito.', data: {} });
    } catch (error) {
        console.error("Error deleteReview:", error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};