import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './users/entities/user.entity.js';
import Media from './media/entities/media.entity.js';
import List from './lists/entities/list.entity.js';
import Review from './reviews/entities/review.entity.js'; 

dotenv.config();

const MONGODB_URL_CONNECTION = "mongodb://localhost:27017/myfavpal";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL || MONGODB_URL_CONNECTION);
    console.log('MongoDB Connected for Seeding...');
  } catch (err) {
    console.error(`Error connecting to DB for seeding: ${err.message}`);
    process.exit(1);
  }
};

const seedUsers = [
  { displayName: 'CompaOli', email: 'oliver@guasave.com', city: 'Guasave, Sinaloa' },
  { displayName: 'Door', email: 'jullian@guasave.com', city: 'Los Mochis, Sinaloa' },
  { displayName: 'Hiram', email: 'carlos@guasave.com', city: 'Hermosillo, Sonora' },
  { displayName: 'Enmolada', email: 'josue@guasave.com', city: 'Cd. Obregón, Sonora' },
];

const seedMedia = [
  { name: 'Berserk', type: 'Manga', platform: ['Dark Horse'], link: 'https://example.com/berserk', status: 'Ongoing', poster: 'https://upload.wikimedia.org/wikipedia/en/6/6a/Berserk_vol01_cover.jpg' },
  { name: 'Vagabond', type: 'Manga', platform: ['VIZ Media'], link: 'https://example.com/vagabond', status: 'Hiatus', poster: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Vagabond_manga_volume_1.jpg' },
  { name: 'Breaking Bad', type: 'Series', platform: ['Netflix'], link: 'https://example.com/breakingbad', status: 'Completed', poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg' },
  { name: 'The Boys', type: 'Series', platform: ['Prime Video'], link: 'https://example.com/theboys', status: 'Ongoing', poster: 'https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg' },
  { name: 'The Godfather', type: 'Movie', platform: ['Hulu'], link: 'https://example.com/godfather', status: 'Completed', poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
  { name: 'Dune: Part Two', type: 'Movie', platform: ['Max'], link: 'https://example.com/dune2', status: 'Released', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg' },
  { name: 'Project Hail Mary', type: 'Book', platform: ['Audible'], link: 'https://example.com/hailmary', status: 'Published', poster: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1597695864i/54493401.jpg' },
];
const importData = async () => {
  try {
    console.log('Destroying existing data...');
    await List.deleteMany();
    await Media.deleteMany();
    await User.deleteMany();
    await Review.deleteMany(); 
    console.log('Data destroyed.');

    console.log('Inserting new data...');

    const createdMedia = await Media.insertMany(seedMedia);
    console.log(`${createdMedia.length} media items inserted.`);

    const password = 'guasave777';
    const hashedPassword = await bcrypt.hash(password, 10);

    const usersToCreate = seedUsers.map((user, index) => {
      let userWatchlistMedia = [];
      let userFavoritesIds = []; // 🚨 Campo Favorites

      if (index === 0) { // oliver@guasave.com
        userWatchlistMedia = [createdMedia[0], createdMedia[2], createdMedia[6]]; 
        userFavoritesIds = [createdMedia[0]._id, createdMedia[2]._id, createdMedia[4]._id];
      }
      if (index === 1) { // jullian@guasave.com
        userWatchlistMedia = [createdMedia[1], createdMedia[3]];
        userFavoritesIds = [createdMedia[1]._id, createdMedia[3]._id];
      }
      if (index === 2) { // carlos@guasave.com
        userWatchlistMedia = [createdMedia[4], createdMedia[5]]; 
        userFavoritesIds = [createdMedia[5]._id];
      }
      if (index === 3) { // josue@guasave.com
        userWatchlistMedia = [createdMedia[2], createdMedia[0], createdMedia[1], createdMedia[4]]; 
        userFavoritesIds = [createdMedia[6]._id, createdMedia[4]._id, createdMedia[2]._id];
      }
      
      const watchlist = userWatchlistMedia.map(media => ({
          mediaName: media.name,
          type: media.type,
          platform: media.platform[0],
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

    const listsToCreate = [
      { name: 'Must-Read Manga', description: 'The absolute best manga series.', ownerId: createdUsers[0]._id, items: [{ mediaId: createdMedia[0]._id }, { mediaId: createdMedia[1]._id }], visibility: 'public' },
      { name: 'Top Tier TV', description: 'Shows that changed the game.', ownerId: createdUsers[0]._id, items: [{ mediaId: createdMedia[2]._id }, { mediaId: createdMedia[3]._id }], visibility: 'private' },
      { name: 'Goated Series', description: 'Just goated stuff.', ownerId: createdUsers[1]._id, items: [{ mediaId: createdMedia[3]._id }], visibility: 'public' },
      { name: 'Cinema Classics', description: 'Movies everyone should see.', ownerId: createdUsers[2]._id, items: [{ mediaId: createdMedia[4]._id }, { mediaId: createdMedia[5]._id }], visibility: 'public' },
    ];

    const createdLists = await List.insertMany(listsToCreate);
    console.log(`${createdLists.length} lists inserted.`);

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
    await List.deleteMany();
    await Media.deleteMany();
    await User.deleteMany();
    await Review.deleteMany(); 

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