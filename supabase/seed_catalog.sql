-- ============================================================================
-- Catálogo real de la biblioteca (colección física existente)
-- Ejecutar UNA SOLA VEZ, después de 001_initial_schema.sql (y, si se usa,
-- después de seed.sql). No tiene protección contra duplicados: si se corre
-- dos veces, los libros quedarán repetidos.
--
-- `available_stock` no se especifica: el trigger `trg_books_initial_available_stock`
-- lo iguala automáticamente a `stock` al insertar.
-- ============================================================================

insert into books (title, author, description, category, stock) values

  -- Biblias
  ('Descubre la Biblia - Tomo 1', null, 'Serie "Descubre la Biblia: De la misión de Jesús hasta la Tierra Nueva". Editorial Aces.', 'Biblias', 1),
  ('Descubre la Biblia - Tomo 2', null, 'Serie "Descubre la Biblia: De la misión de Jesús hasta la Tierra Nueva". Editorial Aces.', 'Biblias', 1),
  ('Descubre la Biblia - Tomo 3', null, 'Serie "Descubre la Biblia: De la misión de Jesús hasta la Tierra Nueva". Editorial Aces.', 'Biblias', 1),
  ('Descubre la Biblia - Tomo 4', null, 'Serie "Descubre la Biblia: De la misión de Jesús hasta la Tierra Nueva". Editorial Aces.', 'Biblias', 1),
  ('Descubre la Biblia - Tomo 5', null, 'Serie "Descubre la Biblia: De la misión de Jesús hasta la Tierra Nueva". Editorial Aces.', 'Biblias', 1),
  ('Descubre la Biblia - Tomo 6', null, 'Serie "Descubre la Biblia: De la misión de Jesús hasta la Tierra Nueva". Editorial Aces.', 'Biblias', 1),
  ('Las extraordinarias Aventuras de la Biblia - Tomo 1', 'Sonia Krum', 'Editorial Aces.', 'Biblias', 2),
  ('Las extraordinarias Aventuras de la Biblia - Tomo 2', 'Sonia Krum', 'Editorial Aces.', 'Biblias', 2),
  ('La Biblia Gráfica', null, 'La historia completa desde Génesis hasta Apocalipsis. Editorial Portavoz.', 'Biblias', 1),
  ('La Biblia para todas las Niñas', 'Joan G. Angurell', 'Editorial Abba, 2019.', 'Biblias', 2),
  ('La Biblia para todos los Niños', null, null, 'Biblias', 1),
  ('Mi pequeña Biblia', null, 'Historias de la Biblia para niños.', 'Biblias', 1),

  -- Folletos de estudio
  ('Guía de estudio de la Biblia: La gracia de Dios es para mí (Intermediarios)', 'Depto. de Escuela Sabática de la Iglesia Adventista del Séptimo Día', '1º trimestre 2020. Editorial Aces.', 'Folletos de estudio', 1),
  ('Guía de estudio de la Biblia: La gracia de Dios nos redime (Intermediarios)', 'Depto. de Escuela Sabática de la Iglesia Adventista del Séptimo Día', '2º trimestre 2020. Editorial Aces.', 'Folletos de estudio', 1),

  -- Naturaleza
  ('Naturaleza Viajera', 'Celedonio García-Pozuelo Ramos', 'Editorial Aces.', 'Naturaleza', 1),
  ('Naturaleza prodigiosa', 'Celedonio García-Pozuelo Ramos', 'Editorial Aces.', 'Naturaleza', 1),
  ('El maravilloso mundo de los insectos', 'Celedonio García-Pozuelo Ramos', 'Editorial Aces.', 'Naturaleza', 1),
  ('Enciclopedia ilustrada del perro', 'Carmen Martul', 'Editorial Contrapunto.', 'Naturaleza', 1),
  ('Equipos de animales', null, 'Editorial Contrapunto.', 'Naturaleza', 1),
  ('Viaje por el fascinante mundo de los animales salvajes', null, 'Editorial Diverdidáctica.', 'Naturaleza', 1),

  -- Cuentos con valores (5 a 10 años)
  ('Bisa, un legado de amor', 'Odiléia Lindquist', 'Editorial Aces.', 'Cuentos con valores (5 a 10 años)', 1),
  ('El pez resbaladizo', 'Vanesa Pizzuto', 'Editorial Aces.', 'Cuentos con valores (5 a 10 años)', 1),
  ('El tatú: ¡Vamos a los bosques!', 'Stella Romero', 'Editorial Aces.', 'Cuentos con valores (5 a 10 años)', 1),
  ('El yaguareté: ¡Vamos a la selva!', 'Stella Romero', 'Editorial Aces.', 'Cuentos con valores (5 a 10 años)', 1),
  ('Jesús me ayuda a ser...', 'Orlando Palmieri', 'Editorial Aces.', 'Cuentos con valores (5 a 10 años)', 1),
  ('¡Viva la naturaleza!', 'Adriana Costanzo', 'Editorial Aces.', 'Cuentos con valores (5 a 10 años)', 1),

  -- Misceláneo (8 años y más)
  ('Tesoros y aventuras', 'Randy Fishell', 'Editorial Aces.', 'Misceláneo (8 años y más)', 1),
  ('Parejas de la Biblia', 'Natalia Jonas', 'Editorial Aces.', 'Misceláneo (8 años y más)', 1),
  ('Escuadrón', 'Denise Cruz', 'Editorial Aces.', 'Misceláneo (8 años y más)', 1),
  ('Aventuras en la jungla: El mago blanco y el tigre de Sumatra', 'Norma Youngberg', 'Editorial Aces.', 'Misceláneo (8 años y más)', 1),
  ('El secreto de la caverna', 'Arthur S. Maxwell', 'Editorial Aces.', 'Misceláneo (8 años y más)', 1),
  ('¿Por qué ocurren cosas malas?', 'Laura Rocke Winn', 'Editorial Aces.', 'Misceláneo (8 años y más)', 1),
  ('¿De qué lado estás? (Bullying: maltrato entre pares)', 'Cristina Kalbermatter, Adriana Komyk y Claudia Ciaponi', 'Editorial Aces.', 'Misceláneo (8 años y más)', 1),

  -- Adolescente
  ('Solo para jovencitas', 'Sonia Rigoli Santos', 'Editorial Aces.', 'Adolescente', 1);
