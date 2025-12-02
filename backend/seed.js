import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load Models
import User from './users/entities/user.entity.js';
import Media from './media/entities/media.entity.js';
import List from './lists/entities/list.entity.js';

// Load env vars
dotenv.config();

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB Connected for Seeding...');
  } catch (err) {
    console.error(`Error connecting to DB for seeding: ${err.message}`);
    process.exit(1);
  }
};

// --- SEED DATA ---

const seedUsers = [
  { displayName: 'CompaOli', email: 'oliver@guasave.com' },
  { displayName: 'Door', email: 'jullian@guasave.com' },
  { displayName: 'Hiram', email: 'carlos@guasave.com' },
  { displayName: 'Enmolada', email: 'josue@guasave.com' },
];

// Corrected: 'title' changed to 'name', 'platform' is now an array
const seedMedia = [
  // Manga
  { name: 'Berserk', type: 'Manga', platform: ['Dark Horse'], link: 'https://example.com/berserk', status: 'Ongoing' },
  { name: 'Vagabond', type: 'Manga', platform: ['VIZ Media'], link: 'https://example.com/vagabond', status: 'Hiatus' },
  // Series
  { name: 'Breaking Bad', type: 'Series', platform: ['Netflix'], link: 'https://example.com/breakingbad', status: 'Completed' },
  { name: 'The Boys', type: 'Series', platform: ['Prime Video'], link: 'https://example.com/theboys', status: 'Ongoing' },
  // Movies
  { name: 'The Godfather', type: 'Movie', platform: ['Hulu'], link: 'https://example.com/godfather', status: 'Completed' },
  { name: 'Dune: Part Two', type: 'Movie', platform: ['Max'], link: 'https://example.com/dune2', status: 'Released' },
  // Books
  { name: 'Project Hail Mary', type: 'Book', platform: ['Audible'], link: 'https://example.com/hailmary', status: 'Published' },
];

// --- SCRIPT LOGIC ---

const importData = async () => {
  try {
    console.log('Destroying existing data...');
    await List.deleteMany();
    await Media.deleteMany();
    await User.deleteMany();
    console.log('Data destroyed.');

    console.log('Inserting new data...');

    // 1. Insert Media
    const createdMedia = await Media.insertMany(seedMedia);
    console.log(`${createdMedia.length} media items inserted.`);

    // 2. Prepare and Insert Users (with watchlists)
    const password = 'guasave777';
    const hashedPassword = await bcrypt.hash(password, 10);

    const usersToCreate = seedUsers.map((user, index) => {
      let userWatchlistMedia = [];
      // Assign different media to each user's watchlist
      if (index === 0) userWatchlistMedia = [createdMedia[0], createdMedia[2], createdMedia[6]]; // CompaOli
      if (index === 1) userWatchlistMedia = [createdMedia[1], createdMedia[3]]; // Door
      if (index === 2) userWatchlistMedia = [createdMedia[4], createdMedia[5]]; // Hiram
      if (index === 3) userWatchlistMedia = [createdMedia[0], createdMedia[1], createdMedia[4]]; // Enmolada
      
      // Corrected: Create watchlist items that match the User schema
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

    // 3. Prepare and Insert Lists
    const listsToCreate = [
      // CompaOli's Lists - Corrected: 'user' to 'ownerId' and 'items' structure
      { name: 'Must-Read Manga', description: 'The absolute best manga series.', ownerId: createdUsers[0]._id, items: [{ mediaId: createdMedia[0]._id }, { mediaId: createdMedia[1]._id }], visibility: 'public' },
      { name: 'Top Tier TV', description: 'Shows that changed the game.', ownerId: createdUsers[0]._id, items: [{ mediaId: createdMedia[2]._id }, { mediaId: createdMedia[3]._id }], visibility: 'private' },
      // Door's List
      { name: 'Goated Series', description: 'Just goated stuff.', ownerId: createdUsers[1]._id, items: [{ mediaId: createdMedia[3]._id }], visibility: 'public' },
      // Hiram's Lists
      { name: 'Cinema Classics', description: 'Movies everyone should see.', ownerId: createdUsers[2]._id, items: [{ mediaId: createdMedia[4]._id }, { mediaId: createdMedia[5]._id }], visibility: 'public' },
    ];

    const createdLists = await List.insertMany(listsToCreate);
    console.log(`${createdLists.length} lists inserted.`);

    // Update users with their created lists
    for (const list of createdLists) {
        await User.findByIdAndUpdate(list.ownerId, { $push: { lists: list._id } });
    }

    console.log('\n--- Verifying all created users ---');
    // Corrected: The populate will not work on your current watchlist schema, so we fetch without it.
    const allUsers = await User.find({}).populate('lists');
    console.log(JSON.stringify(allUsers, null, 2));
    console.log('------------------------------------');

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