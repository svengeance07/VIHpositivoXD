import { z } from 'zod';

import { idParamSchema, okSchema } from '../catalogos/catalogos.schemas.js';
import {
  cedulaParamSchema,
  ciudadanoMayorDetalleSchema,
  ciudadanoMenorDetalleSchema,
} from '../ciudadanos/ciudadanos.schemas.js';

export { cedulaParamSchema, idParamSchema, okSchema };

const DATE_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function getTodayIsoUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseIsoCalendarDate(value: string): Date | null {
  if (!DATE_ISO_REGEX.test(value)) {
    return null;
  }

  const [yearRaw, monthRaw, dayRaw] = value.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    year < 1900
  ) {
    return null;
  }

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return null;
  }

  return utcDate;
}

export const fechaIsoCalendarSchema = z
  .string()
  .trim()
  .refine(
    (value) => parseIsoCalendarDate(value) !== null,
    'La fecha debe tener formato válido YYYY-MM-DD (desde 1900 en adelante).',
  );

export const fechaIsoNotFutureSchema = z
  .string()
  .trim()
  .refine((value) => {
    const parsed = parseIsoCalendarDate(value);
    if (!parsed) {
      return false;
    }
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    return parsed.getTime() <= todayUtc.getTime();
  }, 'La fecha debe tener formato válido YYYY-MM-DD y no puede ser futura.');

function optionalNullableTrimmed(maxLength: number) {
  return z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }
      if (value === null) {
        return null;
      }
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    })
    .refine((value) => value === undefined || value === null || value.length <= maxLength, {
      message: `El campo no puede superar los ${maxLength} caracteres.`,
    });
}

export const vacunaResumenSchema = z.object({
  id_vacuna: z.number().int().positive(),
  nombre_vacuna: z.string(),
  cantidad_dosis: z.number().int().positive(),
});

export const centroAplicacionResumenSchema = z.object({
  id_centro: z.number().int().positive(),
  nombre_centro: z.string(),
  codigo_centro: z.string(),
  estado_id: z.number().int().positive().nullable(),
});

export const pacienteMayorResumenSchema = z.object({
  id_ciudadano: z.number().int().positive(),
  primer_nombre: z.string(),
  segundo_nombre: z.string().nullable(),
  primer_apellido: z.string(),
  segundo_apellido: z.string().nullable(),
  c_i: z.number().int(),
});

export const pacienteMenorResumenSchema = z.object({
  id_menor: z.number().int().positive(),
  primer_nombre: z.string(),
  segundo_nombre: z.string().nullable(),
  primer_apellido: z.string(),
  segundo_apellido: z.string().nullable(),
  padre_id: z.number().int().positive().nullable(),
});

export const inmunizacionDetalleSchema = z.object({
  id_inmunizacion: z.number().int().positive(),
  numero_dosis: z.number().int().positive(),
  fecha_aplicacion: z.string().nullable(),
  numero_lote: z.string().nullable(),
  observaciones: z.string().nullable(),
  centro_salud_aplicacion: z.number().int().positive().nullable(),
  vacuna_id: z.number().int().positive().nullable(),
  ciudadano_mayor_edad_id: z.number().int().positive().nullable(),
  ciudadano_mayor_menor_id: z.number().int().positive().nullable(),
  vacuna: vacunaResumenSchema.nullable(),
  centro_salud: centroAplicacionResumenSchema.nullable(),
  ciudadano_mayor: pacienteMayorResumenSchema.nullable(),
  ciudadano_menor: pacienteMenorResumenSchema.nullable(),
});

export const esquemaVacunaProgresoSchema = z.object({
  id_vacuna: z.number().int().positive(),
  nombre_vacuna: z.string(),
  cantidad_dosis_requeridas: z.number().int().positive(),
  dosis_aplicadas: z.number().int().nonnegative(),
  esquema_completo: z.boolean(),
  proxima_dosis: z.number().int().positive().nullable(),
  historial: z.array(inmunizacionDetalleSchema),
});

export const cartillaVacunacionCiudadanoSchema = z.object({
  resumen_esquemas: z.array(esquemaVacunaProgresoSchema),
  inmunizaciones: z.array(inmunizacionDetalleSchema),
});

export const cartillaFamiliarCedulaSchema = z.object({
  titular: ciudadanoMayorDetalleSchema,
  cartilla_titular: cartillaVacunacionCiudadanoSchema,
  menores_a_cargo: z.array(
    z.object({
      menor: ciudadanoMenorDetalleSchema,
      cartilla: cartillaVacunacionCiudadanoSchema,
    }),
  ),
});

export const createInmunizacionBodySchema = z
  .object({
    vacuna_id: z
      .number({ required_error: 'La vacuna (vacuna_id) es obligatoria.' })
      .int()
      .positive(),
    numero_dosis: z
      .number({ required_error: 'El número de dosis es obligatorio.' })
      .int('El número de dosis debe ser un número entero.')
      .min(1, 'El número de dosis debe ser al menos 1.')
      .max(20, 'El número de dosis excede el máximo permitido.'),
    fecha_aplicacion: fechaIsoNotFutureSchema.optional(),
    numero_lote: z
      .string({ required_error: 'El número de lote es obligatorio.' })
      .trim()
      .min(2, 'El número de lote debe tener al menos 2 caracteres.')
      .max(30, 'El número de lote no puede superar los 30 caracteres.'),
    observaciones: optionalNullableTrimmed(255),
    centro_salud_aplicacion: z.number().int().positive().optional(),
    ciudadano_mayor_edad_id: z.number().int().positive().nullable().optional(),
    ciudadano_mayor_menor_id: z.number().int().positive().nullable().optional(),
  })
  .refine(
    (data) => {
      const hasMayor =
        data.ciudadano_mayor_edad_id !== undefined && data.ciudadano_mayor_edad_id !== null;
      const hasMenor =
        data.ciudadano_mayor_menor_id !== undefined && data.ciudadano_mayor_menor_id !== null;
      return hasMayor !== hasMenor;
    },
    {
      message:
        'Debe indicar exactamente un paciente: ciudadano_mayor_edad_id o ciudadano_mayor_menor_id (no ambos).',
    },
  );

export const updateInmunizacionBodySchema = z
  .object({
    fecha_aplicacion: fechaIsoNotFutureSchema.optional(),
    numero_lote: z.string().trim().min(2).max(30).optional(),
    observaciones: optionalNullableTrimmed(255),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Debe enviar al menos un campo para actualizar la inmunización.',
  });

export const inmunizacionesQuerySchema = z.object({
  vacuna_id: z.coerce.number().int().positive().optional(),
  centro_salud_aplicacion: z.coerce.number().int().positive().optional(),
  estado_id: z.coerce.number().int().positive().optional(),
  ciudadano_mayor_edad_id: z.coerce.number().int().positive().optional(),
  ciudadano_mayor_menor_id: z.coerce.number().int().positive().optional(),
  numero_lote: z.string().trim().min(1).max(30).optional(),
  fecha_desde: fechaIsoCalendarSchema.optional(),
  fecha_hasta: fechaIsoCalendarSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type VacunaResumen = z.infer<typeof vacunaResumenSchema>;
export type CentroAplicacionResumen = z.infer<typeof centroAplicacionResumenSchema>;
export type PacienteMayorResumen = z.infer<typeof pacienteMayorResumenSchema>;
export type PacienteMenorResumen = z.infer<typeof pacienteMenorResumenSchema>;
export type InmunizacionDetalle = z.infer<typeof inmunizacionDetalleSchema>;
export type EsquemaVacunaProgreso = z.infer<typeof esquemaVacunaProgresoSchema>;
export type CartillaVacunacionCiudadano = z.infer<typeof cartillaVacunacionCiudadanoSchema>;
export type CartillaFamiliarCedula = z.infer<typeof cartillaFamiliarCedulaSchema>;

export type CreateInmunizacionBody = z.infer<typeof createInmunizacionBodySchema>;
export type UpdateInmunizacionBody = z.infer<typeof updateInmunizacionBodySchema>;
export type InmunizacionesQuery = z.infer<typeof inmunizacionesQuerySchema>;
