-- =====================================================================
-- CONSULTAS E INSERCIONES SQL PARA EL ROL PERSONAL DE SALUD (/PS)
-- Base de datos: vacunas (según docs/referencias/example.sql)
-- =====================================================================

USE vacunas;

-- ---------------------------------------------------------------------
-- 1. Consultar Paciente Mayor de Edad por Cédula (Buscador Rápido /PS)
-- ---------------------------------------------------------------------
SELECT 
  cm.id_ciudadano,
  cm.primer_nombre,
  cm.segundo_nombre,
  cm.primer_apellido,
  cm.segundo_apellido,
  cm.c_i,
  cm.fecha_nacimiento,
  cm.sexo,
  cm.tipo_sangre,
  cm.estatura,
  cm.correo_electronico,
  cm.telefono_celular,
  cm.domicilio,
  e.nombre_estado,
  m.nombre_municipio,
  p.nombre_parroquia,
  et.nombre_etnia,
  prof.nombre_profesion
FROM ciudadano_mayor_edad cm
LEFT JOIN estados e ON e.id_estado = cm.estado_id
LEFT JOIN municipios m ON m.id_municipio = cm.municipio_id
LEFT JOIN parroquias p ON p.id_parroquia = cm.parroquia_id
LEFT JOIN etnias et ON et.id_etnia = cm.etnia_id
LEFT JOIN profesiones prof ON prof.id_profesion = cm.profesion_id
WHERE cm.c_i = 14567890;

-- ---------------------------------------------------------------------
-- 2. Historial de Inmunizaciones de un Paciente en el Centro
-- ---------------------------------------------------------------------
SELECT 
  inm.id_inmunizacion,
  v.nombre_vacuna,
  inm.numero_dosis,
  inm.numero_lote,
  inm.fecha_aplicacion,
  inm.observaciones,
  cs.nombre_centro
FROM inmunizacion inm
INNER JOIN vacunas v ON v.id_vacuna = inm.vacuna_id
INNER JOIN centro_salud cs ON cs.id_centro = inm.centro_salud_aplicacion
WHERE inm.ciudadano_mayor_edad_id = 1
ORDER BY inm.fecha_aplicacion DESC;

-- ---------------------------------------------------------------------
-- 3. Registrar una nueva dosis de vacuna (Inmunización)
-- ---------------------------------------------------------------------
INSERT INTO inmunizacion (
  numero_dosis,
  fecha_aplicacion,
  numero_lote,
  observaciones,
  centro_salud_aplicacion,
  vacuna_id,
  ciudadano_mayor_edad_id,
  ciudadano_mayor_menor_id
) VALUES (
  1,
  CURRENT_DATE,
  'LOTE-FA-2026-X',
  'Aplicación sin incidentes inmediatos',
  1,   -- id_centro
  1,   -- vacuna_id (Fiebre Amarilla)
  1,   -- ciudadano_mayor_edad_id
  NULL -- ciudadano_menor_id
);

-- ---------------------------------------------------------------------
-- 4. Registrar Reporte de Reacción Adversa (ESAVI)
-- ---------------------------------------------------------------------
INSERT INTO reportes (
  nivel_gravedad,
  recomendaciones,
  inmunizacion_id,
  ciudadano_mayor_id,
  ciudadano_menor_id,
  sintoma_id
) VALUES (
  'LEVE',
  'Reposo relativo por 24 horas y administración de antipirético oral',
  1,    -- inmunizacion_id
  1,    -- ciudadano_mayor_id
  NULL, -- ciudadano_menor_id
  1     -- sintoma_id (Fiebre, cefalea, etc.)
);

