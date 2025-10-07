import connectDB from './utils/db.js';
import mongoose from 'mongoose';
import readlineSync from 'readline-sync';
import chalk from 'chalk';

import UserService from './users/users.service.js';
import MediaService from './media/media.service.js';
import ReviewService from './reviews/reviews.service.js';
import ActivityLogService from './activity_logs/activity_logs.service.js';

const main = async () => {
  await connectDB();

  const userService = new UserService();
  const mediaService = new MediaService();
  const reviewService = new ReviewService();
  const activityLogService = new ActivityLogService();

  const showMainMenu = () => {
    console.log(chalk.bold.yellow('\n--- menu principal ---'));
    console.log('1. gestionar usuarios');
    console.log('2. gestionar media');
    console.log('3. gestionar reviews');
    console.log('4. ver logs de actividad');
    console.log('5. salir');
    return readlineSync.question('elige una opcion: ');
  };

  const manageUsers = async () => {
    console.log(chalk.bold.cyan('\n--- gestionar usuarios ---'));
    console.log('1. crear usuario');
    console.log('2. ver todos los usuarios');
    console.log('3. buscar usuario por id');
    console.log('4. actualizar usuario');
    console.log('5. eliminar usuario');
    const choice = readlineSync.question('elige una opcion: ');

    switch (choice) {
      case '1': {
        const email = readlineSync.question('email: ');
        const password = readlineSync.question('contrasena: ', { hideEchoBack: true });
        const displayName = readlineSync.question('nombre de usuario: ');
        const avatarUrl = readlineSync.question('url del avatar (opcional): ');
        const newUser = await userService.createUser({ email, password, displayName, avatarUrl });
        console.log(chalk.green('usuario creado:'), newUser);
        break;
      }
      case '2': {
        const allUsers = await userService.getAllUsers();
        console.log(chalk.green('todos los usuarios:'), allUsers);
        break;
      }
      case '3': {
        const userId = readlineSync.question('id del usuario: ');
        const user = await userService.getUserById(userId);
        console.log(chalk.green('usuario encontrado:'), user || 'usuario no encontrado');
        break;
      }
      case '4': {
        const userId = readlineSync.question('id del usuario a actualizar: ');
        const user = await userService.getUserById(userId);
        if (!user) {
            console.log(chalk.red('usuario no encontrado.'));
            return;
        }

        console.log(chalk.yellow('introduce los nuevos datos (deja en blanco para no cambiar).'));
        const email = readlineSync.question(`email (${user.email}): `);
        const displayName = readlineSync.question(`nombre de usuario (${user.displayName}): `);
        const avatarUrl = readlineSync.question(`url del avatar (${user.avatarUrl || ''}): `);
        
        const updateData = {};
        if (email) updateData.email = email;
        if (displayName) updateData.displayName = displayName;
        if (avatarUrl) updateData.avatarUrl = avatarUrl;

        if (Object.keys(updateData).length > 0) {
            const updatedUser = await userService.updateUser(userId, updateData);
            console.log(chalk.green('usuario actualizado:'), updatedUser);
        } else {
            console.log(chalk.yellow('no se proporcionaron datos para actualizar.'));
        }
        break;
      }
      case '5': {
        const userId = readlineSync.question('id del usuario a eliminar: ');
        const deletedUser = await userService.deleteUser(userId);
        console.log(chalk.green('usuario eliminado:'), deletedUser || 'usuario no encontrado');
        break;
      }
      default:
        console.log(chalk.red('opcion no valida.'));
    }
  };

  const manageMedia = async () => {
    console.log(chalk.bold.cyan('\n--- gestionar media ---'));
    console.log('1. crear media');
    console.log('2. ver toda la media');
    const choice = readlineSync.question('elige una opcion: ');

    switch (choice) {
        case '1': {
            const type = readlineSync.keyInSelect(['manga', 'series', 'movie', 'book'], 'selecciona el tipo de media:');
            if (type === -1) { console.log(chalk.red('creacion cancelada.')); break; }
            
            const name = readlineSync.question('nombre: ');
            const description = readlineSync.question('descripcion: ');
            const link = readlineSync.question('enlace: ');
            const platforms = readlineSync.question('plataformas (separadas por coma): ');
            const genres = readlineSync.question('generos (separados por coma): ');
            const status = readlineSync.question('estado (e.g., en emision, finalizado): ');
            const rating = readlineSync.question('rating (1-10): ');

            const mediaData = {
                type: ['manga', 'series', 'movie', 'book'][type],
                name,
                description,
                link,
                platform: platforms.split(',').map(p => p.trim()),
                genres: genres.split(',').map(g => g.trim()),
                status,
                rating: parseFloat(rating) || 0
            };

            const newMedia = await mediaService.createMedia(mediaData);
            console.log(chalk.green('media creada:'), newMedia);
            break;
        }
        case '2': {
            const allMedia = await mediaService.getAllMedia();
            console.log(chalk.green('toda media:'), allMedia);
            break;
        }
        default:
            console.log(chalk.red('opcion no valida.'));
    }
  };

  const manageReviews = async () => {
    console.log(chalk.bold.cyan('\n--- gestionar reviews ---'));
    console.log('1. crear review');
    console.log('2. ver reviews de una media');
    const choice = readlineSync.question('elige una opcion: ');

    switch (choice) {
        case '1': {
            const userId = readlineSync.question('id del usuario: ');
            const mediaId = readlineSync.question('id del media: ');
            const content = readlineSync.question('contenido del review: ');
            const rating = readlineSync.question('calificacion (1-10): ');
            const newReview = await reviewService.createReview({ userId, mediaId, content, rating: parseInt(rating) });
            console.log(chalk.green('review creado:'), newReview);
            await activityLogService.createLog({
                userId,
                activityType: 'created_review',
                type: 'created_review',
                details: `el usuario ha creado un review para el media ${mediaId}`
            });
            console.log(chalk.blue('log de actividad creado.'));
            break;
        }
        case '2': {
            const mediaId = readlineSync.question('id del media: ');
            const reviews = await reviewService.getReviewsByMediaId(mediaId);
            console.log(chalk.green(`reviews para el media ${mediaId}:`), reviews);
            break;
        }
        default:
            console.log(chalk.red('opcion no valida.'));
    }
  };

  const viewActivityLogs = async () => {
      const userId = readlineSync.question('id del usuario para ver sus logs: ');
      const logs = await activityLogService.getLogsByUserId(userId);
      console.log(chalk.green(`logs de actividad para el usuario ${userId}:`), logs);
  };

  let running = true;
  while (running) {
    const choice = showMainMenu();
    try {
      switch (choice) {
        case '1':
          await manageUsers();
          break;
        case '2':
          await manageMedia();
          break;
        case '3':
          await manageReviews();
          break;
        case '4':
          await viewActivityLogs();
          break;
        case '5':
          running = false;
          break;
        default:
          console.log(chalk.red('opcion no valida. por favor, intenta de nuevo.'));
      }
    } catch (error) {
      console.error(chalk.red('ocurrio un error:'), error.message);
    }
  }

  await mongoose.connection.close();
  console.log(chalk.bold.yellow('conexion con la base de datos cerrada.'));
};

main();
