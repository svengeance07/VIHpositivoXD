-- =====================================================================
-- CONSULTAS E INSERCIONES SQL PARA EL ADMINISTRADOR NACIONAL MASTER (/master)
-- Base de datos: vacunas (según docs/referencias/example.sql)
-- =====================================================================

USE vacunas;

-- ---------------------------------------------------------------------
-- 1. Directorio Nacional de Subregiones de Salud (Una por estado)
-- ---------------------------------------------------------------------
SELECT 
  sr.id_subregion,
  sr.ubicacion,
  e.nombre_estado,
  m.nombre_municipio,
  CONCAT_WS(' ', a.primer_nombre, a.primer_apellido) AS jefe_subregion_nombre,
  a.c_i AS jefe_ci,
  u.correo_usuario AS jefe_correo,
  (SELECT COUNT(*) FROM centro_salud cs WHERE cs.estado_id = sr.estado_id) AS total_centros_estado
FROM subregion sr
LEFT JOIN estados e ON e.id_estado = sr.estado_id
LEFT JOIN municipios m ON m.id_municipio = sr.municipio_id
LEFT JOIN autoridades a ON a.id_autoridades = sr.id_jefe_subregion
LEFT JOIN usuarios u ON u.id_usuarios = a.usuario_id
ORDER BY e.nombre_estado ASC;

-- ---------------------------------------------------------------------
-- 2. Dar de alta una Subregión a nivel nacional
-- ---------------------------------------------------------------------
INSERT INTO subregion (
  ubicacion, estado_id, municipio_id, parroquia_id, id_jefe_subregion
) VALUES (
  'Edificio MPPS Guárico, San Juan de los Morros',
  12, -- estado_id
  1,  -- municipio_id
  1,  -- parroquia_id
  1   -- id_jefe_subregion (autoridad designada)
);

-- ---------------------------------------------------------------------
-- 3. Catálogo Nacional de Vacunas y Cobertura de Inmunización
-- ---------------------------------------------------------------------
SELECT 
  v.id_vacuna,
  v.nombre_vacuna,
  v.cantidad_dosis,
  COUNT(inm.id_inmunizacion) AS dosis_aplicadas_pais,
  COUNT(DISTINCT inm.centro_salud_aplicacion) AS centros_con_aplicaciones
FROM vacunas v
LEFT JOIN inmunizacion inm ON inm.vacuna_id = v.id_vacuna
GROUP BY v.id_vacuna, v.nombre_vacuna, v.cantidad_dosis
ORDER BY v.nombre_vacuna ASC;

-- ---------------------------------------------------------------------
-- 4. Incorporar nueva vacuna al esquema oficial
-- ---------------------------------------------------------------------
INSERT INTO vacunas (nombre_vacuna, cantidad_dosis)
VALUES ('VPH Tetravalente (Gardasil)', 2);

-- ---------------------------------------------------------------------
-- 5. Búsqueda Global de Ciudadanos (Adultos y Menores) a Nivel País
-- ---------------------------------------------------------------------
-- Búsqueda en mayores de edad por cédula o nombre
SELECT 
  cm.id_ciudadano,
  false AS es_menor,
  CONCAT_WS(' ', cm.primer_nombre, cm.segundo_nombre, cm.primer_apellido, cm.segundo_apellido) AS nombre_completo,
  cm.c_i AS cedula,
  cm.fecha_nacimiento,
  cm.sexo,
  e.nombre_estado,
  m.nombre_municipio,
  (SELECT COUNT(*) FROM inmunizacion inm WHERE inm.ciudadano_mayor_edad_id = cm.id_ciudadano) AS total_dosis
FROM ciudadano_mayor_edad cm
LEFT JOIN estados e ON e.id_estado = cm.estado_id
LEFT JOIN municipios m ON m.id_municipio = cm.municipio_id
WHERE cm.c_i = 14567890 OR cm.primer_nombre LIKE '%María%'
LIMIT 20;

-- Búsqueda en menores de edad por nombre
SELECT 
  mn.id_menor,
  true AS es_menor,
  CONCAT_WS(' ', mn.primer_nombre, mn.segundo_nombre, mn.primer_apellido, mn.segundo_apellido) AS nombre_completo,
  NULL AS cedula,
  mn.fecha_nacimiento,
  mn.sexo,
  e.nombre_estado,
  m.nombre_municipio,
  (SELECT COUNT(*) FROM inmunizacion inm WHERE inm.ciudadano_mayor_menor_id = mn.id_menor) AS total_dosis
FROM ciudadano_menor_edad mn
LEFT JOIN estados e ON e.id_estado = mn.estado_id
LEFT JOIN municipios m ON m.id_municipio = mn.municipio_id
WHERE mn.primer_nombre LIKE '%Lucas%'
LIMIT 20;

-- ---------------------------------------------------------------------
-- 6. Ranking Nacional de Dosis Aplicadas por Estado (Telemetría Master)
-- ---------------------------------------------------------------------
SELECT 
  e.id_estado,
  e.nombre_estado,
  COUNT(inm.id_inmunizacion) AS total_dosis_aplicadas
FROM estados e
LEFT JOIN centro_salud cs ON cs.estado_id = e.id_estado
LEFT JOIN inmunizacion inm ON inm.centro_salud_aplicacion = cs.id_centro
GROUP BY e.id_estado, e.nombre_estado
ORDER BY total_dosis_aplicadas DESC;

