
import express from 'express';
import {
    createMedia,
    getAllMedia,
    getMediaById,
    updateMedia,
    deleteMedia
} from './media.controller.js';

const router = express.Router();

router.post('/', createMedia);
router.get('/', getAllMedia);
router.get('/:id', getMediaById);
router.put('/:id', updateMedia);
router.delete('/:id', deleteMedia);

export default router;