import express from 'express';
import connectDB from './utils/db.js';
import authRouter from './auth/auth.router.js';
import listsRouter from './lists/lists.router.js';
import usersRouter from './users/users.router.js';
import mediaRouter from './media/media.router.js';
import reviewsRouter from './reviews/reviews.router.js';
import activityLogsRouter from './activity_logs/activity_logs.router.js';

const startServer = async () => {
 
    await connectDB();

    const app = express();

    app.use(express.json());
    app.use('/api/auth', authRouter);


    app.use('/api/lists', listsRouter);
    app.use('/api/users', usersRouter);
    app.use('/api/media', mediaRouter);
    app.use('/api/reviews', reviewsRouter);
    app.use('/api/activity-logs', activityLogsRouter);


    app.get('/', (req, res) => {
        res.send('¡Bienvenido a la API de My-Fav-Pal!');
    });


    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor web corriendo en http://localhost:${PORT}`);
    });
};

startServer().catch(error => {
    console.error("Error al iniciar el servidor:", error);
});