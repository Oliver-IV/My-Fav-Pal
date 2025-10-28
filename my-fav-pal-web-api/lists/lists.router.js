import express from 'express';
import * as listsController from './lists.controller.js'; 
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', listsController.getLists);
router.get('/:id', listsController.getListById);
router.post('/', listsController.createList);
router.put('/:id', listsController.updateList);
router.delete('/:id', listsController.deleteList);

export default router; 