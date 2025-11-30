# My Fav Pal - Guía de Inicio Rápido

## 🚀 Inicio Rápido

### Paso 1: Iniciar el Backend

```bash
cd backend
npm install  # Solo la primera vez
npm start
```

El backend estará en: `http://localhost:3000`

### Paso 2: Iniciar el Frontend

En otra terminal:

```bash
cd frontend
npm install  # Solo la primera vez
npm start
```

El frontend estará en: `http://localhost:8080`

### Paso 3: Usar la Aplicación

1. Abre tu navegador en `http://localhost:8080`
2. Regístrate con un nuevo usuario
3. Inicia sesión
4. Explora tu dashboard

## 📋 Funcionalidades Actuales

- ✅ Registro de usuarios
- ✅ Inicio de sesión
- ✅ Cerrar sesión
- ✅ Ver perfil de usuario
- ✅ Dashboard personalizado

## 🎯 Endpoints del Backend

- `POST /api/users/register` - Registrar usuario
- `POST /api/users/login` - Iniciar sesión
- `GET /api/users/me/profile` - Obtener perfil (requiere auth)
- `PUT /api/users/me/profile` - Actualizar perfil (requiere auth)
- `GET /api/users/me/watchlist` - Ver watchlist (requiere auth)
- `POST /api/users/me/watchlist` - Agregar a watchlist (requiere auth)

## 🔧 Configuración

### Variables de Backend (backend/.env)

```env
JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRES_IN=7d
PORT=3000
MONGODB_URI=mongodb://localhost:27017/my-fav-pal
```

### Variables de Frontend

Si necesitas cambiar la URL del backend, edita:
- `frontend/public/js/services/auth.service.js`

```javascript
const API_URL = 'http://localhost:3000/api';
```

## 📦 Estructura de Datos

### Usuario
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "displayName": "Usuario Ejemplo",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

## ⚠️ Solución de Problemas

### Error: "Cannot connect to backend"
- Verifica que MongoDB esté corriendo
- Verifica que el backend esté en puerto 3000
- Revisa la configuración de CORS en el backend

### Error: "Module not found"
```bash
# Reinstala las dependencias
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: "Unauthorized"
- Verifica que el token JWT no haya expirado
- Cierra sesión y vuelve a iniciar sesión

## 🎨 Personalización

### Colores (frontend/public/css/styles.css)

```css
:root {
  --primary-color: #6366f1;    /* Color principal */
  --secondary-color: #8b5cf6;  /* Color secundario */
  --background: #0f172a;       /* Fondo */
  --surface: #1e293b;          /* Superficie */
}
```

## 📱 Tecnologías Utilizadas

### Frontend
- Vanilla JavaScript (ES6+)
- Web Components
- CSS3 con variables
- Fetch API

### Backend
- Node.js
- Express
- MongoDB
- JWT
- bcrypt

## 🚧 Próximos Pasos

1. Implementar gestión completa de watchlist
2. Integración con API de películas (TMDB)
3. Sistema de listas personalizadas
4. Sistema de reseñas
5. Búsqueda y filtrado de contenido
