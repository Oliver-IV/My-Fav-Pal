import express from 'express';
import {
  getLists,
  getList, 
  createList,
  updateList,
  deleteList,
} from './lists.controller.js';
import { authenticate } from '../utils/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getLists);
router.post('/', authenticate, createList);

router.get('/:id', authenticate, getList);

router.put('/:id', authenticate, updateList);
router.delete('/:id', authenticate, deleteList);

export default router;