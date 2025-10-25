# ElySport Backend API

Sistema de gestión para gimnasios construido con Node.js, Express y Supabase.

## Características

- 🔐 Autenticación con Supabase Auth
- 👥 Gestión de usuarios y roles
- 💳 Sistema de suscripciones y pagos
- 📊 Dashboard con estadísticas
- 📝 Registro de asistencias
- 🔔 Sistema de notificaciones
- 📄 Generación de reportes (PDF/Excel)
- 🏗️ Arquitectura con patrones de diseño (Builder, Observer)

## Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Supabase** - Base de datos PostgreSQL y autenticación
- **JWT** - Tokens de autenticación
- **Zod** - Validación de esquemas
- **Winston** - Sistema de logs
- **PDFKit** - Generación de PDFs
- **XLSX** - Generación de Excel

## Instalación Rápida

\`\`\`bash
# Clonar repositorio
git clone <tu-repo>
cd elysport-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# Ejecutar scripts de base de datos en Supabase
# (Ver DEPLOYMENT.md para instrucciones detalladas)

# Iniciar servidor de desarrollo
npm run dev
\`\`\`

## Estructura del Proyecto

\`\`\`
├── src/
│   ├── app.js              # Aplicación principal
│   ├── controllers/        # Controladores de rutas
│   ├── services/          # Lógica de negocio
│   ├── middlewares/       # Middlewares
│   ├── routes/            # Definición de rutas
│   ├── utils/             # Utilidades
│   ├── builders/          # Generadores de reportes
│   ├── observers/         # Sistema de notificaciones
│   └── validators/        # Validadores
├── scripts/               # Scripts SQL para Supabase
├── logs/                  # Archivos de log
└── server.js             # Punto de entrada

\`\`\`

## Scripts Disponibles

\`\`\`bash
npm run dev      # Desarrollo con hot-reload
npm start        # Producción
\`\`\`

## Documentación

- [Guía de Despliegue](DEPLOYMENT.md)
- [Documentación de API](API_DOCUMENTATION.md)

## Variables de Entorno

\`\`\`env
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=tu_url
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# JWT
JWT_ACCESS_SECRET=tu_secret
JWT_REFRESH_SECRET=tu_refresh_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email
EMAIL_PASSWORD=tu_password
EMAIL_FROM=noreply@elysport.com
\`\`\`

## Arquitectura

### Patrones de Diseño

- **Builder Pattern**: Generación flexible de reportes
- **Observer Pattern**: Sistema de notificaciones desacoplado
- **Service Layer**: Separación de lógica de negocio

### Seguridad

- Autenticación con Supabase Auth
- Row Level Security (RLS) en base de datos
- Rate limiting
- Helmet para headers de seguridad
- Validación de datos con Zod

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `POST /api/auth/reset-password` - Restablecer contraseña

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Suscripciones
- `POST /api/subscriptions` - Crear suscripción
- `GET /api/subscriptions` - Listar suscripciones
- `PUT /api/subscriptions/:id` - Actualizar suscripción

### Pagos
- `POST /api/payments` - Registrar pago
- `GET /api/payments` - Listar pagos

### Asistencias
- `POST /api/attendances/check-in` - Entrada
- `POST /api/attendances/check-out` - Salida
- `GET /api/attendances` - Listar asistencias

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/revenue` - Ingresos por período

### Reportes
- `GET /api/reports/users` - Reporte de usuarios
- `GET /api/reports/payments` - Reporte de pagos
- `GET /api/reports/attendances` - Reporte de asistencias

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado y confidencial.

## Contacto

Para soporte o consultas, contacta al equipo de desarrollo.
