import connectDB from './utils/db.js';
import mongoose from 'mongoose';
import readlineSync from 'readline-sync';
import chalk from 'chalk';


import UserService from './users/users.service.js';
import MediaService from './media/media.service.js';
import ReviewService from './reviews/reviews.service.js';
import ActivityLogService from './activity_logs/activity_logs.service.js';


import CreateUserDTO from './users/dtos/users.createDTO.js';
import UpdateUserDTO from './users/dtos/users.updateDTO.js';
import CreateMediaDTO from './media/dtos/media.createDTO.js';
import CreateReviewDTO from './reviews/dtos/review.createDTO.js';
import CreateActivityLogDTO from './activity_logs/dtos/activity_log.dto.js';

const main = async () => {
  await connectDB();

  const userService = new UserService();
  const mediaService = new MediaService();
  const reviewService = new ReviewService();
  const activityLogService = new ActivityLogService();


  const showMainMenu = () => {
    console.log(chalk.bold.yellow('\n--- MENÚ PRINCIPAL ---'));
    console.log('1. Gestionar Usuarios');
    console.log('2. Gestionar Media');
    console.log('3. Gestionar Reseñas (Reviews)');
    console.log('4. Ver Logs de Actividad');
    console.log('5. Salir');
    return readlineSync.question('Elige una opcion: ');
  };

  const manageUsers = async () => {
    console.log(chalk.bold.cyan('\n--- Gestionar Usuarios ---'));
    console.log('1. Crear Usuario');
    console.log('2. Ver todos los Usuarios');
    console.log('3. Buscar Usuario por ID');
    console.log('4. Actualizar Usuario');
    console.log('5. Eliminar Usuario');
    const choice = readlineSync.question('Elige una opcion: ');

    switch (choice) {
      case '1': {
        const email = readlineSync.question('Email: ');
        const password = readlineSync.question('Contrasena: ', { hideEchoBack: true });
        const displayName = readlineSync.question('Nombre de usuario: ');

   
        const userData = new CreateUserDTO({ email, password, displayName });
        const newUser = await userService.createUser(userData);
        console.log(chalk.green('Usuario creado:'), newUser);

        const logData = new CreateActivityLogDTO({ userId: newUser._id, actionType: 'USER_CREATED' });
        await activityLogService.createLog(logData);
        console.log(chalk.blue('Log de actividad registrado.'));
        break;
      }
      case '2': {
        const allUsers = await userService.getAllUsers();
        console.log(chalk.green('Todos los usuarios:'), allUsers);
        break;
      }
      case '3': {
        const userId = readlineSync.question('ID del usuario: ');
        const user = await userService.getUserById(userId);
        console.log(chalk.green('Usuario encontrado:'), user || 'Usuario no encontrado');
        break;
      }
      case '4': {
        const userId = readlineSync.question('ID del usuario a actualizar: ');
        const displayName = readlineSync.question(`Nuevo nombre de usuario (dejar en blanco para no cambiar): `);
        const avatarUrl = readlineSync.question(`Nueva URL del avatar (dejar en blanco para no cambiar): `);

        const updateData = new UpdateUserDTO({ displayName, avatarUrl });

        if (Object.keys(updateData).length > 0) {
          const updatedUser = await userService.updateUser(userId, updateData);
          console.log(chalk.green('Usuario actualizado:'), updatedUser);
        } else {
          console.log(chalk.yellow('No se proporcionaron datos para actualizar.'));
        }
        break;
      }
      case '5': {
        const userId = readlineSync.question('ID del usuario a eliminar: ');
        await userService.deleteUser(userId);
        console.log(chalk.green('Usuario eliminado exitosamente.'));
        break;
      }
      default:
        console.log(chalk.red('Opcion no valida.'));
    }
  };

  const manageMedia = async () => {
    console.log(chalk.bold.cyan('\n--- Gestionar Media ---'));
    console.log('1. Crear Media');
    console.log('2. Ver toda la Media');
    const choice = readlineSync.question('Elige una opcion: ');

    switch (choice) {
      case '1': {
        const types = ['Manga', 'Series', 'Movie', 'Book'];
        const typeIndex = readlineSync.keyInSelect(types, 'Selecciona el tipo de media:');
        if (typeIndex === -1) { console.log(chalk.red('Creacion cancelada.')); break; }

        const name = readlineSync.question('Nombre: ');
        const description = readlineSync.question('Descripcion: ');

        const mediaData = new CreateMediaDTO({
          type: types[typeIndex],
          name,
          description
        });

        const newMedia = await mediaService.createMedia(mediaData);
        console.log(chalk.green('Media creada:'), newMedia);
        break;
      }
      case '2': {
        const allMedia = await mediaService.getAllMedia();
        console.log(chalk.green('Toda la media:'), allMedia);
        break;
      }
      default:
        console.log(chalk.red('Opcion no valida.'));
    }
  };

  const manageReviews = async () => {
    console.log(chalk.bold.cyan('\n--- Gestionar Reseñas ---'));
    console.log('1. Crear Reseña');
    console.log('2. Ver Reseñas de una Media');
    const choice = readlineSync.question('Elige una opcion: ');

    switch (choice) {
      case '1': {
        const userId = readlineSync.question('ID del usuario que hace la reseña: ');
        const mediaId = readlineSync.question('ID del medio a reseñar: ');
        const rating = parseInt(readlineSync.question('Calificacion (1-10): '), 10);
        const comment = readlineSync.question('Comentario (opcional): ');

        const reviewData = new CreateReviewDTO({ userId, mediaId, rating, comment });
        const newReview = await reviewService.createReview(reviewData);
        console.log(chalk.green('Reseña creada:'), newReview);

        const logData = new CreateActivityLogDTO({
          userId,
          actionType: 'REVIEW_CREATED',
          payload: { mediaId: mediaId, rating: rating } 
        });
        await activityLogService.createLog(logData);
        console.log(chalk.blue('Log de actividad registrado.'));
        break;
      }
      case '2': {
        const mediaId = readlineSync.question('ID del medio: ');
        const reviews = await reviewService.getAllReviews({ mediaId }); 
        console.log(chalk.green(`Reseñas para el medio ${mediaId}:`), reviews);
        break;
      }
      default:
        console.log(chalk.red('Opcion no valida.'));
    }
  };

  const viewActivityLogs = async () => {
    const userId = readlineSync.question('ID del usuario para ver sus logs: ');
    const logs = await activityLogService.getLogsByUserId(userId);
    console.log(chalk.green(`Logs de actividad para el usuario ${userId}:`), logs);
  };

  // --- Bucle Principal de la Aplicación ---
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
          console.log(chalk.red('Opcion no valida. Por favor, intenta de nuevo.'));
      }
    } catch (error) {
      console.error(chalk.red('\n¡Ocurrio un error!:'), error.message);
    }
  }

  await mongoose.connection.close();
  console.log(chalk.bold.yellow('Conexion con la base de datos cerrada. ¡Hasta luego!'));
};

main();