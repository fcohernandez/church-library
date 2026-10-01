-- ============================================================================
-- Datos de ejemplo para el MVP de biblioteca
-- Ejecutar después de 001_initial_schema.sql
-- Cubre todos los estados de reserva para poder probar la UI visualmente.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Libros
-- ----------------------------------------------------------------------------
insert into books (id, title, author, description, category, isbn, stock)
values
  ('11111111-1111-1111-1111-111111111111', 'El poder de la oración', 'E.M. Bounds', 'Un clásico sobre la vida de oración.', 'Devocional', '9780800782415', 5),
  ('22222222-2222-2222-2222-222222222222', 'Una vida con propósito', 'Rick Warren', 'Los 40 días de propósito.', 'Crecimiento personal', '9780829739584', 4),
  ('33333333-3333-3333-3333-333333333333', 'Mero cristianismo', 'C.S. Lewis', 'Fundamentos de la fe cristiana.', 'Apologética', '9780061350232', 3),
  ('44444444-4444-4444-4444-444444444444', 'El conocimiento del Dios Santo', 'A.W. Tozer', 'Sobre los atributos de Dios.', 'Teología', '9780887490524', 2),
  ('55555555-5555-5555-5555-555555555555', 'El progreso del peregrino', 'John Bunyan', 'Alegoría clásica de la vida cristiana.', 'Clásicos', '9780486432000', 3)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Usuarios
-- ----------------------------------------------------------------------------
insert into users (id, name, email, phone, active)
values
  ('a1111111-1111-1111-1111-111111111111', 'Juan Pérez', 'juan.perez@example.com', '+56 9 1111 1111', true),
  ('a2222222-2222-2222-2222-222222222222', 'María González', 'maria.gonzalez@example.com', '+56 9 2222 2222', true),
  ('a3333333-3333-3333-3333-333333333333', 'Pedro Soto', 'pedro.soto@example.com', '+56 9 3333 3333', true),
  ('a4444444-4444-4444-4444-444444444444', 'Ana Martínez', 'ana.martinez@example.com', '+56 9 4444 4444', true)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Reservas de ejemplo (todos los estados)
-- Los available_stock de los libros de arriba ya reflejan estas reservas.
-- ----------------------------------------------------------------------------

-- 1) Reserva pendiente (reserved) — El poder de la oración, Juan Pérez
insert into reservations (book_id, user_id, quantity, status, expected_return_date, notes)
values (
  '11111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  1, 'reserved', current_date + interval '7 days', null
);
update books set available_stock = available_stock - 1 where id = '11111111-1111-1111-1111-111111111111';

-- 2) Reserva prestada, dentro de plazo (borrowed) — Una vida con propósito, María González
insert into reservations (book_id, user_id, quantity, status, reserved_at, expected_return_date, notes)
values (
  '22222222-2222-2222-2222-222222222222',
  'a2222222-2222-2222-2222-222222222222',
  1, 'borrowed', now() - interval '5 days', current_date + interval '10 days', null
);
update books set available_stock = available_stock - 1 where id = '22222222-2222-2222-2222-222222222222';

-- 3) Reserva devuelta (returned) — Mero cristianismo, Pedro Soto
insert into reservations (book_id, user_id, quantity, status, reserved_at, expected_return_date, updated_at, notes)
values (
  '33333333-3333-3333-3333-333333333333',
  'a3333333-3333-3333-3333-333333333333',
  1, 'returned', now() - interval '30 days', current_date - interval '16 days', now() - interval '15 days', null
);
-- available_stock no cambia: ya volvió al stock disponible (no se descuenta).

-- 4) Reserva cancelada (cancelled) — El conocimiento del Dios Santo, Ana Martínez
insert into reservations (book_id, user_id, quantity, status, reserved_at, updated_at, notes)
values (
  '44444444-4444-4444-4444-444444444444',
  'a4444444-4444-4444-4444-444444444444',
  1, 'cancelled', now() - interval '10 days', now() - interval '9 days', 'El usuario ya no lo necesitaba.'
);
-- available_stock no cambia: se liberó al cancelar.

-- 5) Reserva prestada y atrasada (borrowed, vencida) — El progreso del peregrino, Juan Pérez
insert into reservations (book_id, user_id, quantity, status, reserved_at, expected_return_date, notes)
values (
  '55555555-5555-5555-5555-555555555555',
  'a1111111-1111-1111-1111-111111111111',
  1, 'borrowed', now() - interval '20 days', current_date - interval '7 days', null
);
update books set available_stock = available_stock - 1 where id = '55555555-5555-5555-5555-555555555555';

-- 6) Reserva prestada próxima a vencer (borrowed, vence en 2 días) — El poder de la oración, María González
insert into reservations (book_id, user_id, quantity, status, reserved_at, expected_return_date, notes)
values (
  '11111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  1, 'borrowed', now() - interval '12 days', current_date + interval '2 days', null
);
update books set available_stock = available_stock - 1 where id = '11111111-1111-1111-1111-111111111111';
