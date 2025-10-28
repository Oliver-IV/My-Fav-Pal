import express from 'express';
import { body } from 'express-validator';
import { runValidation } from '../utils/validate.middleware.js';
import * as authController from './auth.controller.js';

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    runValidation
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    runValidation
  ],
  authController.login
);

export default router;
