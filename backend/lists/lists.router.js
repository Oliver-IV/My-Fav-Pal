import express from 'express';
import {
  getLists,
  createList,
  updateList,
  deleteList,
} from './lists.controller.js';
import { authenticate } from '../utils/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getLists);
router.post('/', authenticate, createList);
router.put('/:id', authenticate, updateList);
router.delete('/:id', authenticate, deleteList);

export default router;