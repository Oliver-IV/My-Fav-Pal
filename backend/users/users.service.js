import User from './entities/user.entity.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../utils/configs.js';

export default class UserService {
  constructor() {}

  // Generar token JWT
  generateToken(userId, email) {
    return jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // Registrar un nuevo usuario
  async register(userData) {
    const { email, password, displayName, avatarUrl } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const user = new User({
      email,
      password: hashedPassword,
      displayName,
      avatarUrl,
    });

    await user.save();

    // Generar token
    const token = this.generateToken(user._id, user.email);

    return {
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      token,
    };
  }

  // Login
  async login(email, password) {
    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token
    const token = this.generateToken(user._id, user.email);

    return {
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      token,
    };
  }

  // Crear usuario (sin autenticación, para uso interno)
  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({
      ...userData,
      password: hashedPassword,
    });
    return await user.save();
  }

  // Obtener todos los usuarios (sin mostrar contraseñas)
  async getAllUsers() {
    return await User.find().select('-password');
  }

  // Obtener usuario por ID
  async getUserById(id) {
    return await User.findById(id).select('-password');
  }

  // Obtener usuario por email
  async getUserByEmail(email) {
    return await User.findOne({ email }).select('-password');
  }

  // Actualizar usuario
  async updateUser(id, updateData) {
    // No permitir actualizar la contraseña directamente
    if (updateData.password) {
      delete updateData.password;
    }

    return await User.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true 
    }).select('-password');
  }

  // Cambiar contraseña
  async changePassword(id, oldPassword, newPassword) {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña antigua
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Contraseña actual incorrecta');
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Contraseña actualizada exitosamente' };
  }

  // Eliminar usuario
  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  // Agregar item a watchlist
  async addToWatchlist(userId, watchlistItem) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.watchlist.push(watchlistItem);
    await user.save();

    return user.watchlist;
  }

  // Actualizar item en watchlist
  async updateWatchlistItem(userId, itemId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const item = user.watchlist.id(itemId);
    if (!item) {
      throw new Error('Item no encontrado en watchlist');
    }

    Object.assign(item, updateData);
    await user.save();

    return user.watchlist;
  }

  // Eliminar item de watchlist
  async removeFromWatchlist(userId, itemId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.watchlist.pull(itemId);
    await user.save();

    return user.watchlist;
  }

  // Obtener watchlist de un usuario
  async getWatchlist(userId) {
    const user = await User.findById(userId).populate('watchlist.mediaId');
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user.watchlist;
  }
}