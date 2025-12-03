import express from 'express';
import { 
    createReview, 
    getReviewById, 
    getReviewsByUserId, 
    updateReview, 
    deleteReview 
} from './reviews.controller.js'; 

import { authenticate } from '../utils/auth.middleware.js'; 

const router = express.Router();

router.get('/user/:userId', authenticate, getReviewsByUserId); 

router.route('/')
    .post(authenticate, createReview); 

router.route('/:id')
    .get(getReviewById) 
    .put(authenticate, updateReview) 
    .delete(authenticate, deleteReview); 

export default router;