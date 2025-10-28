import ReviewService from './reviews.service.js';
import CreateReviewDTO from './dtos/review.createDTO.js';
import UpdateReviewDTO from './dtos/review.updateDTO.js';

const reviewService = new ReviewService();

export const createReview = async (req, res) => {
    try {
        const createReviewDTO = new CreateReviewDTO(req.body);
        const newReview = await reviewService.createReview(createReviewDTO);
        res.status(201).json(newReview);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

export const getAllReviews = async (req, res) => {
    try {
        const reviews = await reviewService.getAllReviews(req.query);
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await reviewService.getReviewById(id);
        res.status(200).json(review);
    } catch (error) {
        res.status(error.status || 404).json({ message: error.message });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const updateReviewDTO = new UpdateReviewDTO(req.body);
        const updatedReview = await reviewService.updateReview(id, updateReviewDTO);
        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        await reviewService.deleteReview(id);
        res.status(204).send();
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};