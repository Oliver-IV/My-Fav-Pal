import User from './entities/user.entity.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../utils/configs.js';

export default class UserService {
	constructor() { }

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
			// Nota: Si city/nationality es parte del registro, debe ir aquí también.
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

	async login(email, password) {
		const user = await User.findOne({ email });
		if (!user) {
			throw new Error('Credenciales inválidas');
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			throw new Error('Credenciales inválidas');
		}

		const token = this.generateToken(user._id, user.email);

		return {
			user: {
				id: user._id,
				email: user.email,
				displayName: user.displayName,
				avatarUrl: user.avatarUrl,
				city: user.city,
				favorites: user.favorites,
			},
			token,
		};
	}

	async createUser(userData) {
		const hashedPassword = await bcrypt.hash(userData.password, 10);
		const user = new User({
			...userData,
			password: hashedPassword,
		});
		return await user.save();
	}

	async getAllUsers() {
		return await User.find().select('-password');
	}


	async getUserById(id) {
		return await User.findById(id).select('-password');
	}


	async getUserByEmail(email) {
		return await User.findOne({ email }).select('-password');
	}


	async updateUser(id, updateData) {
		if (updateData.password) {
			delete updateData.password;
		}

		return await User.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true
		}).select('-password');
	}

	async updateFavorites(userId, favoritesArray) {
		if (!favoritesArray || !Array.isArray(favoritesArray)) {
			throw new Error("El array de favoritos es inválido.");
		}


		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ $set: { favorites: favoritesArray } },
			{ new: true, select: '-password' }
		);

		if (!updatedUser) {
			throw new Error('No se pudo encontrar o actualizar el usuario en la base de datos.');
		}

		return updatedUser;
	}

	async changePassword(id, oldPassword, newPassword) {
		const user = await User.findById(id);
		if (!user) {
			throw new Error('Usuario no encontrado');
		}

		const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
		if (!isPasswordValid) {
			throw new Error('Contraseña actual incorrecta');
		}


		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;
		await user.save();

		return { message: 'Contraseña actualizada exitosamente' };
	}


	async deleteUser(id) {
		return await User.findByIdAndDelete(id);
	}
}