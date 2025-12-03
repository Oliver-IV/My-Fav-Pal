
const API_URL = 'http://localhost:3000/api';

class AuthService {
  constructor() {
    this.tokenKey = 'auth_token';
    this.userKey = 'user_data';
  }

  // Obtener el token almacenado
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Guardar token y datos de usuario
  saveAuthData(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Obtener datos del usuario
  getUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!this.getToken();
  }

  // Cerrar sesión
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    window.dispatchEvent(new Event('auth-changed'));
  }

  // Registrar nuevo usuario
  async register(email, password, displayName, avatarUrl = '') {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          displayName,
          avatarUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      // Guardar token y datos del usuario
      this.saveAuthData(data.data.token, data.data.user);
      window.dispatchEvent(new Event('auth-changed'));

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Iniciar sesión
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el login');
      }

      // Guardar token y datos del usuario
      this.saveAuthData(data.data.token, data.data.user);
      window.dispatchEvent(new Event('auth-changed'));

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getProfile() {
    try {
      const response = await fetch(`${API_URL}/users/me/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener el perfil');
      }

      const user = data.data;
      const hasFavorites = user.favorites && Array.isArray(user.favorites);
      const favCount = hasFavorites ? user.favorites.length : 0;
      
      console.log('------------------------------------------------');
      console.log(' AUTH SERVICE (getProfile): Respuesta del Backend recibida.');
      console.log(` ¿Contiene favoritos? ${hasFavorites ? 'Sí' : 'No'}`);
      console.log(`Cantidad de favoritos: ${favCount}`);
      console.log('Objeto User completo a guardar:', user);
      console.log('------------------------------------------------');

      localStorage.setItem(this.userKey, JSON.stringify(user));

      return data;
    } catch (error) {
      console.error("Error en getProfile:", error);
      throw error;
    }
  }

  async updateProfile(displayName, avatarUrl, city) {
    try {
      const response = await fetch(`${API_URL}/users/me/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({
          displayName,
          avatarUrl,
          city, 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar el perfil');
      }

      // Actualizar datos del usuario
      localStorage.setItem(this.userKey, JSON.stringify(data.data));
      window.dispatchEvent(new Event('auth-changed'));

      return data;
    } catch (error) {
      throw error;
    }
  }


  async updateFavorites(favoritesArray) {
    try {
      const response = await fetch(`${API_URL}/users/me/favorites`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({
          favorites: favoritesArray,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar los favoritos');
      }

      localStorage.setItem(this.userKey, JSON.stringify(data.data));
      window.dispatchEvent(new Event('auth-changed'));

      return data;

    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();