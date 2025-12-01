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

**Nota:** Todas las rutas de watchlist requieren el header de autorización:
```
Authorization: Bearer <tu-token-jwt>
```

#### Obtener Watchlist
```http
GET /api/media/watchlist
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "mediaName": "Nombre de la Serie",
      "type": "series",
      "platform": "Netflix",
      "status": "Watching",
      "progress": {
        "episode": 5,
        "timestamp": "00:15:30"
      },
      "rating": 8.5,
      "link": "https://...",
      "addedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Agregar Item a Watchlist
```http
POST /api/media/watchlist
Authorization: Bearer <token>
Content-Type: application/json

{
  "mediaName": "Nombre de la Serie",
  "type": "series",
  "platform": "Netflix",
  "status": "Watching",
  "progress": {
    "episode": 5,
    "chapter": 10,
    "timestamp": "00:15:30"
  },
  "rating": 8.5,
  "link": "https://example.com/series"
}
```

**Campos requeridos:**
- `mediaName` - Nombre del contenido
- `type` - Tipo de contenido: `series`, `movie`, `manga`, `book`, `article`
- `status` - Estado del contenido

**Campos opcionales:**
- `platform` - Plataforma (Netflix, Crunchyroll, etc.)
- `progress` - Objeto con `episode`, `chapter`, y/o `timestamp`
- `rating` - Calificación (0-10)
- `link` - URL del contenido
- `posterUrl` - URL de la imagen/poster

**Valores válidos para `status`:**
- `Watching`
- `Completed`
- `On-Hold`
- `Dropped`
- `Plan to Watch`

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Item agregado a watchlist",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "mediaName": "Nombre de la Serie",
      "type": "series",
      "platform": "Netflix",
      "status": "Watching",
      "progress": {
        "episode": 5
      },
      "rating": 8.5,
      "addedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Actualizar Item en Watchlist
```http
PUT /api/media/watchlist/:itemId
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

**Parámetros:**
- `itemId` - ID del item en la watchlist

**Campos actualizables (todos opcionales):**
- `mediaName` - Nuevo nombre
- `type` - Nuevo tipo
- `platform` - Nueva plataforma
- `status` - Nuevo estado
- `progress` - Nuevo progreso
- `rating` - Nueva calificación
- `link` - Nuevo enlace

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Item actualizado en watchlist",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "mediaName": "Nombre de la Serie",
      "status": "Completed",
      "rating": 9,
      "progress": {
        "episode": 10
      }
    }
  ]
}
```

#### Eliminar Item de Watchlist
```http
DELETE /api/media/watchlist/:itemId
Authorization: Bearer <token>
```

**Parámetros:**
- `itemId` - ID del item en la watchlist

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Item eliminado de watchlist",
  "data": []
}
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

### Gestión de Listas (Lists)

Las listas permiten a los usuarios crear colecciones personalizadas de contenido multimedia.

#### Obtener Todas las Listas
```http
GET /api/lists
```

**Respuesta exitosa (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "ownerId": "507f1f77bcf86cd799439012",
    "name": "Mis Favoritas de Ciencia Ficción",
    "description": "Las mejores películas y series de ciencia ficción",
    "visibility": "public",
    "items": [
      {
        "mediaId": "507f1f77bcf86cd799439013"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Obtener Lista por ID
```http
GET /api/lists/:id
```

**Parámetros:**
- `id` - ID de la lista

**Respuesta exitosa (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "ownerId": "507f1f77bcf86cd799439012",
  "name": "Mis Favoritas de Ciencia Ficción",
  "description": "Las mejores películas y series de ciencia ficción",
  "visibility": "public",
  "items": [
    {
      "mediaId": "507f1f77bcf86cd799439013"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Crear Nueva Lista
```http
POST /api/lists
Content-Type: application/json

{
  "ownerId": "507f1f77bcf86cd799439012",
  "name": "Mis Favoritas de Ciencia Ficción",
  "description": "Las mejores películas y series de ciencia ficción",
  "visibility": "public",
  "items": [
    {
      "mediaId": "507f1f77bcf86cd799439013"
    }
  ]
}
```

**Campos requeridos:**
- `ownerId` - ID del usuario propietario
- `name` - Nombre de la lista

**Campos opcionales:**
- `description` - Descripción de la lista
- `visibility` - Visibilidad: `public` o `private` (default: `private`)
- `items` - Array de items (cada item contiene `mediaId`)

**Respuesta exitosa (201):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "ownerId": "507f1f77bcf86cd799439012",
  "name": "Mis Favoritas de Ciencia Ficción",
  "description": "Las mejores películas y series de ciencia ficción",
  "visibility": "public",
  "items": [
    {
      "mediaId": "507f1f77bcf86cd799439013"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Actualizar Lista
```http
PUT /api/lists/:id
Content-Type: application/json

{
  "name": "Mis Favoritas de Sci-Fi",
  "description": "Colección actualizada",
  "visibility": "private",
  "items": [
    {
      "mediaId": "507f1f77bcf86cd799439013"
    },
    {
      "mediaId": "507f1f77bcf86cd799439014"
    }
  ]
}
```

**Parámetros:**
- `id` - ID de la lista

**Campos opcionales (solo se actualizan los campos proporcionados):**
- `name` - Nuevo nombre
- `description` - Nueva descripción
- `visibility` - Nueva visibilidad
- `items` - Nuevos items

**Respuesta exitosa (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "ownerId": "507f1f77bcf86cd799439012",
  "name": "Mis Favoritas de Sci-Fi",
  "description": "Colección actualizada",
  "visibility": "private",
  "items": [
    {
      "mediaId": "507f1f77bcf86cd799439013"
    },
    {
      "mediaId": "507f1f77bcf86cd799439014"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

#### Eliminar Lista
```http
DELETE /api/lists/:id
```

**Parámetros:**
- `id` - ID de la lista

**Respuesta exitosa (204):**
Sin contenido (No Content)

## 🧪 Pruebas con cURL - Listas

### Crear una lista
```bash
curl -X POST http://localhost:3000/api/lists \
  -H "Content-Type: application/json" \
  -d '{
    "ownerId": "507f1f77bcf86cd799439012",
    "name": "Mis Favoritas",
    "description": "Mi colección personal",
    "visibility": "public"
  }'
```

### Obtener todas las listas
```bash
curl -X GET http://localhost:3000/api/lists
```

### Obtener una lista específica
```bash
curl -X GET http://localhost:3000/api/lists/507f1f77bcf86cd799439011
```

### Actualizar una lista
```bash
curl -X PUT http://localhost:3000/api/lists/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Nombre",
    "visibility": "private"
  }'
```

### Eliminar una lista
```bash
curl -X DELETE http://localhost:3000/api/lists/507f1f77bcf86cd799439011
```

## 🎬 Gestión de Watchlist (Media)

La watchlist permite a los usuarios hacer seguimiento de películas, series, manga, libros y otros contenidos multimedia.

### Obtener Watchlist del Usuario

```http
GET /api/media/watchlist
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "mediaName": "Attack on Titan",
      "type": "series",
      "platform": "Crunchyroll",
      "link": "https://crunchyroll.com/attack-on-titan",
      "status": "Watching",
      "progress": {
        "episode": 15,
        "timestamp": "00:12:30"
      },
      "rating": 9.5,
      "posterUrl": "https://example.com/poster.jpg",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Agregar Item a Watchlist

```http
POST /api/media/watchlist
Authorization: Bearer <token>
Content-Type: application/json

{
  "mediaName": "Attack on Titan",
  "type": "series",
  "platform": "Crunchyroll",
  "link": "https://crunchyroll.com/attack-on-titan",
  "status": "Watching",
  "progress": {
    "episode": 15,
    "timestamp": "00:12:30"
  },
  "rating": 9.5,
  "posterUrl": "https://example.com/poster.jpg"
}
```

**Campos requeridos:**
- `mediaName` - Nombre del contenido
- `type` - Tipo de contenido: `series`, `movie`, `manga`, `book`, `article`
- `status` - Estado: `Watching`, `Completed`, `On-Hold`, `Dropped`, `Plan to Watch`

**Campos opcionales:**
- `platform` - Plataforma donde se consume (Netflix, Crunchyroll, etc.)
- `link` - URL externa del contenido
- `progress` - Objeto con progreso:
  - `episode` - Episodio actual
  - `chapter` - Capítulo actual (para manga/libros)
  - `page` - Página actual
  - `timestamp` - Timestamp del video (formato: "HH:MM:SS")
- `rating` - Calificación personal (0-10)
- `posterUrl` - URL de la imagen/poster
- `lastUrl` - Última URL visitada
- `reviewId` - ID de la reseña asociada

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Item agregado a watchlist",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "mediaName": "Attack on Titan",
      "type": "series",
      "platform": "Crunchyroll",
      "link": "https://crunchyroll.com/attack-on-titan",
      "status": "Watching",
      "progress": {
        "episode": 15,
        "timestamp": "00:12:30"
      },
      "rating": 9.5,
      "posterUrl": "https://example.com/poster.jpg",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Actualizar Item en Watchlist

```http
PUT /api/media/watchlist/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Completed",
  "progress": {
    "episode": 25
  },
  "rating": 10
}
```

**Parámetros:**
- `itemId` - ID del item en la watchlist

**Campos actualizables (todos opcionales):**
- Cualquier campo del item puede ser actualizado

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Item actualizado en watchlist",
  "data": [...]
}
```

### Eliminar Item de Watchlist

```http
DELETE /api/media/watchlist/:itemId
Authorization: Bearer <token>
```

**Parámetros:**
- `itemId` - ID del item en la watchlist

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Item eliminado de watchlist",
  "data": [...]
}
```

## 🧪 Pruebas con cURL - Watchlist

### Obtener watchlist
```bash
curl -X GET http://localhost:3000/api/media/watchlist \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Agregar item a watchlist
```bash
curl -X POST http://localhost:3000/api/media/watchlist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mediaName": "Attack on Titan",
    "type": "series",
    "platform": "Crunchyroll",
    "status": "Watching",
    "progress": {
      "episode": 15
    },
    "rating": 9.5
  }'
```

### Actualizar item en watchlist
```bash
curl -X PUT http://localhost:3000/api/media/watchlist/ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Completed",
    "rating": 10
  }'
```

### Eliminar item de watchlist
```bash
curl -X DELETE http://localhost:3000/api/media/watchlist/ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📋 Endpoints Disponibles

### Usuarios (`/api/users`)
- `POST /register` - Registrar usuario
- `POST /login` - Iniciar sesión
- `GET /` - Obtener todos los usuarios
- `GET /:id` - Obtener usuario por ID
- `GET /me/profile` - Obtener perfil (protegido)
- `PUT /me/profile` - Actualizar perfil (protegido)
- `POST /me/change-password` - Cambiar contraseña (protegido)
- `DELETE /me/account` - Eliminar cuenta (protegido)

### Media y Watchlist (`/api/media`)
- `GET /watchlist` - Obtener watchlist del usuario (protegido)
- `POST /watchlist` - Agregar item a watchlist (protegido)
- `PUT /watchlist/:itemId` - Actualizar item en watchlist (protegido)
- `DELETE /watchlist/:itemId` - Eliminar item de watchlist (protegido)

### Listas (`/api/lists`)
- `GET /` - Obtener todas las listas
- `GET /:id` - Obtener lista por ID
- `POST /` - Crear nueva lista
- `PUT /:id` - Actualizar lista
- `DELETE /:id` - Eliminar lista

### Media - Watchlist (`/api/media`)
- `GET /watchlist` - Obtener watchlist del usuario (protegido)
- `POST /watchlist` - Agregar item a watchlist (protegido)
- `PUT /watchlist/:itemId` - Actualizar item en watchlist (protegido)
- `DELETE /watchlist/:itemId` - Eliminar item de watchlist (protegido)

**Nota:** Los módulos de Reviews y Activity Logs están en desarrollo y serán documentados próximamente.

## 🐛 Reportar Bugs

Si encuentras algún bug, por favor abre un issue en [GitHub Issues](https://github.com/Oliver-IV/My-Fav-Pal/issues).
