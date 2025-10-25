# Guía de Despliegue - ElySport Backend

## Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase configurada
- Variables de entorno configuradas

## Instalación Local

1. **Clonar el repositorio e instalar dependencias:**
\`\`\`bash
cd backend
npm install
\`\`\`

2. **Configurar variables de entorno:**
\`\`\`bash
cp .env.example .env
# Editar .env con tus credenciales de Supabase y otros servicios
\`\`\`

3. **Configurar Base de Datos en Supabase:**

Ve a tu proyecto de Supabase y ejecuta los scripts SQL en el siguiente orden:

a. **Crear tablas:**
\`\`\`bash
# Copia el contenido de scripts/001_create_tables.sql
# Pégalo en el SQL Editor de Supabase y ejecútalo
\`\`\`

b. **Habilitar Row Level Security:**
\`\`\`bash
# Copia el contenido de scripts/002_enable_rls.sql
# Pégalo en el SQL Editor de Supabase y ejecútalo
\`\`\`

c. **Crear trigger para sincronización de usuarios:**
\`\`\`bash
# Copia el contenido de scripts/003_create_user_trigger.sql
# Pégalo en el SQL Editor de Supabase y ejecútalo
\`\`\`

4. **Iniciar servidor de desarrollo:**
\`\`\`bash
npm run dev
\`\`\`

El servidor estará disponible en `http://localhost:3000`

## Despliegue en Producción

### Opción 1: Vercel

1. **Instalar Vercel CLI:**
\`\`\`bash
npm i -g vercel
\`\`\`

2. **Configurar vercel.json:**
\`\`\`json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
\`\`\`

3. **Desplegar:**
\`\`\`bash
vercel --prod
\`\`\`

4. **Configurar variables de entorno en Vercel:**
- Ir a Project Settings > Environment Variables
- Agregar todas las variables del archivo .env

### Opción 2: Railway

1. **Crear cuenta en Railway.app**

2. **Conectar repositorio de GitHub**

3. **Configurar variables de entorno en Railway**

4. **Railway detectará automáticamente Node.js y desplegará**

### Opción 3: Render

1. **Crear cuenta en Render.com**

2. **Crear nuevo Web Service**

3. **Conectar repositorio**

4. **Configurar:**
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Agregar variables de entorno**

## Variables de Entorno Requeridas

\`\`\`env
# Server
PORT=3000
NODE_ENV="production"

# Supabase
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_ANON_KEY="tu-anon-key"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"

# JWT (para tokens personalizados si los usas)
JWT_ACCESS_SECRET="tu-secret-super-seguro"
JWT_REFRESH_SECRET="tu-refresh-secret-super-seguro"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Email (Nodemailer)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASSWORD="tu-app-password"
EMAIL_FROM="ElySport <noreply@elysport.com>"

# CORS
CORS_ORIGIN="https://tu-frontend.vercel.app"
\`\`\`

## Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Guarda las credenciales (URL, anon key, service role key)

### 2. Ejecutar Scripts SQL

En el SQL Editor de Supabase, ejecuta los scripts en orden:

1. `scripts/001_create_tables.sql` - Crea todas las tablas
2. `scripts/002_enable_rls.sql` - Habilita seguridad a nivel de fila
3. `scripts/003_create_user_trigger.sql` - Sincroniza usuarios de Auth

### 3. Configurar Autenticación

En Supabase Dashboard > Authentication > Settings:

- **Email Auth**: Habilitado
- **Confirm Email**: Opcional (recomendado para producción)
- **Email Templates**: Personaliza los correos de verificación y recuperación

### 4. Configurar Políticas RLS (Row Level Security)

Las políticas ya están configuradas en el script `002_enable_rls.sql`, pero puedes ajustarlas según tus necesidades en:

Supabase Dashboard > Authentication > Policies

## Monitoreo y Logs

- Usar Winston para logs estructurados (ya configurado)
- Los logs se guardan en la carpeta `logs/`
- Configurar servicios como Sentry para error tracking
- Monitorear métricas con herramientas como New Relic o Datadog

## Seguridad

- ✅ Helmet configurado para headers seguros
- ✅ CORS configurado
- ✅ Rate limiting implementado
- ✅ Autenticación con Supabase Auth
- ✅ Row Level Security (RLS) habilitado
- ✅ JWT con tokens de Supabase
- ✅ Validación de inputs con Zod
- ✅ Variables de entorno para secretos

## Mantenimiento

### Backup de Base de Datos

Supabase realiza backups automáticos diarios. Para backups manuales:

1. Ve a Supabase Dashboard > Database > Backups
2. Descarga el backup más reciente
3. O usa pg_dump si tienes acceso directo:

\`\`\`bash
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" > backup.sql
\`\`\`

### Actualizar Dependencias

\`\`\`bash
npm update
npm audit fix
\`\`\`

### Limpiar Datos Antiguos

Puedes crear funciones SQL en Supabase para limpiar datos:

\`\`\`sql
-- Eliminar notificaciones antiguas (más de 30 días)
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Eliminar asistencias antiguas (más de 1 año)
DELETE FROM attendances 
WHERE check_in < NOW() - INTERVAL '1 year';
\`\`\`

### Monitorear Uso de Supabase

- Ve a Supabase Dashboard > Settings > Usage
- Revisa el uso de base de datos, autenticación y storage
- Considera actualizar el plan si es necesario

## Troubleshooting

### Error de conexión a Supabase
- Verificar SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY
- Verificar que el proyecto de Supabase esté activo
- Revisar configuración de red/firewall

### Error de autenticación
- Verificar que Supabase Auth esté habilitado
- Verificar que los tokens no hayan expirado
- Revisar políticas RLS en Supabase

### Error de CORS
- Verificar CORS_ORIGIN en .env
- Asegurar que el frontend esté en la lista de orígenes permitidos
- En Supabase, verificar la configuración de CORS en Settings > API

### Errores de RLS (Row Level Security)
- Si recibes errores de permisos, verifica las políticas RLS
- Usa SUPABASE_SERVICE_ROLE_KEY en el backend para operaciones administrativas
- Revisa que el trigger de usuarios esté funcionando correctamente

### Scripts SQL no se ejecutan
- Asegúrate de ejecutar los scripts en orden
- Verifica que no haya errores de sintaxis
- Revisa los logs en Supabase Dashboard > Logs

## Migración de Datos

Si estás migrando desde otra base de datos:

1. Exporta los datos de tu base de datos actual
2. Transforma los datos al formato de Supabase
3. Usa el SQL Editor para importar los datos
4. Verifica la integridad de los datos

## Escalabilidad

Supabase escala automáticamente, pero considera:

- **Índices**: Agregar índices a columnas frecuentemente consultadas
- **Conexiones**: Usar connection pooling (ya incluido en Supabase)
- **Caché**: Implementar Redis para caché si es necesario
- **CDN**: Usar Vercel Edge Network para el backend

## Soporte

Para problemas con:
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Node.js/Express**: Documentación oficial
- **Este proyecto**: Contactar al equipo de desarrollo
