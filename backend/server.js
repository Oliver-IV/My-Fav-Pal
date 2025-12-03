import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import { PORT } from './utils/configs.js';

import usersRouter from './users/users.router.js';
import mediaRouter from './media/media.router.js';
import listsRouter from './lists/lists.router.js';
import reviewsRouter from './reviews/reviews.router.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', usersRouter);
app.use('/api/media', mediaRouter);
app.use('/api/lists', listsRouter);
app.use('/api/reviews', reviewsRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a My Fav Pal API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      media: '/api/media',
      lists: '/api/lists',
      reviews: '/api/reviews',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;