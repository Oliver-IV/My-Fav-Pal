import express from 'express'; 
import * as listsController from './lists.controller.js'; 

const router = express.Router();

router.get('/', listsController.getLists);
router.get('/:id', listsController.getListById);
router.post('/', listsController.createList);
router.put('/:id', listsController.updateList);
router.delete('/:id', listsController.deleteList);

export default router; 