import UserService from './users.service.js';
import {
  RegisterUserDTO,
  LoginUserDTO,
  UpdateUserDTO,
  ChangePasswordDTO,
  UserResponseDTO,
  WatchlistItemDTO,
} from './dtos/user.dto.js';

const userService = new UserService();

// Registro de usuario
export const register = async (req, res) => {
  try {
    const registerDTO = new RegisterUserDTO(req.body);
    const errors = registerDTO.validate();

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const result = await userService.register(registerDTO);

    console.log(result) ;
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: result,
    });
  } catch (error) {
    console.log(error) ;
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Login de usuario
export const login = async (req, res) => {
  try {
    const loginDTO = new LoginUserDTO(req.body);
    const errors = loginDTO.validate();

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const result = await userService.login(loginDTO.email, loginDTO.password);

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener perfil del usuario autenticado
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: new UserResponseDTO(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Actualizar perfil del usuario autenticado
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateDTO = new UpdateUserDTO(req.body);
    const errors = updateDTO.validate();

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const updatedUser = await userService.updateUser(userId, updateDTO);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: new UserResponseDTO(updatedUser),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cambiar contraseña
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const changePasswordDTO = new ChangePasswordDTO(req.body);
    const errors = changePasswordDTO.validate();

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    await userService.changePassword(
      userId,
      changePasswordDTO.oldPassword,
      changePasswordDTO.newPassword
    );

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Eliminar cuenta del usuario autenticado
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const deletedUser = await userService.deleteUser(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cuenta eliminada exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener todos los usuarios (puede ser protegida o pública según necesites)
export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      data: users.map((user) => new UserResponseDTO(user)),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener usuario por ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: new UserResponseDTO(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getAllUsers,
  getUserById,
};
