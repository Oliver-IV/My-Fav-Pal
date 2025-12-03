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
  { displayName: 'CompaOli', email: 'oliver@guasave.com' },
  { displayName: 'Door', email: 'jullian@guasave.com' },
  { displayName: 'Hiram', email: 'carlos@guasave.com' },
  { displayName: 'Enmolada', email: 'josue@guasave.com' },
];

const seedMedia = [
  { name: 'Berserk', type: 'Manga', platform: ['Dark Horse'], link: 'https://example.com/berserk', status: 'Ongoing' },
  { name: 'Vagabond', type: 'Manga', platform: ['VIZ Media'], link: 'https://example.com/vagabond', status: 'Hiatus' },
  { name: 'Breaking Bad', type: 'Series', platform: ['Netflix'], link: 'https://example.com/breakingbad', status: 'Completed' },
  { name: 'The Boys', type: 'Series', platform: ['Prime Video'], link: 'https://example.com/theboys', status: 'Ongoing' },
  { name: 'The Godfather', type: 'Movie', platform: ['Hulu'], link: 'https://example.com/godfather', status: 'Completed' },
  { name: 'Dune: Part Two', type: 'Movie', platform: ['Max'], link: 'https://example.com/dune2', status: 'Released' },
  { name: 'Project Hail Mary', type: 'Book', platform: ['Audible'], link: 'https://example.com/hailmary', status: 'Published' },
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

      if (index === 0) userWatchlistMedia = [createdMedia[0], createdMedia[2], createdMedia[6]]; 
      if (index === 1) userWatchlistMedia = [createdMedia[1], createdMedia[3]];
      if (index === 2) userWatchlistMedia = [createdMedia[4], createdMedia[5]]; 
      if (index === 3) userWatchlistMedia = [createdMedia[0], createdMedia[1], createdMedia[4]]; 
      
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
      };
    });

    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`${createdUsers.length} users inserted.`);

    const seedReviews = [
        {
          mediaId: createdMedia[0]._id, 
          userId: createdUsers[0]._id,
          rating: 10,
          title: 'Una Obra Maestra Oscura',
          body: 'La mejor historia de fantasía jamás escrita. Guts es un personaje icónico y la dirección artística es incomparable.'
        },
        {
          mediaId: createdMedia[2]._id,
          userId: createdUsers[1]._id,
          rating: 9,
          title: 'Serie Esencial',
          body: 'La transformación de Walter White es de las mejores narrativas de la televisión. Un thriller bien ejecutado.'
        },
        {
          mediaId: createdMedia[4]._id,
          userId: createdUsers[3]._id,
          rating: 10,
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

    console.log('\n--- Verifying all created data (Users with Lists) ---');
    const allUsers = await User.find({}).populate('lists');
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