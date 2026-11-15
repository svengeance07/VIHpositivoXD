import { z } from 'zod';

import {
  ESTATUS_CERTIFICADO_VALUES,
  NIVEL_GRAVEDAD_VALUES,
  SEXO_VALUES,
  TIPO_SANGRE_VALUES,
} from '../../db/schema.js';
import {
  cedulaParamSchema,
  fechaIsoCalendarSchema,
  fechaIsoNotFutureSchema,
  idParamSchema,
  inmunizacionDetalleSchema,
  okSchema,
  pacienteMayorResumenSchema,
  pacienteMenorResumenSchema,
} from '../inmunizaciones/index.js';

export {
  cedulaParamSchema,
  fechaIsoCalendarSchema,
  fechaIsoNotFutureSchema,
  idParamSchema,
  okSchema,
};

export const reporteInmunizacionResumenSchema = z.object({
  id_inmunizacion: z.number().int().positive(),
  numero_dosis: z.number().int().positive(),
  fecha_aplicacion: z.string().nullable(),
  numero_lote: z.string().nullable(),
  centro_salud_aplicacion: z.number().int().positive().nullable(),
  nombre_centro: z.string().nullable(),
  estado_id: z.number().int().positive().nullable(),
  vacuna_id: z.number().int().positive().nullable(),
  nombre_vacuna: z.string().nullable(),
});

export const reporteDetalleSchema = z.object({
  id_reportes: z.number().int().positive(),
  nivel_gravedad: z.enum(NIVEL_GRAVEDAD_VALUES),
  recomendaciones: z.string(),
  inmunizacion_id: z.number().int().positive().nullable(),
  ciudadano_mayor_id: z.number().int().positive().nullable(),
  ciudadano_menor_id: z.number().int().positive().nullable(),
  sintoma_id: z.number().int().positive().nullable(),
  descripcion_sintoma: z.string().nullable(),
  inmunizacion: reporteInmunizacionResumenSchema.nullable(),
  ciudadano_mayor: pacienteMayorResumenSchema.nullable(),
  ciudadano_menor: pacienteMenorResumenSchema.nullable(),
});

export const createReporteBodySchema = z
  .object({
    inmunizacion_id: z
      .number({ required_error: 'El ID de la inmunización es obligatorio.' })
      .int()
      .positive(),
    sintoma_id: z
      .number({ required_error: 'El ID del síntoma común es obligatorio.' })
      .int()
      .positive(),
    nivel_gravedad: z.enum(NIVEL_GRAVEDAD_VALUES, {
      required_error: 'El nivel de gravedad es obligatorio.',
    }),
    recomendaciones: z
      .string({ required_error: 'Las recomendaciones médicas son obligatorias.' })
      .trim()
      .min(3, 'Las recomendaciones deben tener al menos 3 caracteres.')
      .max(255, 'Las recomendaciones no pueden superar los 255 caracteres.'),
    ciudadano_mayor_id: z.number().int().positive().nullable().optional(),
    ciudadano_menor_id: z.number().int().positive().nullable().optional(),
  })
  .refine(
    (data) =>
      !(
        data.ciudadano_mayor_id !== undefined &&
        data.ciudadano_mayor_id !== null &&
        data.ciudadano_menor_id !== undefined &&
        data.ciudadano_menor_id !== null
      ),
    {
      message: 'Un reporte no puede asociarse simultáneamente a un ciudadano mayor y a un menor.',
    },
  );

export const updateReporteBodySchema = z
  .object({
    nivel_gravedad: z.enum(NIVEL_GRAVEDAD_VALUES).optional(),
    recomendaciones: z.string().trim().min(3).max(255).optional(),
    sintoma_id: z.number().int().positive().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Debe enviar al menos un campo para actualizar el reporte.',
  });

export const reportesQuerySchema = z.object({
  nivel_gravedad: z.enum(NIVEL_GRAVEDAD_VALUES).optional(),
  sintoma_id: z.coerce.number().int().positive().optional(),
  inmunizacion_id: z.coerce.number().int().positive().optional(),
  ciudadano_mayor_id: z.coerce.number().int().positive().optional(),
  ciudadano_menor_id: z.coerce.number().int().positive().optional(),
  centro_salud_id: z.coerce.number().int().positive().optional(),
  estado_id: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const certificadoCiudadanoSchema = z.object({
  id_ciudadano: z.number().int().positive(),
  primer_nombre: z.string(),
  segundo_nombre: z.string().nullable(),
  primer_apellido: z.string(),
  segundo_apellido: z.string().nullable(),
  c_i: z.number().int(),
  fecha_nacimiento: z.string(),
  sexo: z.enum(SEXO_VALUES),
  tipo_sangre: z.enum(TIPO_SANGRE_VALUES),
});

export const certificadoDetalleSchema = z.object({
  id_certificado: z.number().int().positive(),
  fecha_emision: z.string(),
  estatus: z.enum(ESTATUS_CERTIFICADO_VALUES),
  ciudadano_mayor_id: z.number().int().positive().nullable(),
  examen_id: z.number().int().positive().nullable(),
  nombre_examen: z.string().nullable(),
  ciudadano: certificadoCiudadanoSchema.nullable(),
  total_inmunizaciones_registradas: z.number().int().nonnegative(),
});

export const validacionCertificadoSchema = z.object({
  valido: z.boolean(),
  motivo: z.string(),
  certificado: certificadoDetalleSchema,
  inmunizaciones: z.array(inmunizacionDetalleSchema),
});

export const consultaCertificadosCedulaSchema = z.object({
  ciudadano: certificadoCiudadanoSchema,
  certificados: z.array(
    z.object({
      valido: z.boolean(),
      motivo: z.string(),
      certificado: certificadoDetalleSchema,
    }),
  ),
  inmunizaciones: z.array(inmunizacionDetalleSchema),
});

export const createCertificadoBodySchema = z.object({
  ciudadano_mayor_id: z
    .number({ required_error: 'El ID del ciudadano mayor es obligatorio.' })
    .int()
    .positive(),
  examen_id: z.number({ required_error: 'El ID del examen es obligatorio.' }).int().positive(),
  fecha_emision: fechaIsoNotFutureSchema.optional(),
  estatus: z.enum(ESTATUS_CERTIFICADO_VALUES).default('APROBADO'),
});

export const updateCertificadoBodySchema = z
  .object({
    estatus: z.enum(ESTATUS_CERTIFICADO_VALUES).optional(),
    examen_id: z.number().int().positive().optional(),
    fecha_emision: fechaIsoNotFutureSchema.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Debe enviar al menos un campo para actualizar el certificado.',
  });

export const certificadosQuerySchema = z.object({
  ciudadano_mayor_id: z.coerce.number().int().positive().optional(),
  c_i: z.coerce.number().int().positive().optional(),
  examen_id: z.coerce.number().int().positive().optional(),
  estatus: z.enum(ESTATUS_CERTIFICADO_VALUES).optional(),
  fecha_desde: fechaIsoCalendarSchema.optional(),
  fecha_hasta: fechaIsoCalendarSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ReporteInmunizacionResumen = z.infer<typeof reporteInmunizacionResumenSchema>;
export type ReporteDetalle = z.infer<typeof reporteDetalleSchema>;
export type CreateReporteBody = z.infer<typeof createReporteBodySchema>;
export type UpdateReporteBody = z.infer<typeof updateReporteBodySchema>;
export type ReportesQuery = z.infer<typeof reportesQuerySchema>;

export type CertificadoCiudadano = z.infer<typeof certificadoCiudadanoSchema>;
export type CertificadoDetalle = z.infer<typeof certificadoDetalleSchema>;
export type ValidacionCertificado = z.infer<typeof validacionCertificadoSchema>;
export type ConsultaCertificadosCedula = z.infer<typeof consultaCertificadosCedulaSchema>;
export type CreateCertificadoBody = z.infer<typeof createCertificadoBodySchema>;
export type UpdateCertificadoBody = z.infer<typeof updateCertificadoBodySchema>;
export type CertificadosQuery = z.infer<typeof certificadosQuerySchema>;
