-- ============================================================================
-- MVP Biblioteca Iglesia - Esquema inicial
-- ============================================================================
-- Este MVP no implementa autenticación de usuarios finales: es una
-- herramienta interna operada por la persona encargada de la biblioteca.
-- Las políticas RLS de abajo son intencionalmente abiertas para el rol
-- `anon` (clave pública). Si en el futuro se agrega login, deben
-- reemplazarse por políticas basadas en `auth.uid()` / roles.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tabla books
-- ----------------------------------------------------------------------------
create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  description text,
  category text,
  isbn text,
  stock integer not null default 0,
  available_stock integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint books_title_not_blank check (btrim(title) <> ''),
  constraint books_stock_non_negative check (stock >= 0),
  constraint books_available_stock_range check (
    available_stock >= 0 and available_stock <= stock
  )
);

comment on table books is 'Libros disponibles en la biblioteca de la iglesia.';
comment on column books.stock is 'Cantidad física total de ejemplares.';
comment on column books.available_stock is 'Ejemplares disponibles para reservar (stock - reservados/prestados).';

create index if not exists idx_books_title on books using gin (to_tsvector('simple', title));
create index if not exists idx_books_author on books using gin (to_tsvector('simple', coalesce(author, '')));
create index if not exists idx_books_category on books (category);

-- ----------------------------------------------------------------------------
-- Tabla users
-- ----------------------------------------------------------------------------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_name_not_blank check (btrim(name) <> '')
);

comment on table users is 'Miembros de la iglesia que pueden reservar libros.';

create index if not exists idx_users_name on users using gin (to_tsvector('simple', name));
create index if not exists idx_users_email on users (email);

-- ----------------------------------------------------------------------------
-- Tabla reservations
-- ----------------------------------------------------------------------------
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete restrict,
  user_id uuid not null references users(id) on delete restrict,
  quantity integer not null default 1,
  status text not null default 'reserved',
  reserved_at timestamptz not null default now(),
  expected_return_date date,
  updated_at timestamptz not null default now(),
  notes text,
  constraint reservations_quantity_positive check (quantity >= 1),
  constraint reservations_status_valid check (
    status in ('reserved', 'borrowed', 'returned', 'cancelled')
  )
);

comment on table reservations is 'Reserva/préstamo de un libro realizado por un usuario.';
comment on column reservations.expected_return_date is 'Fecha calendario esperada de devolución (obligatoria antes de pasar a borrowed).';

create index if not exists idx_reservations_book_id on reservations (book_id);
create index if not exists idx_reservations_user_id on reservations (user_id);
create index if not exists idx_reservations_status on reservations (status);
create index if not exists idx_reservations_reserved_at on reservations (reserved_at);
create index if not exists idx_reservations_expected_return_date on reservations (expected_return_date);
-- Índice parcial para acelerar el cálculo de reservas atrasadas.
create index if not exists idx_reservations_overdue
  on reservations (expected_return_date)
  where status = 'borrowed';

-- ----------------------------------------------------------------------------
-- Triggers updated_at
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_books_updated_at on books;
create trigger trg_books_updated_at
  before update on books
  for each row
  execute function set_updated_at();

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
  before update on users
  for each row
  execute function set_updated_at();

drop trigger if exists trg_reservations_updated_at on reservations;
create trigger trg_reservations_updated_at
  before update on reservations
  for each row
  execute function set_updated_at();

-- Al crear un libro, available_stock siempre arranca igual a stock,
-- sin importar lo que envíe el cliente.
create or replace function books_set_initial_available_stock()
returns trigger
language plpgsql
as $$
begin
  new.available_stock := new.stock;
  return new;
end;
$$;

drop trigger if exists trg_books_initial_available_stock on books;
create trigger trg_books_initial_available_stock
  before insert on books
  for each row
  execute function books_set_initial_available_stock();

-- ============================================================================
-- Funciones RPC (operaciones atómicas críticas)
-- ============================================================================
-- Todas usan `select ... for update` sobre la fila del libro para serializar
-- modificaciones concurrentes de available_stock y evitar race conditions.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- update_book_stock: cambia el stock físico total de un libro.
-- Si sube, available_stock sube en la misma diferencia.
-- Si baja, no puede quedar por debajo de lo actualmente prestado/reservado
-- (stock - available_stock).
-- ----------------------------------------------------------------------------
create or replace function update_book_stock(p_book_id uuid, p_new_stock integer)
returns books
language plpgsql
as $$
declare
  v_book books;
  v_committed integer; -- cantidad actualmente reservada/prestada (no disponible)
  v_diff integer;
begin
  if p_new_stock is null or p_new_stock < 0 then
    raise exception 'El stock debe ser un número entero mayor o igual a 0.';
  end if;

  select * into v_book from books where id = p_book_id for update;
  if not found then
    raise exception 'Libro no encontrado.';
  end if;

  v_committed := v_book.stock - v_book.available_stock;

  if p_new_stock < v_committed then
    raise exception
      'No es posible reducir el stock a % porque hay % ejemplar(es) actualmente prestado(s)/reservado(s).',
      p_new_stock, v_committed;
  end if;

  v_diff := p_new_stock - v_book.stock;

  update books
  set stock = p_new_stock,
      available_stock = v_book.available_stock + v_diff
  where id = p_book_id
  returning * into v_book;

  return v_book;
end;
$$;

-- ----------------------------------------------------------------------------
-- create_reservation: crea una reserva en estado 'reserved' y descuenta stock.
-- ----------------------------------------------------------------------------
create or replace function create_reservation(
  p_book_id uuid,
  p_user_id uuid,
  p_quantity integer,
  p_expected_return_date date default null,
  p_notes text default null
)
returns reservations
language plpgsql
as $$
declare
  v_book books;
  v_user users;
  v_reservation reservations;
begin
  if p_quantity is null or p_quantity < 1 then
    raise exception 'La cantidad debe ser al menos 1.';
  end if;

  select * into v_user from users where id = p_user_id;
  if not found then
    raise exception 'Usuario no encontrado.';
  end if;
  if not v_user.active then
    raise exception 'El usuario está inactivo y no puede realizar reservas.';
  end if;

  select * into v_book from books where id = p_book_id for update;
  if not found then
    raise exception 'Libro no encontrado.';
  end if;

  if p_quantity > v_book.available_stock then
    raise exception
      'Stock disponible insuficiente. Disponible: %, solicitado: %.',
      v_book.available_stock, p_quantity;
  end if;

  if p_expected_return_date is not null and p_expected_return_date < current_date then
    raise exception 'La fecha esperada de devolución no puede ser anterior a hoy.';
  end if;

  update books
  set available_stock = available_stock - p_quantity
  where id = p_book_id;

  insert into reservations (book_id, user_id, quantity, status, expected_return_date, notes)
  values (p_book_id, p_user_id, p_quantity, 'reserved', p_expected_return_date, p_notes)
  returning * into v_reservation;

  return v_reservation;
end;
$$;

-- ----------------------------------------------------------------------------
-- borrow_reservation: reserved -> borrowed. Requiere fecha esperada de
-- devolución. No modifica stock (ya se descontó al crear la reserva).
-- ----------------------------------------------------------------------------
create or replace function borrow_reservation(
  p_reservation_id uuid,
  p_expected_return_date date
)
returns reservations
language plpgsql
as $$
declare
  v_reservation reservations;
begin
  if p_expected_return_date is null then
    raise exception 'La fecha esperada de devolución es obligatoria para marcar un préstamo.';
  end if;

  select * into v_reservation from reservations where id = p_reservation_id for update;
  if not found then
    raise exception 'Reserva no encontrada.';
  end if;

  if v_reservation.status <> 'reserved' then
    raise exception 'Solo una reserva en estado "reserved" puede pasar a "borrowed". Estado actual: %.', v_reservation.status;
  end if;

  update reservations
  set status = 'borrowed',
      expected_return_date = p_expected_return_date
  where id = p_reservation_id
  returning * into v_reservation;

  return v_reservation;
end;
$$;

-- ----------------------------------------------------------------------------
-- return_reservation: borrowed -> returned. Devuelve stock.
-- ----------------------------------------------------------------------------
create or replace function return_reservation(p_reservation_id uuid)
returns reservations
language plpgsql
as $$
declare
  v_reservation reservations;
begin
  select * into v_reservation from reservations where id = p_reservation_id for update;
  if not found then
    raise exception 'Reserva no encontrada.';
  end if;

  if v_reservation.status <> 'borrowed' then
    raise exception 'Solo una reserva en estado "borrowed" puede marcarse como devuelta. Estado actual: %.', v_reservation.status;
  end if;

  update reservations
  set status = 'returned'
  where id = p_reservation_id
  returning * into v_reservation;

  update books
  set available_stock = available_stock + v_reservation.quantity
  where id = v_reservation.book_id;

  return v_reservation;
end;
$$;

-- ----------------------------------------------------------------------------
-- cancel_reservation: reserved -> cancelled. Devuelve stock.
-- ----------------------------------------------------------------------------
create or replace function cancel_reservation(p_reservation_id uuid)
returns reservations
language plpgsql
as $$
declare
  v_reservation reservations;
begin
  select * into v_reservation from reservations where id = p_reservation_id for update;
  if not found then
    raise exception 'Reserva no encontrada.';
  end if;

  if v_reservation.status <> 'reserved' then
    raise exception 'Solo una reserva en estado "reserved" puede cancelarse. Estado actual: %.', v_reservation.status;
  end if;

  update reservations
  set status = 'cancelled'
  where id = p_reservation_id
  returning * into v_reservation;

  update books
  set available_stock = available_stock + v_reservation.quantity
  where id = v_reservation.book_id;

  return v_reservation;
end;
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================
-- Sin sistema de login en este MVP: se habilita acceso completo (lectura y
-- escritura) para las claves anon/authenticated. Esto asume que la app solo
-- se comparte con el personal de confianza de la biblioteca y que el
-- .env / la anon key no se exponen públicamente sin control de acceso.
-- ============================================================================

alter table books enable row level security;
alter table users enable row level security;
alter table reservations enable row level security;

drop policy if exists "books_select_all" on books;
create policy "books_select_all" on books for select using (true);
drop policy if exists "books_insert_all" on books;
create policy "books_insert_all" on books for insert with check (true);
drop policy if exists "books_update_all" on books;
create policy "books_update_all" on books for update using (true) with check (true);

drop policy if exists "users_select_all" on users;
create policy "users_select_all" on users for select using (true);
drop policy if exists "users_insert_all" on users;
create policy "users_insert_all" on users for insert with check (true);
drop policy if exists "users_update_all" on users;
create policy "users_update_all" on users for update using (true) with check (true);

drop policy if exists "reservations_select_all" on reservations;
create policy "reservations_select_all" on reservations for select using (true);
drop policy if exists "reservations_insert_all" on reservations;
create policy "reservations_insert_all" on reservations for insert with check (true);
drop policy if exists "reservations_update_all" on reservations;
create policy "reservations_update_all" on reservations for update using (true) with check (true);

-- Las RPC de arriba son SECURITY INVOKER (por defecto) y quedan cubiertas
-- por las policies anteriores al ejecutarse en nombre del caller.
