import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const PORT = process.env.PORT || 3000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/my-fav-pal';
