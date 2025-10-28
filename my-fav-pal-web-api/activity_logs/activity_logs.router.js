
import express from 'express';
import {
    createLog,
    getLogsByUser
} from './activity_logs.controller.js';

const router = express.Router();

router.post('/', createLog);
router.get('/user/:userId', getLogsByUser); 

export default router;