# My Fav Pal - API de Usuarios con JWT

API REST desarrollada con Node.js, Express y MongoDB que implementa autenticación con JWT para gestionar usuarios y sus watchlists.

## 🚀 Características

- ✅ Registro y login de usuarios
- ✅ Autenticación con JWT (JSON Web Tokens)
- ✅ Hash de contraseñas con bcrypt
- ✅ CRUD completo de usuarios
- ✅ Gestión de watchlist por usuario
- ✅ Validación de datos con DTOs
- ✅ Middleware de autenticación
- ✅ Rutas protegidas

## 📋 Requisitos

- Node.js v14 o superior
- MongoDB v4.4 o superior
- npm o yarn

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/Oliver-IV/My-Fav-Pal.git
cd My-Fav-Pal/my-fav-pal-web-api
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:
```env
JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRES_IN=7d
PORT=3000
MONGODB_URI=mongodb://localhost:27017/my-fav-pal
```

4. Inicia MongoDB (si es local):
```bash
mongod
```

5. Inicia el servidor:
```bash
npm start
```

El servidor estará corriendo en `http://localhost:3000`

## 📚 Endpoints de la API

### Autenticación

#### Registro de Usuario
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123",
  "displayName": "Usuario Ejemplo",
  "avatarUrl": "https://example.com/avatar.jpg" (opcional)
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "usuario@example.com",
      "displayName": "Usuario Ejemplo",
      "avatarUrl": "https://example.com/avatar.jpg"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "usuario@example.com",
      "displayName": "Usuario Ejemplo",
      "avatarUrl": "https://example.com/avatar.jpg"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Perfil de Usuario (Rutas Protegidas)

**Nota:** Todas las rutas protegidas requieren el header de autorización:
```
Authorization: Bearer <tu-token-jwt>
```

#### Obtener Perfil
```http
GET /api/users/me/profile
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@example.com",
    "displayName": "Usuario Ejemplo",
    "avatarUrl": "https://example.com/avatar.jpg",
    "watchlist": [],
    "waitlist": [],
    "lists": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Actualizar Perfil
```http
PUT /api/users/me/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "Nuevo Nombre",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

#### Cambiar Contraseña
```http
POST /api/users/me/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

#### Eliminar Cuenta
```http
DELETE /api/users/me/account
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Cuenta eliminada exitosamente"
}
```

### Gestión de Usuarios

#### Obtener Todos los Usuarios
```http
GET /api/users
```

#### Obtener Usuario por ID
```http
GET /api/users/:id
```

### Watchlist (Rutas Protegidas)

#### Obtener Watchlist
```http
GET /api/users/me/watchlist
Authorization: Bearer <token>
```

#### Agregar Item a Watchlist
```http
POST /api/users/me/watchlist
Authorization: Bearer <token>
Content-Type: application/json

{
  "mediaId": "507f1f77bcf86cd799439011",
  "mediaName": "Nombre de la Serie",
  "type": "series",
  "platform": "Netflix",
  "status": "Watching",
  "progress": {
    "episode": 5,
    "timestamp": "00:15:30"
  },
  "rating": 8.5
}
```

**Valores válidos para `status`:**
- `Watching`
- `Completed`
- `On-Hold`
- `Dropped`
- `Plan to Watch`

#### Actualizar Item en Watchlist
```http
PUT /api/users/me/watchlist/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Completed",
  "rating": 9,
  "progress": {
    "episode": 10
  }
}
```

#### Eliminar Item de Watchlist
```http
DELETE /api/users/me/watchlist/:itemId
Authorization: Bearer <token>
```

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Después de registrarte o hacer login, recibirás un token que debes incluir en el header `Authorization` de todas las peticiones protegidas:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

El token expira en 7 días por defecto (configurable en `.env`).

## 📁 Estructura del Proyecto

```
my-fav-pal-web-api/
├── users/
│   ├── dtos/
│   │   └── user.dto.js         # Data Transfer Objects
│   ├── entities/
│   │   └── user.entity.js      # Modelo de MongoDB
│   ├── users.controller.js     # Controladores
│   ├── users.service.js        # Lógica de negocio
│   └── users.router.js         # Rutas
├── utils/
│   ├── configs.js              # Configuraciones
│   ├── db.js                   # Conexión a MongoDB
│   └── auth.middleware.js      # Middleware de autenticación
├── .env                        # Variables de entorno
├── .env.example                # Ejemplo de variables
├── server.js                   # Servidor Express
├── index.js                    # CLI (legacy)
└── package.json
```

## 🧪 Pruebas con cURL

### Registrar un usuario
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","displayName":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Obtener perfil (reemplaza TOKEN con tu token JWT)
```bash
curl -X GET http://localhost:3000/api/users/me/profile \
  -H "Authorization: Bearer TOKEN"
```

## 📝 Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm start

# Iniciar servidor con nodemon (auto-reload)
npm run dev

# Ejecutar CLI legacy
node index.js
```

## ⚠️ Consideraciones de Seguridad

1. **JWT_SECRET**: Cambia el valor en producción por una clave fuerte y aleatoria
2. **HTTPS**: En producción, siempre usa HTTPS para proteger las credenciales
3. **Rate Limiting**: Considera implementar rate limiting para prevenir ataques de fuerza bruta
4. **Validación**: Todos los datos son validados antes de procesarse
5. **Contraseñas**: Las contraseñas se hashean con bcrypt antes de almacenarse

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autor

Oliver-IV - [@Oliver-IV](https://github.com/Oliver-IV)

## 🐛 Reportar Bugs

Si encuentras algún bug, por favor abre un issue en [GitHub Issues](https://github.com/Oliver-IV/My-Fav-Pal/issues).
