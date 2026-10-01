# Biblioteca Iglesia — MVP

Sistema de gestión y reservas de libros para la biblioteca de una iglesia. Permite administrar el catálogo de libros, los miembros y las reservas/préstamos, con control automático de stock y detección visual de reservas atrasadas.

## Stack

- React + Vite + TypeScript
- Supabase (PostgreSQL) vía `@supabase/supabase-js` — sin backend propio
- Tailwind CSS
- React Router
- React Hook Form + Zod
- Lucide React

## Requisitos previos

- Node.js 18+
- Una cuenta y proyecto en [Supabase](https://supabase.com)

## 1. Configurar Supabase

1. Crea un proyecto en Supabase.
2. Ve a **SQL Editor** y ejecuta el contenido de [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql). Esto crea las tablas, índices, triggers, funciones RPC y políticas RLS.
3. (Opcional) Ejecuta [`supabase/seed.sql`](supabase/seed.sql) para cargar datos de ejemplo (libros, usuarios y reservas en distintos estados: pendiente, prestada, devuelta, cancelada, atrasada y próxima a vencer). Para cargar los datos reales de la biblioteca en vez de/además de los datos de ejemplo, ejecuta [`supabase/seed_catalog.sql`](supabase/seed_catalog.sql) (catálogo de libros) y [`supabase/seed_users.sql`](supabase/seed_users.sql) (usuarios); ninguno de los dos tiene protección contra duplicados, así que no los corras dos veces.
4. En **Project Settings → API Keys**, copia la `Project URL` y la clave anónima de cliente. Según el sistema de claves de tu proyecto puede llamarse `anon public` (sistema antiguo) o `Publishable key` (sistema nuevo, empieza con `sb_publishable_...`) — ambas cumplen el mismo rol y van en `VITE_SUPABASE_ANON_KEY`.

## 2. Configurar el proyecto

```bash
npm install
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## 3. Ejecutar en desarrollo

```bash
npm run dev
```

## 4. Build de producción

```bash
npm run build
npm run preview
```

La app es estática (sin backend propio) y puede desplegarse directamente en Vercel, Netlify o similar, configurando las mismas variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) en el panel del proveedor.

## Arquitectura y decisiones de diseño

- **`available_stock`** es siempre `stock` menos lo actualmente reservado/prestado. Se recalcula automáticamente vía funciones RPC (`create_reservation`, `borrow_reservation`, `return_reservation`, `cancel_reservation`, `update_book_stock`), nunca se edita directamente desde el frontend.
- **Atraso (`overdue`) es un estado calculado, no almacenado.** Se deriva de `status = 'borrowed' AND expected_return_date < hoy`, tanto en el frontend (`src/utils/returnStatus.ts`) como en los filtros a Supabase. Esto evita que la información quede desactualizada.
- **Concurrencia**: las operaciones críticas de stock usan funciones PostgreSQL con `SELECT ... FOR UPDATE` sobre la fila del libro, para serializar reservas simultáneas y evitar condiciones de carrera.
- **Transiciones de estado válidas**: `reserved → borrowed`, `reserved → cancelled`, `borrowed → returned`. Cualquier otra transición es rechazada por las funciones RPC.

## Seguridad y alcance del MVP (importante)

Este MVP **no implementa autenticación de usuarios finales**: está pensado como herramienta interna operada por la persona encargada de la biblioteca, sin necesidad de login. Como consecuencia, las políticas de Row Level Security (RLS) están configuradas para permitir lectura y escritura completas a través de la `anon key`.

Esto significa que **cualquiera con la URL y la anon key del proyecto podría leer o modificar los datos**. Recomendaciones:

- No expongas públicamente el `.env` ni la anon key fuera del equipo de confianza.
- Si en el futuro se requiere acceso multiusuario o público, agrega Supabase Auth y reemplaza las políticas `using (true)` por políticas basadas en `auth.uid()` / roles.

Las reglas de negocio críticas (límites de stock, transiciones de estado válidas, fecha de devolución obligatoria antes de prestar) están validadas tanto en el frontend como en las funciones PostgreSQL, para que no dependan únicamente de las validaciones del cliente.

## Fuera de alcance (por diseño)

Pagos, notificaciones por email/WhatsApp, app móvil, códigos QR, multas, múltiples sucursales, reportes avanzados, reservas públicas, recomendaciones, integración con Google Books, roles administrativos complejos y auditoría avanzada.
