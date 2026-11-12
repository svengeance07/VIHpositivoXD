-- =====================================================================
-- CONSULTAS E INSERCIONES SQL PARA EL ROL SUBREGIÓN DE SALUD (/SRS)
-- Base de datos: vacunas (según docs/referencias/example.sql)
-- =====================================================================

USE vacunas;

-- ---------------------------------------------------------------------
-- 1. Consultar la sede de la Subregión y su Jefe Titular
-- ---------------------------------------------------------------------
SELECT 
  sr.id_subregion,
  sr.ubicacion,
  e.nombre_estado,
  m.nombre_municipio,
  p.nombre_parroquia,
  a.id_autoridades AS jefe_id,
  CONCAT_WS(' ', a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido) AS jefe_nombre,
  a.c_i AS jefe_ci,
  a.n_impre AS jefe_matricula,
  a.telefono AS jefe_telefono,
  u.correo_usuario AS jefe_correo,
  prof.nombre_profesion AS jefe_profesion
FROM subregion sr
LEFT JOIN estados e ON e.id_estado = sr.estado_id
LEFT JOIN municipios m ON m.id_municipio = sr.municipio_id
LEFT JOIN parroquias p ON p.id_parroquia = sr.parroquia_id
LEFT JOIN autoridades a ON a.id_autoridades = sr.id_jefe_subregion
LEFT JOIN usuarios u ON u.id_usuarios = a.usuario_id
LEFT JOIN profesiones prof ON prof.id_profesion = a.profesion_id
WHERE sr.estado_id = 1; -- Parámetro: ID del estado asignado

-- ---------------------------------------------------------------------
-- 2. Listar Centros de Salud adscritos a la Subregión
-- ---------------------------------------------------------------------
SELECT 
  cs.id_centro,
  cs.codigo_centro,
  cs.nombre_centro,
  cs.ubicacion_centro,
  m.nombre_municipio,
  p.nombre_parroquia,
  CONCAT_WS(' ', a.primer_nombre, a.primer_apellido) AS encargado_nombre,
  a.c_i AS encargado_ci,
  a.telefono AS encargado_telefono,
  (SELECT COUNT(*) FROM inmunizacion inm WHERE inm.centro_salud_aplicacion = cs.id_centro) AS total_vacunaciones
FROM centro_salud cs
LEFT JOIN municipios m ON m.id_municipio = cs.municipio_id
LEFT JOIN parroquias p ON p.id_parroquia = cs.parroquia_id
LEFT JOIN autoridades a ON a.id_autoridades = cs.id_jefe_centro
WHERE cs.estado_id = 1
ORDER BY cs.id_centro ASC;

-- ---------------------------------------------------------------------
-- 3. Insertar un nuevo Centro de Salud desde la Subregión
-- ---------------------------------------------------------------------
INSERT INTO centro_salud (
  nombre_centro,
  codigo_centro,
  ubicacion_centro,
  estado_id,
  municipio_id,
  parroquia_id,
  id_jefe_centro
) VALUES (
  'Ambulatorio Urbano Tipo II El Silencio',
  'CS-CAR-04',
  'Av. Baralt, Parroquia Altagracia, Caracas',
  1,   -- estado_id
  1,   -- municipio_id
  1,   -- parroquia_id
  NULL -- id_jefe_centro (o ID de autoridades si ya fue designado)
);

-- ---------------------------------------------------------------------
-- 4. Listar Personal de Salud / Autoridades de los Centros del Estado
-- ---------------------------------------------------------------------
SELECT 
  a.id_autoridades,
  CONCAT_WS(' ', a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido) AS nombre_completo,
  a.c_i,
  a.n_impre,
  a.telefono,
  u.correo_usuario,
  prof.nombre_profesion,
  cs.nombre_centro,
  cs.codigo_centro,
  m.nombre_municipio,
  (cs.id_jefe_centro = a.id_autoridades) AS es_jefe_centro
FROM autoridades a
INNER JOIN centro_salud cs ON cs.id_jefe_centro = a.id_autoridades OR cs.estado_id = 1
LEFT JOIN usuarios u ON u.id_usuarios = a.usuario_id
LEFT JOIN profesiones prof ON prof.id_profesion = a.profesion_id
LEFT JOIN municipios m ON m.id_municipio = cs.municipio_id
WHERE cs.estado_id = 1
GROUP BY a.id_autoridades
ORDER BY a.primer_apellido ASC;

-- ---------------------------------------------------------------------
-- 5. Dar de alta una Autoridad / Profesional de Salud
-- ---------------------------------------------------------------------
-- Paso A: Crear la cuenta institucional
INSERT INTO usuarios (correo_usuario, contrasena, tipo_usuario)
VALUES ('carlos.rojas@salud.gob.ve', 'ClaveSegura2026!', 'centro_salud_jefe');

-- Paso B: Crear el registro de autoridad con el ID generado (LAST_INSERT_ID())
INSERT INTO autoridades (
  primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
  c_i, n_impre, domicilio, telefono, usuario_id, profesion_id
) VALUES (
  'Carlos', 'Eduardo', 'Rojas', 'Mendoza',
  14567890, 89432, 'Urb. Las Mercedes, Calle París', '0414-5551234',
  LAST_INSERT_ID(),
  1 -- profesion_id (Médico General, Enfermero, etc.)
);

-- ---------------------------------------------------------------------
-- 6. Consultar Certificados de Salud para revisión/dictamen de SRS
-- ---------------------------------------------------------------------
SELECT 
  c.id_certificado,
  c.fecha_emision,
  c.estatus,
  c.ciudadano_mayor_id,
  CONCAT_WS(' ', cm.primer_nombre, cm.primer_apellido) AS ciudadano_nombre,
  cm.c_i AS ciudadano_ci,
  cm.correo_electronico,
  ex.nombre_examen,
  (SELECT COUNT(*) FROM inmunizacion inm WHERE inm.ciudadano_mayor_edad_id = c.ciudadano_mayor_id) AS total_dosis_aplicadas
FROM certificado c
LEFT JOIN ciudadano_mayor_edad cm ON cm.id_ciudadano = c.ciudadano_mayor_id
LEFT JOIN examenes ex ON ex.id_examenes = c.examen_id
WHERE cm.estado_id = 1
ORDER BY c.id_certificado DESC;

-- ---------------------------------------------------------------------
-- 7. Dictaminar Certificado de Salud (Aprobar / Rechazar)
-- ---------------------------------------------------------------------
UPDATE certificado 
SET 
  estatus = 'APROBADO', -- o 'RECHAZADO'
  fecha_emision = CURRENT_DATE
WHERE id_certificado = 1;

