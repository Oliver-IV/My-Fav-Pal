import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UsersDAO from './users.dao.js'; // adjust if your DAO export is different
import { JWT_SECRET, JWT_EXPIRES_IN } from '../utils/configs.js';

// Register new user (expects name, email, password)
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    // Check existing user - adapt method name if your DAO differs
    const existing = await UsersDAO.findByEmail(email);
    if (existing) return res.status(400).json({ message: 'El email ya está registrado' });

    const hashed = await bcrypt.hash(password, 10);
    const toCreate = { name, email, password: hashed };
    const created = await UsersDAO.create(toCreate);

    // Remove password before returning
    if (created.toObject) {
      const plain = created.toObject();
      delete plain.password;
      return res.status(201).json({ message: 'Usuario creado', user: plain });
    }
    // fallback
    const { password: _, ...userSafe } = created;
    return res.status(201).json({ message: 'Usuario creado', user: userSafe });
  } catch (err) {
    next(err);
  }
}

// Login (expects email, password) -> returns JWT
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await UsersDAO.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN || '1h' });

    return res.status(200).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    next(err);
  }
}
