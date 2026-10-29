import type { NotificacionSrs, SolicitudCertificado } from '../modelos/subregion-salud';

/**
 * Datos temporales de la Subregión de Salud.
 *
 * La subregión activa del prototipo es Guárico y coincide con la cuenta de
 * acceso de `cuentas-acceso.ts`. Los ciudadanos y el personal tipo 2 viven en
 * los mocks compartidos del master; aquí solo se agregan los registros propios
 * del flujo de certificados y las notificaciones dirigidas a esta subregión.
 */

export const SUBREGION_SALUD_ACTUAL_ID = 'srs-guarico';
export const SUBREGION_SALUD_ACTUAL_NOMBRE = 'Subregión de Salud Guárico';
export const ESTADO_SUBREGION_ACTUAL_ID = 'guarico';
export const ESTADO_SUBREGION_ACTUAL_NOMBRE = 'Guárico';

/**
 * Vigencia provisional de los exámenes para la evaluación del certificado.
 * Los valores son una decisión de prototipo: el equipo de salud debe confirmar
 * los períodos reales antes de convertirlos en reglas de negocio.
 */
export const VIGENCIA_EXAMENES_MESES: Readonly<Record<string, number>> = {
  vih: 6,
  vdrl: 6,
  'hepatitis-b': 6,
  hemoglobina: 12,
  glicemia: 3,
};

export const EXAMENES_REQUERIDOS_CERTIFICADO: readonly string[] = ['vih', 'vdrl'];

export const SOLICITUDES_CERTIFICADO_MOCK: readonly SolicitudCertificado[] = [
  {
    id: 'cert-001',
    codigo: 'CERT-GUA-2026-001',
    ciudadanoId: 'c-15',
    fechaSolicitud: '2026-10-27',
    estado: 'solicitado',
    solicitadoPor: 'José Gregorio Rondón',
    revisadoPor: 'Pendiente',
    fechaRevision: null,
    fechaEmision: null,
    motivo: '',
    observaciones: 'Solicitud presentada en el Hospital Central de San Juan.',
    correoEnviado: false,
  },
  {
    id: 'cert-002',
    codigo: 'CERT-GUA-2026-002',
    ciudadanoId: 'c-16',
    fechaSolicitud: '2026-10-28',
    estado: 'solicitado',
    solicitadoPor: 'María Elena Blanco',
    revisadoPor: 'Pendiente',
    fechaRevision: null,
    fechaEmision: null,
    motivo: '',
    observaciones: 'Requiere el certificado para un trámite laboral.',
    correoEnviado: false,
  },
  {
    id: 'cert-003',
    codigo: 'CERT-GUA-2026-003',
    ciudadanoId: 'c-19',
    fechaSolicitud: '2026-10-20',
    estado: 'autorizado',
    solicitadoPor: 'Luis Fernando Rojas',
    revisadoPor: 'Lic. Carlos Rojas',
    fechaRevision: '2026-10-21',
    fechaEmision: null,
    motivo: 'Cumple con el esquema de inmunizaciones y la serología exigida.',
    observaciones: 'Solicitud presentada en el Hospital Central de San Juan.',
    correoEnviado: false,
  },
  {
    id: 'cert-004',
    codigo: 'CERT-GUA-2026-004',
    ciudadanoId: 'c-21',
    fechaSolicitud: '2026-10-15',
    estado: 'descartado',
    solicitadoPor: 'Rafael Antonio Suárez',
    revisadoPor: 'Lic. Carlos Rojas',
    fechaRevision: '2026-10-16',
    fechaEmision: null,
    motivo:
      'El toxoide tetánico está vencido y la serología se encuentra fuera del período de vigencia. Debe actualizar los requisitos y solicitar nuevamente.',
    observaciones: 'Solicitud presentada en el Ambulatorio Rural Calabozo.',
    correoEnviado: false,
  },
  {
    id: 'cert-005',
    codigo: 'CERT-GUA-2026-005',
    ciudadanoId: 'c-22',
    fechaSolicitud: '2026-10-10',
    estado: 'emitido',
    solicitadoPor: 'Génesis Paola Medina',
    revisadoPor: 'Lic. Carlos Rojas',
    fechaRevision: '2026-10-11',
    fechaEmision: '2026-10-12',
    motivo: 'Cumple con el esquema de inmunizaciones y la serología exigida.',
    observaciones: 'Solicitud presentada en el Hospital Central de San Juan.',
    correoEnviado: false,
  },
  {
    id: 'cert-006',
    codigo: 'CERT-GUA-2026-006',
    ciudadanoId: 'c-3',
    fechaSolicitud: '2026-10-29',
    estado: 'solicitado',
    solicitadoPor: 'Ana Lucía Rodríguez',
    revisadoPor: 'Pendiente',
    fechaRevision: null,
    fechaEmision: null,
    motivo: '',
    observaciones: 'Solicitud registrada desde la ficha ciudadana de la subregión.',
    correoEnviado: false,
  },
];

export const NOTIFICACIONES_SUBREGION_MOCK: readonly NotificacionSrs[] = [
  {
    id: 'notif-001',
    fecha: '2026-10-29T07:45:00',
    tipo: 'expediente',
    titulo: 'Vacuna vencida detectada',
    mensaje:
      'El expediente de Carlos Andrés Mendoza presenta el toxoide tetánico vencido. Conviene contactar al ciudadano para actualizar el esquema.',
    personaNombre: 'Carlos Andrés Mendoza',
    personaCedula: '10624789',
    centroNombre: 'Hospital Central de San Juan',
    estadoId: ESTADO_SUBREGION_ACTUAL_ID,
    leida: false,
    prioridad: 'media',
    enlace: '/SRS/ciudadanos/c-17',
  },
  {
    id: 'notif-002',
    fecha: '2026-10-29T08:10:00',
    tipo: 'certificado',
    titulo: 'Nueva solicitud de certificado',
    mensaje:
      'Ana Lucía Rodríguez solicitó la evaluación de su certificado de salud. La solicitud está pendiente de revisión.',
    personaNombre: 'Ana Lucía Rodríguez',
    personaCedula: '25678901',
    centroNombre: 'Hospital Central de San Juan',
    estadoId: ESTADO_SUBREGION_ACTUAL_ID,
    leida: false,
    prioridad: 'media',
    enlace: '/SRS/certificados/cert-006',
  },
  {
    id: 'notif-003',
    fecha: '2026-10-28T11:05:00',
    tipo: 'certificado',
    titulo: 'Nueva solicitud de certificado',
    mensaje:
      'María Elena Blanco solicitó su certificado de salud para un trámite laboral. Revisa los requisitos antes de decidir.',
    personaNombre: 'María Elena Blanco',
    personaCedula: '17456320',
    centroNombre: 'Ambulatorio Rural Calabozo',
    estadoId: ESTADO_SUBREGION_ACTUAL_ID,
    leida: false,
    prioridad: 'media',
    enlace: '/SRS/certificados/cert-002',
  },
  {
    id: 'notif-004',
    fecha: '2026-10-28T09:20:00',
    tipo: 'esavi',
    titulo: 'Evento adverso reportado (ESAVI)',
    mensaje:
      'El Hospital Central de San Juan reportó una reacción local leve posterior a la vacuna contra influenza. Requiere seguimiento de la subregión.',
    personaNombre: 'Luis Fernando Rojas',
    personaCedula: '8192457',
    centroNombre: 'Hospital Central de San Juan',
    estadoId: ESTADO_SUBREGION_ACTUAL_ID,
    leida: false,
    prioridad: 'alta',
    enlace: '/SRS/ciudadanos/c-19',
  },
  {
    id: 'notif-005',
    fecha: '2026-10-27T14:15:00',
    tipo: 'certificado',
    titulo: 'Nueva solicitud de certificado',
    mensaje:
      'José Gregorio Rondón solicitó la emisión de su certificado de salud. El expediente cumple con los requisitos del prototipo.',
    personaNombre: 'José Gregorio Rondón',
    personaCedula: '15324687',
    centroNombre: 'Hospital Central de San Juan',
    estadoId: ESTADO_SUBREGION_ACTUAL_ID,
    leida: false,
    prioridad: 'media',
    enlace: '/SRS/certificados/cert-001',
  },
  {
    id: 'notif-006',
    fecha: '2026-10-16T10:30:00',
    tipo: 'certificado',
    titulo: 'Solicitud de certificado descartada',
    mensaje:
      'Rafael Antonio Suárez debe actualizar su esquema de vacunación y serología antes de volver a solicitar el certificado.',
    personaNombre: 'Rafael Antonio Suárez',
    personaCedula: '4326719',
    centroNombre: 'Ambulatorio Rural Calabozo',
    estadoId: ESTADO_SUBREGION_ACTUAL_ID,
    leida: true,
    prioridad: 'baja',
    enlace: '/SRS/certificados/cert-004',
  },
  {
    id: 'notif-007',
    fecha: '2026-10-12T16:40:00',
    tipo: 'certificado',
    titulo: 'Certificado de salud emitido',
    mensaje:
      'El certificado de Génesis Paola Medina fue emitido. El envío por correo quedará disponible en una fase posterior.',
    personaNombre: 'Génesis Paola Medina',
    personaCedula: '26548971',
    centroNombre: 'Hospital Central de San Juan',
    estadoId: ESTADO_SUBREGION_ACTUAL_ID,
    leida: true,
    prioridad: 'baja',
    enlace: '/SRS/certificados/cert-005',
  },
  {
    id: 'notif-008',
    fecha: '2026-10-11T09:00:00',
    tipo: 'sistema',
    titulo: 'Cobertura de personal actualizada',
    mensaje:
      'La subregión incorporó nuevos registros de personal tipo 2 en el Hospital Central de San Juan y en el Ambulatorio Rural Calabozo.',
    personaNombre: 'Equipo de la subregión',
    centroNombre: 'Subregión de Salud Guárico',
    estadoId: ESTADO_SUBREGION_ACTUAL_ID,
    leida: true,
    prioridad: 'baja',
    enlace: '/SRS/trabajadores',
  },
];
