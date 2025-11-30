# My Fav Pal - Frontend

Frontend desarrollado con Vanilla JavaScript y Web Components para la aplicación My Fav Pal.

## 🏗️ Estructura del Proyecto

```
frontend/
├── package.json        # Configuración de Node
├── server.js           # Servidor Express para servir el frontend
└── public/             # Frontend estático
    ├── index.html      # SPA - Single Page Application
    ├── css/
    │   └── styles.css  # Estilos globales
    ├── js/
    │   ├── app.js      # Router y punto de entrada
    │   └── services/
    │       └── auth.service.js  # Servicio de autenticación
    └── components/     # Web Components
        ├── navbar.js
        ├── login-view.js
        ├── register-view.js
        └── home-view.js
```

## 🚀 Instalación y Uso

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Configurar el Backend

Asegúrate de que el backend esté corriendo en `http://localhost:3000`. 

Si necesitas cambiar la URL del backend, edita la constante `API_URL` en:
- `public/js/services/auth.service.js`

```javascript
const API_URL = 'http://localhost:3000/api';
```

### 3. Iniciar el servidor frontend

```bash
npm start
```

El frontend estará disponible en `http://localhost:8080`

## 🎯 Características Implementadas

### ✅ Autenticación Completa
- **Login**: Inicio de sesión con email y contraseña
- **Registro**: Crear nueva cuenta con validación
- **Logout**: Cerrar sesión y limpiar datos
- **Persistencia**: Token JWT almacenado en localStorage

### ✅ Web Components
- **navbar.js**: Barra de navegación dinámica que cambia según el estado de autenticación
- **login-view.js**: Vista de inicio de sesión
- **register-view.js**: Vista de registro con validación de contraseñas
- **home-view.js**: Dashboard del usuario con información del perfil

### ✅ Router SPA
- Sistema de routing sin recargar la página
- Rutas protegidas (requieren autenticación)
- Redirecciones automáticas

### ✅ Servicios API
- **auth.service.js**: Manejo completo de autenticación
  - `login()`: Iniciar sesión
  - `register()`: Registrar usuario
  - `logout()`: Cerrar sesión
  - `getProfile()`: Obtener perfil del usuario
  - `updateProfile()`: Actualizar perfil

## 🛣️ Rutas Disponibles

| Ruta | Componente | Protegida | Descripción |
|------|-----------|-----------|-------------|
| `/` | `login-view` | No | Página de inicio (redirige a login) |
| `/login` | `login-view` | No | Inicio de sesión |
| `/register` | `register-view` | No | Registro de usuarios |
| `/home` | `home-view` | Sí | Dashboard del usuario |

## 🎨 Diseño

- **Tema oscuro** moderno y elegante
- **Gradientes** en elementos principales
- **Animaciones** suaves y transiciones
- **Responsive** para móviles y tablets
- **Variables CSS** para fácil personalización

## 🔐 Seguridad

- Tokens JWT almacenados en localStorage
- Validación de formularios en el cliente
- Rutas protegidas con middleware de autenticación
- Headers de autorización en todas las peticiones protegidas

## 📝 Uso de Web Components

Los componentes se registran automáticamente y pueden ser usados como etiquetas HTML:

```html
<app-navbar></app-navbar>
<login-view></login-view>
<register-view></register-view>
<home-view></home-view>
```

### Eventos Personalizados

- `auth-changed`: Se dispara cuando el estado de autenticación cambia (login/logout)

```javascript
window.addEventListener('auth-changed', () => {
  // Actualizar UI según el nuevo estado
});
```

## 🔄 Flujo de Autenticación

1. Usuario accede a la aplicación
2. Si no está autenticado, se muestra el login
3. Usuario inicia sesión o se registra
4. Token JWT se guarda en localStorage
5. Usuario es redirigido a `/home`
6. Navbar se actualiza mostrando información del usuario
7. Al cerrar sesión, se limpia localStorage y redirige a login

## 🛠️ Desarrollo

### Agregar nuevos componentes

1. Crear archivo en `public/components/`
2. Definir la clase que extiende `HTMLElement`
3. Implementar `connectedCallback()` y `render()`
4. Registrar con `customElements.define()`
5. Importar en `index.html`

Ejemplo:

```javascript
class MiComponente extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        /* Estilos del componente */
      </style>
      <div>Contenido</div>
    `;
  }
}

customElements.define('mi-componente', MiComponente);
```

### Agregar nuevas rutas

En `public/js/app.js`:

```javascript
router.addRoute('/nueva-ruta', '<mi-componente></mi-componente>');
```

## 📦 Próximas Funcionalidades

- [ ] Gestión de watchlist
- [ ] Gestión de listas personalizadas
- [ ] Sistema de búsqueda de contenido
- [ ] Integración con APIs de películas/series (TMDB)
- [ ] Sistema de reseñas
- [ ] Edición de perfil
- [ ] Cambio de contraseña

## 🐛 Solución de Problemas

### El frontend no se conecta al backend

Verifica que:
1. El backend esté corriendo en el puerto correcto
2. La URL en `auth.service.js` sea correcta
3. CORS esté habilitado en el backend

### Los componentes no se cargan

Verifica que:
1. Todos los scripts usen `type="module"`
2. Las rutas de importación sean correctas
3. Los componentes estén registrados antes de usarse

## 📄 Licencia

MIT

## 👥 Autor

Oliver-IV - [@Oliver-IV](https://github.com/Oliver-IV)
