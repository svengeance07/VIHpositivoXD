-- Esquema de trabajo de Sistema V.
-- La copia fiel recibida el 2026-10-25 se conserva en
-- `db_schema_original_2026-10-25.sql`. Las extensiones propuestas por el
-- prototipo están al final del archivo y todavía no son migraciones ejecutadas.

CREATE TABLE IF NOT EXISTS `usuarios` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`nombre1` VARCHAR(255) NOT NULL,
	`nombre2` VARCHAR(255) NOT NULL,
	`apellido1` VARCHAR(255) NOT NULL,
	`apellido2` VARCHAR(255) NOT NULL,
	`cedula` BIGINT NOT NULL,
	`nacimiento` DATE NOT NULL,
	`sangre_id` INTEGER NOT NULL,
	`estatura` INTEGER NOT NULL,
	`etnia_id` INTEGER,
	`correo` VARCHAR(255) NOT NULL,
	`profesion_id` INTEGER NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `usuario_telefonos` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`telefono` VARCHAR(255) NOT NULL,
	`usuario_id` INTEGER,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `tipoSangre` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`tipo` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `etnias` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`nombre` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `usuario_residencias` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`estado_id` INTEGER NOT NULL,
	`mcpo_id` INTEGER NOT NULL,
	`parroquia_id` INTEGER NOT NULL,
	`direccion` VARCHAR(255) NOT NULL,
	`usuario_id` INTEGER NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `usuario_vacunas` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`usuario_id` INTEGER NOT NULL,
	`vacuna_id` INTEGER NOT NULL,
	`nro_dosis` INTEGER,
	`fecha_aplicacion` DATE NOT NULL,
	`lote` VARCHAR(255) NOT NULL,
	`centro_id` INTEGER NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `usuario_examenes` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`usuario_id` INTEGER NOT NULL,
	`examen_id` INTEGER NOT NULL,
	`fecha_realizacion` DATE NOT NULL,
	`resultado_cualitativo` TEXT(65535),
	`resultado_json` JSON NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `vacunas` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`nombre` VARCHAR(255) NOT NULL,
	`descripcion` TEXT(65535),
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `examenes` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`nombre` VARCHAR(255) NOT NULL,
	`categoria` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `estado` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`nombre` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `mcpo` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`nombre` VARCHAR(255) NOT NULL,
	`estado_id` INTEGER NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `parroquia` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`nombre` VARCHAR(255) NOT NULL,
	`mcpo_id` INTEGER,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `centros_salud` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`estado_id` INTEGER NOT NULL,
	`mcpo_id` INTEGER,
	`parroquia_id` INTEGER,
	`nombre` VARCHAR(255) NOT NULL,
	`codigo` VARCHAR(255) NOT NULL,
	`encargado_id` INTEGER NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `profesiones` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`nombre` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `personal` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`tipo_cuenta` INTEGER NOT NULL,
	`centro_id` INTEGER NOT NULL,
	`cedula` BIGINT NOT NULL,
	`correo` VARCHAR(255) NOT NULL,
	`nombre1` VARCHAR(255) NOT NULL,
	`nombre2` VARCHAR(255) NOT NULL,
	`apellido1` VARCHAR(255) NOT NULL,
	`apellido2` VARCHAR(255) NOT NULL,
	`nacimiento` DATE NOT NULL,
	`profesion_id` INTEGER NOT NULL,
	`id_profesional` VARCHAR(255) NOT NULL,
	`password` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `master` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`nombre_usuario` VARCHAR(255) NOT NULL,
	`correo` VARCHAR(255) NOT NULL,
	`password` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id`)
);


ALTER TABLE `usuario_telefonos`
ADD FOREIGN KEY(`usuario_id`) REFERENCES `usuarios`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `usuarios`
ADD FOREIGN KEY(`sangre_id`) REFERENCES `tipoSangre`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `usuarios`
ADD FOREIGN KEY(`etnia_id`) REFERENCES `etnias`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `usuario_residencias`
ADD FOREIGN KEY(`usuario_id`) REFERENCES `usuarios`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `usuario_vacunas`
ADD FOREIGN KEY(`usuario_id`) REFERENCES `usuarios`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `usuario_vacunas`
ADD FOREIGN KEY(`vacuna_id`) REFERENCES `vacunas`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `usuario_examenes`
ADD FOREIGN KEY(`usuario_id`) REFERENCES `usuarios`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `usuario_examenes`
ADD FOREIGN KEY(`examen_id`) REFERENCES `examenes`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `mcpo`
ADD FOREIGN KEY(`estado_id`) REFERENCES `estado`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `parroquia`
ADD FOREIGN KEY(`mcpo_id`) REFERENCES `mcpo`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `usuario_residencias`
ADD FOREIGN KEY(`estado_id`) REFERENCES `estado`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `usuario_residencias`
ADD FOREIGN KEY(`mcpo_id`) REFERENCES `mcpo`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `usuario_residencias`
ADD FOREIGN KEY(`parroquia_id`) REFERENCES `parroquia`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `centros_salud`
ADD FOREIGN KEY(`estado_id`) REFERENCES `estado`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `centros_salud`
ADD FOREIGN KEY(`mcpo_id`) REFERENCES `mcpo`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `centros_salud`
ADD FOREIGN KEY(`parroquia_id`) REFERENCES `parroquia`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `usuarios`
ADD FOREIGN KEY(`profesion_id`) REFERENCES `profesiones`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `personal`
ADD FOREIGN KEY(`centro_id`) REFERENCES `centros_salud`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `personal`
ADD FOREIGN KEY(`profesion_id`) REFERENCES `profesiones`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `usuario_vacunas`
ADD FOREIGN KEY(`centro_id`) REFERENCES `centros_salud`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;


-- =====================================================================
-- Extensiones propuestas por el prototipo · 2026-10-29
--
-- Incluyen las columnas acordadas para el login, la evaluación del
-- certificado, la bandeja de la subregión y la consulta pública. No son
-- migraciones ejecutadas: el backend y la base de datos todavía no existen.
-- =====================================================================

-- Datos de ciudadanía que las vistas ya usan.
ALTER TABLE `usuarios`
ADD COLUMN `sexo` ENUM('F', 'M', 'otro') NOT NULL DEFAULT 'otro',
ADD COLUMN `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1,
ADD UNIQUE KEY `uq_usuarios_cedula` (`cedula`),
ADD UNIQUE KEY `uq_usuarios_correo` (`correo`);

ALTER TABLE `usuario_telefonos`
ADD KEY `idx_usuario_telefonos_usuario` (`usuario_id`);

ALTER TABLE `usuario_residencias`
ADD COLUMN `es_principal` TINYINT(1) NOT NULL DEFAULT 1,
ADD KEY `idx_usuario_residencias_usuario` (`usuario_id`);

-- Personal que aplicó o registró el evento clínico, para auditoría.
ALTER TABLE `usuario_vacunas`
ADD COLUMN `personal_id` INTEGER UNSIGNED NULL,
ADD KEY `idx_usuario_vacunas_personal` (`personal_id`),
ADD FOREIGN KEY (`personal_id`) REFERENCES `personal` (`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE `usuario_examenes`
ADD COLUMN `personal_id` INTEGER UNSIGNED NULL,
ADD COLUMN `laboratorio` VARCHAR(255) NULL,
ADD COLUMN `adjunto_url` VARCHAR(512) NULL,
ADD KEY `idx_usuario_examenes_personal` (`personal_id`),
ADD FOREIGN KEY (`personal_id`) REFERENCES `personal` (`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;

-- Reglas provisionales con las que el prototipo evalúa el certificado.
ALTER TABLE `vacunas`
ADD COLUMN `dosis_requeridas` INTEGER UNSIGNED NOT NULL DEFAULT 1,
ADD COLUMN `vigencia_meses` INTEGER UNSIGNED NULL COMMENT 'NULL = vigencia permanente',
ADD COLUMN `obligatoria_certificado` TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE `examenes`
ADD COLUMN `vigencia_meses` INTEGER UNSIGNED NOT NULL DEFAULT 12,
ADD COLUMN `sensible` TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN `obligatorio_certificado` TINYINT(1) NOT NULL DEFAULT 0;

-- Centros y personal: estado, contacto y baja lógica.
ALTER TABLE `centros_salud`
ADD COLUMN `tipo` TINYINT UNSIGNED NOT NULL DEFAULT 2 COMMENT '2 = centro, 3 = sede de subregión',
ADD COLUMN `telefono` VARCHAR(255) NULL,
ADD COLUMN `direccion` VARCHAR(255) NULL,
ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1,
ADD UNIQUE KEY `uq_centros_salud_codigo` (`codigo`);

ALTER TABLE `personal`
ADD COLUMN `telefono` VARCHAR(255) NULL,
ADD COLUMN `direccion` VARCHAR(255) NULL,
ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1,
ADD UNIQUE KEY `uq_personal_cedula` (`cedula`),
ADD UNIQUE KEY `uq_personal_correo` (`correo`);

ALTER TABLE `master`
ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1,
ADD COLUMN `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD UNIQUE KEY `uq_master_nombre_usuario` (`nombre_usuario`),
ADD UNIQUE KEY `uq_master_correo` (`correo`);

-- Login de dos niveles para roles 2 y 3. La propuesta no estaba en el
-- script recibido: una cuenta por centro/sede y su jefe asociado.
CREATE TABLE IF NOT EXISTS `cuentas_entidad` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`centro_id` INTEGER UNSIGNED NOT NULL,
	`correo` VARCHAR(255) NOT NULL,
	`password` VARCHAR(255) NOT NULL,
	`jefe_id` INTEGER UNSIGNED NOT NULL,
	`activo` TINYINT(1) NOT NULL DEFAULT 1,
	`creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`),
	UNIQUE KEY `uq_cuentas_entidad_centro` (`centro_id`),
	UNIQUE KEY `uq_cuentas_entidad_correo` (`correo`),
	KEY `idx_cuentas_entidad_jefe` (`jefe_id`),
	CONSTRAINT `fk_cuentas_entidad_centro`
		FOREIGN KEY (`centro_id`) REFERENCES `centros_salud` (`id`)
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT `fk_cuentas_entidad_jefe`
		FOREIGN KEY (`jefe_id`) REFERENCES `personal` (`id`)
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Solicitudes y emisión del certificado de salud.
CREATE TABLE IF NOT EXISTS `certificados_salud` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`codigo` VARCHAR(64) NOT NULL,
	`usuario_id` INTEGER UNSIGNED NOT NULL,
	`estado` ENUM('solicitado', 'autorizado', 'descartado', 'emitido') NOT NULL DEFAULT 'solicitado',
	`canal_solicitud` ENUM('subregion', 'consulta_publica') NOT NULL DEFAULT 'subregion',
	`solicitado_por_personal_id` INTEGER UNSIGNED NULL,
	`revisado_por_personal_id` INTEGER UNSIGNED NULL,
	`fecha_solicitud` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`fecha_revision` DATETIME NULL,
	`fecha_emision` DATETIME NULL,
	`motivo` TEXT NULL,
	`observaciones` TEXT NULL,
	`creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`actualizado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`),
	UNIQUE KEY `uq_certificados_salud_codigo` (`codigo`),
	KEY `idx_certificados_salud_usuario` (`usuario_id`, `fecha_solicitud`),
	KEY `idx_certificados_salud_estado` (`estado`),
	KEY `idx_certificados_salud_revisor` (`revisado_por_personal_id`),
	CONSTRAINT `fk_certificados_salud_usuario`
		FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT `fk_certificados_salud_solicitante`
		FOREIGN KEY (`solicitado_por_personal_id`) REFERENCES `personal` (`id`)
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT `fk_certificados_salud_revisor`
		FOREIGN KEY (`revisado_por_personal_id`) REFERENCES `personal` (`id`)
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Bandeja de la subregión. Solo registra solicitudes listas para revisar;
-- no hay filas para vencimientos de vacunas o exámenes.
CREATE TABLE IF NOT EXISTS `notificaciones_srs` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`centro_subregion_id` INTEGER UNSIGNED NOT NULL,
	`certificado_id` INTEGER UNSIGNED NOT NULL,
	`usuario_id` INTEGER UNSIGNED NOT NULL,
	`tipo` ENUM('solicitud_certificado') NOT NULL DEFAULT 'solicitud_certificado',
	`titulo` VARCHAR(255) NOT NULL,
	`mensaje` TEXT NOT NULL,
	`prioridad` ENUM('alta', 'media', 'baja') NOT NULL DEFAULT 'media',
	`leida` TINYINT(1) NOT NULL DEFAULT 0,
	`creada_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`leida_en` DATETIME NULL,
	PRIMARY KEY(`id`),
	UNIQUE KEY `uq_notificaciones_srs_certificado` (`certificado_id`, `tipo`),
	KEY `idx_notificaciones_srs_bandeja` (`centro_subregion_id`, `leida`, `creada_en`),
	CONSTRAINT `fk_notificaciones_srs_subregion`
		FOREIGN KEY (`centro_subregion_id`) REFERENCES `centros_salud` (`id`)
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT `fk_notificaciones_srs_certificado`
		FOREIGN KEY (`certificado_id`) REFERENCES `certificados_salud` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE,
	CONSTRAINT `fk_notificaciones_srs_usuario`
		FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Envío simulado del certificado desde la consulta pública. No guarda
-- códigos de verificación porque esa función está fuera del alcance actual.
CREATE TABLE IF NOT EXISTS `certificado_envios` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`certificado_id` INTEGER UNSIGNED NOT NULL,
	`correo_destino` VARCHAR(255) NOT NULL,
	`estado` ENUM('simulado', 'enviado', 'fallido') NOT NULL DEFAULT 'simulado',
	`enviado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`error` TEXT NULL,
	PRIMARY KEY(`id`),
	KEY `idx_certificado_envios_certificado` (`certificado_id`, `enviado_en`),
	CONSTRAINT `fk_certificado_envios_certificado`
		FOREIGN KEY (`certificado_id`) REFERENCES `certificados_salud` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Auditoría mínima de la consulta por cédula. El ciudadano no inicia sesión.
CREATE TABLE IF NOT EXISTS `consultas_publicas` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`usuario_id` INTEGER UNSIGNED NULL,
	`cedula_consultada` BIGINT NOT NULL,
	`encontrada` TINYINT(1) NOT NULL,
	`origen` VARCHAR(64) NOT NULL DEFAULT 'consulta_publica',
	`creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`),
	KEY `idx_consultas_publicas_fecha` (`creado_en`),
	KEY `idx_consultas_publicas_usuario` (`usuario_id`),
	CONSTRAINT `fk_consultas_publicas_usuario`
		FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
		ON UPDATE NO ACTION ON DELETE SET NULL
);