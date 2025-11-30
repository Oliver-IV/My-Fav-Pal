# Guía Rápida - API de Usuarios

## Iniciar el Servidor

```bash
# Opción 1: Servidor Express (Recomendado)
npm start

# Opción 2: Con auto-reload (Node v18.11+)
npm run dev

# Opción 3: CLI legacy (menú interactivo)
npm run cli
```

## Probar la API con cURL

### 1. Verificar que el servidor está corriendo
```bash
curl http://localhost:3000
```

### 2. Registrar un nuevo usuario
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"carlos@example.com\",\"password\":\"password123\",\"displayName\":\"Carlos\"}"
```

### 3. Hacer login (guardar el token que te devuelve)
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"carlos@example.com\",\"password\":\"password123\"}"
```

### 4. Obtener tu perfil (reemplaza TOKEN con el token que recibiste)
```bash
curl -X GET http://localhost:3000/api/users/me/profile \
  -H "Authorization: Bearer TOKEN"
```

### 5. Agregar item a watchlist
```bash
curl -X POST http://localhost:3000/api/users/me/watchlist \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"mediaId\":\"507f1f77bcf86cd799439011\",\"mediaName\":\"Breaking Bad\",\"type\":\"series\",\"status\":\"Watching\",\"platform\":\"Netflix\"}"
```

## Probar con Postman/Thunder Client

1. **Importar colección**: Crea peticiones para cada endpoint
2. **Variables de entorno**: 
   - `baseUrl`: `http://localhost:3000`
   - `token`: (se actualizará después del login)

### Ejemplo de petición en Postman:

**POST** `{{baseUrl}}/api/users/register`
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "displayName": "Usuario Test"
}
```

**POST** `{{baseUrl}}/api/users/login`
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**GET** `{{baseUrl}}/api/users/me/profile`
- Headers: `Authorization: Bearer {{token}}`

## Endpoints Disponibles

### Públicos (sin autenticación):
- `POST /api/users/register` - Registrar usuario
- `POST /api/users/login` - Login
- `GET /api/users` - Listar todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID

### Protegidos (requieren token):
- `GET /api/users/me/profile` - Ver mi perfil
- `PUT /api/users/me/profile` - Actualizar mi perfil
- `POST /api/users/me/change-password` - Cambiar contraseña
- `DELETE /api/users/me/account` - Eliminar mi cuenta
- `GET /api/users/me/watchlist` - Ver mi watchlist
- `POST /api/users/me/watchlist` - Agregar a watchlist
- `PUT /api/users/me/watchlist/:itemId` - Actualizar item
- `DELETE /api/users/me/watchlist/:itemId` - Eliminar item

## Errores Comunes

### Error de conexión a MongoDB
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solución**: Asegúrate de que MongoDB está corriendo (`mongod`)

### Token inválido
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```
**Solución**: Haz login de nuevo para obtener un nuevo token

### Email ya existe
```json
{
  "success": false,
  "message": "El email ya está registrado"
}
```
**Solución**: Usa otro email o haz login con ese email

## Ver la documentación completa
Consulta `API_DOCUMENTATION.md` para más detalles.
