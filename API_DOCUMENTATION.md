# Documentación API - ElySport Backend

## Base URL

\`\`\`
http://localhost:3001/api
\`\`\`

## Autenticación

La API usa JWT (JSON Web Tokens) para autenticación. Incluir el token en el header:

\`\`\`
Authorization: Bearer <access_token>
\`\`\`

## Endpoints

### Autenticación

#### POST /auth/register
Registrar nuevo usuario

**Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "CLIENT",
  "phone": "3001234567"
}
\`\`\`

**Response:**
\`\`\`json
{
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
\`\`\`

#### POST /auth/login
Iniciar sesión

**Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

#### POST /auth/refresh
Renovar access token

**Body:**
\`\`\`json
{
  "refreshToken": "..."
}
\`\`\`

#### POST /auth/logout
Cerrar sesión

**Body:**
\`\`\`json
{
  "refreshToken": "..."
}
\`\`\`

#### GET /auth/me
Obtener usuario actual (requiere autenticación)

### Usuarios

#### GET /users
Listar usuarios (Admin/Trainer)

**Query params:**
- role: ADMIN | TRAINER | CLIENT
- isActive: true | false
- search: string
- page: number
- limit: number

#### GET /users/:id
Obtener usuario por ID

#### PUT /users/:id
Actualizar usuario

**Body:**
\`\`\`json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "3001234567",
  "profile": {
    "weight": 75,
    "height": 175,
    "fitnessGoal": "Perder peso"
  }
}
\`\`\`

#### DELETE /users/:id
Eliminar usuario (Admin)

#### PATCH /users/:id/toggle-status
Activar/desactivar usuario (Admin)

### Suscripciones

#### POST /subscriptions
Crear suscripción (Admin/Trainer)

**Body:**
\`\`\`json
{
  "userId": "uuid",
  "planName": "Mensual",
  "startDate": "2025-01-01",
  "endDate": "2025-02-01",
  "price": 50000
}
\`\`\`

#### GET /subscriptions
Listar suscripciones

**Query params:**
- status: ACTIVE | EXPIRED | CANCELLED
- userId: uuid
- page: number
- limit: number

#### GET /subscriptions/:id
Obtener suscripción por ID

#### PUT /subscriptions/:id
Actualizar suscripción (Admin/Trainer)

#### PATCH /subscriptions/:id/cancel
Cancelar suscripción (Admin)

#### POST /subscriptions/:id/renew
Renovar suscripción (Admin/Trainer)

**Body:**
\`\`\`json
{
  "months": 1
}
\`\`\`

### Pagos

#### POST /payments
Registrar pago (Admin/Trainer)

**Body:**
\`\`\`json
{
  "userId": "uuid",
  "subscriptionId": "uuid",
  "amount": 50000,
  "method": "NEQUI",
  "transactionId": "123456",
  "notes": "Pago mensual"
}
\`\`\`

#### GET /payments
Listar pagos

**Query params:**
- userId: uuid
- method: NEQUI | DAVIPLATA | CASH | CARD
- status: PENDING | COMPLETED | FAILED
- startDate: ISO date
- endDate: ISO date
- page: number
- limit: number

#### GET /payments/stats
Estadísticas de pagos (Admin/Trainer)

**Query params:**
- startDate: ISO date
- endDate: ISO date

#### GET /payments/:id
Obtener pago por ID

### Asistencias

#### POST /attendances/check-in
Registrar entrada (Admin/Trainer)

**Body:**
\`\`\`json
{
  "userId": "uuid",
  "notes": "Entrenamiento de fuerza"
}
\`\`\`

#### PUT /attendances/:id/check-out
Registrar salida (Admin/Trainer)

#### GET /attendances
Listar asistencias

**Query params:**
- userId: uuid
- startDate: ISO date
- endDate: ISO date
- page: number
- limit: number

#### GET /attendances/currently-present
Usuarios actualmente en el gimnasio

#### GET /attendances/stats
Estadísticas de asistencias (Admin/Trainer)

### Notificaciones

#### POST /notifications
Crear notificación (Admin/Trainer)

**Body:**
\`\`\`json
{
  "userId": "uuid",
  "type": "EXPIRATION",
  "title": "Suscripción por vencer",
  "message": "Tu suscripción vence en 3 días",
  "sendEmail": true
}
\`\`\`

#### GET /notifications
Listar notificaciones

**Query params:**
- userId: uuid
- type: EXPIRATION | PAYMENT_CONFIRMED | WARNING | INFO
- isRead: true | false
- page: number
- limit: number

#### PUT /notifications/:id/read
Marcar notificación como leída

#### PUT /notifications/read-all
Marcar todas como leídas

#### DELETE /notifications/:id
Eliminar notificación

### Reportes

#### GET /reports/users
Generar reporte de usuarios (Admin/Trainer)

**Query params:**
- role: ADMIN | TRAINER | CLIENT
- isActive: true | false
- format: pdf | xlsx

**Response:** Archivo PDF o Excel

#### GET /reports/payments
Generar reporte de pagos (Admin/Trainer)

**Query params:**
- startDate: ISO date
- endDate: ISO date
- method: NEQUI | DAVIPLATA | CASH | CARD
- format: pdf | xlsx

#### GET /reports/attendances
Generar reporte de asistencias (Admin/Trainer)

**Query params:**
- startDate: ISO date
- endDate: ISO date
- userId: uuid
- format: pdf | xlsx

### Dashboard

#### GET /dashboard/stats
Estadísticas generales (Admin/Trainer)

**Query params:**
- startDate: ISO date
- endDate: ISO date

**Response:**
\`\`\`json
{
  "users": {
    "total": 150,
    "active": 140,
    "clients": 130
  },
  "subscriptions": {
    "active": 120,
    "expiring": 5
  },
  "revenue": {
    "total": 5000000,
    "thisMonth": 800000
  },
  "attendance": {
    "total": 2500,
    "currentlyPresent": 15
  },
  "notifications": {
    "unread": 8
  }
}
\`\`\`

#### GET /dashboard/revenue
Ingresos por período (Admin/Trainer)

**Query params:**
- startDate: ISO date
- endDate: ISO date
- groupBy: day | month | year

#### GET /dashboard/activity
Actividad reciente (Admin/Trainer)

**Query params:**
- limit: number (default: 10)

#### GET /dashboard/top-clients
Mejores clientes (Admin/Trainer)

**Query params:**
- limit: number (default: 5)

#### GET /dashboard/payment-methods
Distribución de métodos de pago (Admin/Trainer)

## Códigos de Estado

- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

## Rate Limiting

- General: 100 requests / 15 minutos
- Auth endpoints: 5 requests / 15 minutos
\`\`\`
