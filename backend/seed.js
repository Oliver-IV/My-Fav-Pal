import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './users/entities/user.entity.js';
import Media from './media/entities/media.entity.js';
import List from './lists/entities/list.entity.js';
import Review from './reviews/entities/review.entity.js'; 

dotenv.config();

// 🚨 Es mejor usar variables de entorno para esto.
const MONGODB_URL_CONNECTION = process.env.MONGODB_URL || "mongodb://localhost:27017/myfavpal";

// --- Conexión a la BD ---
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URL_CONNECTION);
        console.log('MongoDB Connected for Seeding...');
    } catch (err) {
        console.error(`Error connecting to DB for seeding: ${err.message}`);
        process.exit(1);
    }
};

// --- Datos Fijos ---
const seedUsers = [
    { displayName: 'CompaOli', email: 'oliver@guasave.com', city: 'Guasave, Sinaloa' },
    { displayName: 'Door', email: 'jullian@guasave.com', city: 'Los Mochis, Sinaloa' },
    { displayName: 'Hiram', email: 'carlos@guasave.com', city: 'Hermosillo, Sonora' },
    { displayName: 'Enmolada', email: 'josue@guasave.com', city: 'Cd. Obregón, Sonora' },
];

const seedMedia = [
    { name: 'Berserk', type: 'Manga', platform: ['Dark Horse'], link: 'https://example.com/berserk', status: 'Ongoing', poster: 'https://i.pinimg.com/originals/1c/bb/f9/1cbbf9050725f28c412712003d01017c.jpg' },
    { name: 'Vagabond', type: 'Manga', platform: ['VIZ Media'], link: 'https://example.com/vagabond', status: 'Hiatus', poster: 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781421538136/vagabond-vol-32-9781421538136_hr.jpg' },
    { name: 'Breaking Bad', type: 'Series', platform: ['Netflix'], link: 'https://example.com/breakingbad', status: 'Completed', poster: 'https://tse3.mm.bing.net/th/id/OIP.rAuPvbH2JYEa6KyuM4161AHaKj?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3' },
    { name: 'The Boys', type: 'Series', platform: ['Prime Video'], link: 'https://example.com/theboys', status: 'Ongoing', poster: 'https://freshcomics.s3.amazonaws.com/issue_covers/MAR198810.jpg' },
    { name: 'The Godfather', type: 'Movie', platform: ['Hulu'], link: 'https://example.com/godfather', status: 'Completed', poster: 'https://image.tmdb.org/t/p/original/d6LbJZO8ruvXgOjjGRgjtdYpJS4.jpg' },
    { name: 'Dune: Part Two', type: 'Movie', platform: ['Max'], link: 'https://example.com/dune2', status: 'Released', poster: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5b3d46e0-85e3-4dac-a66c-01ef1a11172a/dg6v4iy-2ad15f1f-b897-4770-ab89-8c82fc672823.jpg/v1/fill/w_1280,h_1600,q_75,strp/dune__part_two_poster_2__updated_release_date__by_paramountj_dg6v4iy-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTYwMCIsInBhdGgiOiJcL2ZcLzViM2Q0NmUwLTg1ZTMtNGRhYy1hNjZjLTAxZWYxYTExMTcyYVwvZGc2djRpeS0yYWQxNWYxZi1iODk3LTQ3NzAtYWI4OS04YzgyZmM2NzI4MjMuanBnIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.igEh5xkHFya2Li_O42n-sq0-PGgmWT7L8x1-jqkfUFk' },
    { name: 'Project Hail Mary', type: 'Book', platform: ['Audible'], link: 'https://example.com/hailmary', status: 'Published', poster: 'https://thebooksblender.altervista.org/wp-content/uploads/2023/02/Project-Hail-Mary-copertina.jpg' },
];

const importData = async () => {
    try {
        console.log('Destroying existing data...');
        await List.deleteMany({});
        await Media.deleteMany({});
        await User.deleteMany({});
        await Review.deleteMany({}); 
        console.log('Data destroyed.');

        console.log('Inserting new data...');

        // 1. Insertar Media y obtener los objetos con _id
        const createdMedia = await Media.insertMany(seedMedia);
        console.log(`${createdMedia.length} media items inserted.`);

        const password = 'guasave777';
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Mapear y crear los usuarios
        const usersToCreate = seedUsers.map((user, index) => {
            let userWatchlistMedia = [];
            let userFavoritesIds = []; 

            // Definir qué media va en la watchlist y favoritos para cada usuario
            if (index === 0) { // oliver@guasave.com
                userWatchlistMedia = [createdMedia[0], createdMedia[2], createdMedia[6]]; 
                userFavoritesIds = [createdMedia[0]._id, createdMedia[2]._id, createdMedia[4]._id];
            } else if (index === 1) { // jullian@guasave.com
                userWatchlistMedia = [createdMedia[1], createdMedia[3]];
                userFavoritesIds = [createdMedia[1]._id, createdMedia[3]._id];
            } else if (index === 2) { // carlos@guasave.com
                userWatchlistMedia = [createdMedia[4], createdMedia[5]]; 
                userFavoritesIds = [createdMedia[5]._id];
            } else if (index === 3) { // josue@guasave.com
                userWatchlistMedia = [createdMedia[2], createdMedia[0], createdMedia[1], createdMedia[4]]; 
                userFavoritesIds = [createdMedia[6]._id, createdMedia[4]._id, createdMedia[2]._id];
            }
            
            // 🚨 CORRECCIÓN: La watchlist en el modelo de usuario DEBE contener el mediaId
            // para poder hacer referencias correctas y futuras búsquedas.
            const watchlist = userWatchlistMedia.map(media => ({
                mediaId: media._id,          // 🚨 CLAVE: Referencia al ID de Media
                mediaName: media.name,       // Datos redundantes pero útiles para el front
                type: media.type,
                platform: media.platform[0], // Usas solo el primer elemento del array
                status: 'Plan to Watch',
                link: media.link,
            }));

            return {
                ...user, 
                password: hashedPassword,
                watchlist: watchlist,
                favorites: userFavoritesIds, 
            };
        });

        const createdUsers = await User.insertMany(usersToCreate);
        console.log(`${createdUsers.length} users inserted.`);

        // --- 3. Insertar Reviews ---
        const createdUsersJosue = createdUsers.find(u => u.email === 'josue@guasave.com');

        const seedReviews = [
            {
                mediaId: createdMedia[0]._id, 
                userId: createdUsers[0]._id,
                rating: 5,
                title: 'Una Obra Maestra Oscura',
                body: 'La mejor historia de fantasía jamás escrita. Guts es un personaje icónico y la dirección artística es incomparable.'
            },
            {
                mediaId: createdMedia[2]._id,
                userId: createdUsers[1]._id,
                rating: 4,
                title: 'Serie Esencial',
                body: 'La transformación de Walter White es de las mejores narrativas de la televisión. Un thriller bien ejecutado.'
            },
            {
                mediaId: createdMedia[4]._id,
                userId: createdUsersJosue._id, 
                rating: 3,
                title: 'Un Clásico Inmortal',
                body: 'Simplemente la mejor película de todos los tiempos. Un must-watch para cualquiera.'
            },
        ];

        const createdReviews = await Review.insertMany(seedReviews);
        console.log(`${createdReviews.length} reviews inserted.`);

        // --- 4. Insertar Listas ---
        const listsToCreate = [
            { name: 'Must-Read Manga', description: 'The absolute best manga series.', ownerId: createdUsers[0]._id, items: [{ mediaId: createdMedia[0]._id }, { mediaId: createdMedia[1]._id }], visibility: 'public' },
            { name: 'Top Tier TV', description: 'Shows that changed the game.', ownerId: createdUsers[0]._id, items: [{ mediaId: createdMedia[2]._id }, { mediaId: createdMedia[3]._id }], visibility: 'private' },
            { name: 'Goated Series', description: 'Just goated stuff.', ownerId: createdUsers[1]._id, items: [{ mediaId: createdMedia[3]._id }], visibility: 'public' },
            { name: 'Cinema Classics', description: 'Movies everyone should see.', ownerId: createdUsers[2]._id, items: [{ mediaId: createdMedia[4]._id }, { mediaId: createdMedia[5]._id }], visibility: 'public' },
        ];

        const createdLists = await List.insertMany(listsToCreate);
        console.log(`${createdLists.length} lists inserted.`);

        // --- 5. Actualizar Usuarios con las Listas creadas ---
        for (const list of createdLists) {
            await User.findByIdAndUpdate(list.ownerId, { $push: { lists: list._id } });
        }

        console.log('\n--- Verifying Data ---');
        const josue = await User.findOne({ email: 'josue@guasave.com' });
        console.log('Sample Watchlist Item (Josue):', josue.watchlist[0]);

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error importing data: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await List.deleteMany({});
        await Media.deleteMany({});
        await User.deleteMany({});
        await Review.deleteMany({}); 

        console.log('Data Destroyed Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error destroying data: ${error}`);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    if (process.argv[2] === '-d') {
        await destroyData();
    } else {
        await importData();
    }
};

run();