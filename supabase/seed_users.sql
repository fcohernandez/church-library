-- ============================================================================
-- Usuarios reales de la biblioteca
-- Ejecutar UNA SOLA VEZ, después de 001_initial_schema.sql. No tiene
-- protección contra duplicados: si se corre dos veces, los usuarios
-- quedarán repetidos. Email y teléfono no se cargan aquí: se pueden
-- completar después desde la app (página Usuarios -> Editar).
-- ============================================================================

insert into users (name) values
  ('Agustín Rojas Aravena'),
  ('Antonella Varas Pino'),
  ('Amaranta Inostroza Nuñez'),
  ('Caleb Rodriguez Chacón'),
  ('Franco Francine'),
  ('Gael Reiman Peña'),
  ('Joaquín Seguel Ainol'),
  ('Josefa Medina Urzúa'),
  ('Leví Tello Quezada'),
  ('Mateo Romero Peña'),
  ('Magdalena Varas Pino'),
  ('Rocío Rojas Gonzalez'),
  ('Maximiliano Vega');
