import { computed, inject, Injectable, signal } from '@angular/core';

import {
  ESTADO_SUBREGION_ACTUAL_ID,
  ESTADO_SUBREGION_ACTUAL_NOMBRE,
  EXAMENES_REQUERIDOS_CERTIFICADO,
  NOTIFICACIONES_SUBREGION_MOCK,
  SOLICITUDES_CERTIFICADO_MOCK,
  SUBREGION_SALUD_ACTUAL_ID,
  SUBREGION_SALUD_ACTUAL_NOMBRE,
  VIGENCIA_EXAMENES_MESES,
} from '../datos/subregion-salud';
import type { EstadoCertificado } from '../modelos/enumeraciones';
import type { Ciudadano } from '../modelos/master';
import type {
  CentroSubregionVista,
  EstadoRequisito,
  EstadoVigencia,
  ExamenFicha,
  FichaCiudadano,
  HitoLineaTiempo,
  NotificacionSrs,
  PrioridadNotificacionSrs,
  RequisitoCertificado,
  ResumenSubregion,
  SolicitudCertificado,
  SolicitudCertificadoVista,
  TipoNotificacionSrs,
  TrabajadorSubregionVista,
  VacunaFicha,
} from '../modelos/subregion-salud';
import { CatalogosService } from './catalogos.service';
import { DatosMasterService } from './datos-master.service';

/**
 * Datos y reglas de presentación de la Subregión de Salud.
 *
 * Recicla los ciudadanos, centros y personal del master, pero los acota al
 * estado de la subregión activa. Las solicitudes de certificado y las
 * notificaciones sí son propias de este rol. Todo vive en signals para que
 * las pantallas reaccionen sin `zone.js`.
 */
@Injectable({ providedIn: 'root' })
export class DatosSubregionSaludService {
  private readonly datos = inject(DatosMasterService);
  private readonly catalogos = inject(CatalogosService);

  private readonly _solicitudes = signal<readonly SolicitudCertificado[]>(
    SOLICITUDES_CERTIFICADO_MOCK,
  );
  private readonly _notificaciones = signal<readonly NotificacionSrs[]>(
    NOTIFICACIONES_SUBREGION_MOCK,
  );

  readonly subregionId = SUBREGION_SALUD_ACTUAL_ID;
  readonly subregionNombre = SUBREGION_SALUD_ACTUAL_NOMBRE;
  readonly estadoId = ESTADO_SUBREGION_ACTUAL_ID;
  readonly estadoNombre = ESTADO_SUBREGION_ACTUAL_NOMBRE;

  /** Personal tipo 2 que presta servicio en los centros del estado. */
  readonly trabajadores = computed<readonly TrabajadorSubregionVista[]>(() => {
    const resultado: TrabajadorSubregionVista[] = [];

    for (const fila of this.datos.personalVista()) {
      if (
        fila.personal.tipoCuenta !== 2 ||
        !fila.centro ||
        !fila.estado ||
        fila.estado.id !== this.estadoId
      ) {
        continue;
      }

      resultado.push({
        personal: fila.personal,
        centro: fila.centro,
        estadoNombre: fila.estado.nombre,
        municipioNombre: fila.municipio?.nombre ?? '—',
        parroquiaNombre: fila.parroquia?.nombre ?? '—',
        profesion: fila.profesion,
        esJefe: fila.esJefe,
        aniosServicio: this.aniosServicio(fila.personal.ingreso),
        iniciales: this.iniciales(fila.personal.nombre),
      });
    }

    return resultado.sort((a, b) => a.personal.nombre.localeCompare(b.personal.nombre, 'es'));
  });

  readonly trabajadoresActivos = computed(() =>
    this.trabajadores().filter((trabajador) => trabajador.personal.activo),
  );

  readonly trabajadoresPorId = computed(
    () => new Map(this.trabajadores().map((trabajador) => [trabajador.personal.id, trabajador])),
  );

  readonly centros = computed<readonly CentroSubregionVista[]>(() => {
    const trabajadores = this.trabajadores();

    return this.datos.centrosDeEstado(this.estadoId).map((fila) => ({
      centro: fila.centro,
      municipioNombre: fila.municipio?.nombre ?? '—',
      parroquiaNombre: fila.parroquia?.nombre ?? '—',
      jefe: fila.jefe,
      trabajadores: trabajadores.filter(
        (trabajador) => trabajador.personal.centroId === fila.centro.id,
      ).length,
    }));
  });

  readonly ciudadanos = computed<readonly Ciudadano[]>(() =>
    this.datos.ciudadanos().filter((ciudadano) => ciudadano.estadoId === this.estadoId),
  );

  /** Fichas consolidadas con vacunas, exámenes, requisitos y línea de tiempo. */
  readonly fichas = computed<readonly FichaCiudadano[]>(() =>
    this.ciudadanos()
      .map((ciudadano) => this.construirFicha(ciudadano))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
  );

  readonly fichasPorId = computed(
    () => new Map(this.fichas().map((ficha) => [ficha.ciudadano.id, ficha])),
  );

  readonly solicitudes = computed<readonly SolicitudCertificadoVista[]>(() => {
    const fichas = this.fichasPorId();
    const resultado: SolicitudCertificadoVista[] = [];

    for (const solicitud of this._solicitudes()) {
      const ficha = fichas.get(solicitud.ciudadanoId);
      if (!ficha) {
        continue;
      }

      resultado.push({
        ...solicitud,
        ficha,
        nombreCiudadano: ficha.nombre,
        cedula: ficha.ciudadano.cedula,
        correo: ficha.correo,
      });
    }

    return resultado.sort((a, b) => b.fechaSolicitud.localeCompare(a.fechaSolicitud));
  });

  readonly solicitudesPorId = computed(
    () => new Map(this.solicitudes().map((solicitud) => [solicitud.id, solicitud])),
  );

  readonly solicitudesPendientes = computed(() =>
    this.solicitudes().filter((solicitud) => solicitud.estado === 'solicitado'),
  );

  readonly certificadosEmitidos = computed(() =>
    this.solicitudes().filter((solicitud) => solicitud.estado === 'emitido'),
  );

  /** Notificaciones del estado asignado, de la más reciente a la más antigua. */
  readonly notificaciones = computed<readonly NotificacionSrs[]>(() =>
    this._notificaciones()
      .filter((notificacion) => notificacion.estadoId === this.estadoId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha)),
  );

  readonly notificacionesNoLeidas = computed(
    () => this.notificaciones().filter((notificacion) => !notificacion.leida).length,
  );

  readonly notificacionesRecientes = computed(() => this.notificaciones().slice(0, 5));

  readonly resumen = computed<ResumenSubregion>(() => {
    const trabajadores = this.trabajadoresActivos();
    const fichas = this.fichas();
    const solicitudes = this.solicitudes();

    return {
      ciudadanos: fichas.length,
      trabajadores: trabajadores.length,
      jefes: trabajadores.filter((trabajador) => trabajador.esJefe).length,
      centros: this.centros().length,
      solicitudesPendientes: solicitudes.filter((solicitud) => solicitud.estado === 'solicitado')
        .length,
      certificadosEmitidos: solicitudes.filter((solicitud) => solicitud.estado === 'emitido')
        .length,
      noLeidas: this.notificacionesNoLeidas(),
      aptos: fichas.filter((ficha) => ficha.aptoCertificado).length,
      vacunasVencidas: fichas.reduce((total, ficha) => total + ficha.vacunasVencidas, 0),
    };
  });

  trabajador(id: string): TrabajadorSubregionVista | null {
    return this.trabajadoresPorId().get(id) ?? null;
  }

  centro(id: string): CentroSubregionVista | null {
    return this.centros().find((fila) => fila.centro.id === id) ?? null;
  }

  ficha(id: string): FichaCiudadano | null {
    return this.fichasPorId().get(id) ?? null;
  }

  solicitud(id: string): SolicitudCertificadoVista | null {
    return this.solicitudesPorId().get(id) ?? null;
  }

  solicitudesDeCiudadano(ciudadanoId: string): readonly SolicitudCertificadoVista[] {
    return this.solicitudes().filter((solicitud) => solicitud.ciudadanoId === ciudadanoId);
  }

  solicitudActivaDeCiudadano(ciudadanoId: string): SolicitudCertificadoVista | null {
    return (
      this.solicitudesDeCiudadano(ciudadanoId).find(
        (solicitud) => solicitud.estado === 'solicitado' || solicitud.estado === 'autorizado',
      ) ?? null
    );
  }

  /**
   * Registra una solicitud de certificado desde la ficha ciudadana.
   *
   * No hay portal ciudadano todavía: la subregión actúa como ventanilla de
   * recepción para poder probar el flujo completo de revisión.
   */
  crearSolicitudCertificado(ciudadanoId: string): SolicitudCertificadoVista | null {
    const ficha = this.ficha(ciudadanoId);

    if (!ficha || this.solicitudActivaDeCiudadano(ciudadanoId)) {
      return null;
    }

    const id = this.generarId('cert');
    const solicitud: SolicitudCertificado = {
      id,
      codigo: this.siguienteCodigoCertificado(),
      ciudadanoId,
      fechaSolicitud: this.fechaHoy(),
      estado: 'solicitado',
      solicitadoPor: ficha.nombre,
      revisadoPor: 'Pendiente',
      fechaRevision: null,
      fechaEmision: null,
      motivo: '',
      observaciones: 'Solicitud registrada desde la ficha ciudadana de la subregión.',
      correoEnviado: false,
    };

    this._solicitudes.update((solicitudes) => [solicitud, ...solicitudes]);
    this.agregarNotificacion({
      tipo: 'certificado',
      titulo: 'Nueva solicitud de certificado',
      mensaje: `Se registró una solicitud de certificado para ${ficha.nombre}.`,
      personaNombre: ficha.nombre,
      personaCedula: ficha.ciudadano.cedula,
      centroNombre: ficha.vacunas[0]?.centroNombre ?? ficha.ubicacion,
      prioridad: 'media',
      enlace: `/SRS/certificados/${id}`,
    });

    return this.solicitud(id);
  }

  /**
   * Autoriza o descarta una solicitud pendiente. Una solicitud descartada debe
   * llevar un motivo; la autorizada puede usar el motivo por defecto.
   */
  revisarSolicitud(
    id: string,
    decision: Extract<EstadoCertificado, 'autorizado' | 'descartado'>,
    motivo: string,
    revisor: string,
  ): boolean {
    const solicitud = this.solicitud(id);

    if (!solicitud || solicitud.estado !== 'solicitado') {
      return false;
    }

    const motivoLimpio = motivo.trim();
    if (decision === 'descartado' && !motivoLimpio) {
      return false;
    }

    const motivoFinal =
      motivoLimpio ||
      'Cumple con el esquema de inmunizaciones y la serología exigida para el certificado.';
    const fechaRevision = this.fechaHoy();

    this._solicitudes.update((solicitudes) =>
      solicitudes.map((actual) =>
        actual.id === id
          ? {
              ...actual,
              estado: decision,
              revisadoPor: revisor,
              fechaRevision,
              motivo: motivoFinal,
            }
          : actual,
      ),
    );

    this.agregarNotificacion({
      tipo: 'certificado',
      titulo:
        decision === 'autorizado'
          ? 'Solicitud de certificado autorizada'
          : 'Solicitud de certificado descartada',
      mensaje:
        decision === 'autorizado'
          ? `La solicitud de ${solicitud.nombreCiudadano} fue autorizada y está lista para emitirse.`
          : `La solicitud de ${solicitud.nombreCiudadano} fue descartada. Motivo: ${motivoFinal}`,
      personaNombre: solicitud.nombreCiudadano,
      personaCedula: solicitud.cedula,
      centroNombre: solicitud.ficha.vacunas[0]?.centroNombre ?? solicitud.ficha.ubicacion,
      prioridad: decision === 'descartado' ? 'alta' : 'media',
      enlace: `/SRS/certificados/${id}`,
    });

    return true;
  }

  /** Emite un certificado previamente autorizado. El envío por correo aún no existe. */
  emitirSolicitud(id: string, revisor: string): boolean {
    const solicitud = this.solicitud(id);

    if (!solicitud || solicitud.estado !== 'autorizado') {
      return false;
    }

    const fechaEmision = this.fechaHoy();

    this._solicitudes.update((solicitudes) =>
      solicitudes.map((actual) =>
        actual.id === id
          ? {
              ...actual,
              estado: 'emitido',
              revisadoPor: revisor || actual.revisadoPor,
              fechaEmision,
            }
          : actual,
      ),
    );

    this.agregarNotificacion({
      tipo: 'certificado',
      titulo: 'Certificado de salud emitido',
      mensaje: `El certificado de ${solicitud.nombreCiudadano} fue emitido. El envío por correo quedará disponible en una fase posterior.`,
      personaNombre: solicitud.nombreCiudadano,
      personaCedula: solicitud.cedula,
      centroNombre: solicitud.ficha.vacunas[0]?.centroNombre ?? solicitud.ficha.ubicacion,
      prioridad: 'baja',
      enlace: `/SRS/certificados/${id}`,
    });

    return true;
  }

  marcarNotificacionLeida(id: string): void {
    this._notificaciones.update((notificaciones) =>
      notificaciones.map((notificacion) =>
        notificacion.id === id ? { ...notificacion, leida: true } : notificacion,
      ),
    );
  }

  marcarTodasLeidas(): void {
    this._notificaciones.update((notificaciones) =>
      notificaciones.map((notificacion) =>
        notificacion.estadoId === this.estadoId ? { ...notificacion, leida: true } : notificacion,
      ),
    );
  }

  etiquetaEstadoCertificado(estado: EstadoCertificado): string {
    switch (estado) {
      case 'solicitado':
        return 'Pendiente';
      case 'autorizado':
        return 'Autorizado';
      case 'descartado':
        return 'Descartado';
      case 'emitido':
        return 'Emitido';
    }
  }

  etiquetaTipoNotificacion(tipo: TipoNotificacionSrs): string {
    switch (tipo) {
      case 'esavi':
        return 'ESAVI';
      case 'certificado':
        return 'Certificado';
      case 'expediente':
        return 'Expediente';
      case 'sistema':
        return 'Sistema';
    }
  }

  etiquetaPrioridad(prioridad: PrioridadNotificacionSrs): string {
    switch (prioridad) {
      case 'alta':
        return 'Alta';
      case 'media':
        return 'Media';
      case 'baja':
        return 'Baja';
    }
  }

  etiquetaSexo(sexo: string): string {
    if (sexo === 'F') {
      return 'Femenino';
    }
    if (sexo === 'M') {
      return 'Masculino';
    }
    return 'Otro';
  }

  etiquetaVigencia(estado: EstadoVigencia): string {
    return estado === 'vigente' ? 'Vigente' : 'Vencido';
  }

  etiquetaRequisito(estado: EstadoRequisito): string {
    switch (estado) {
      case 'vigente':
        return 'Vigente';
      case 'vencido':
        return 'Vencido';
      case 'incompleto':
        return 'Incompleto';
      case 'ausente':
        return 'Sin registro';
    }
  }

  private construirFicha(ciudadano: Ciudadano): FichaCiudadano {
    const hoy = this.fechaHoy();
    const vacunas = this.construirVacunas(ciudadano, hoy);
    const examenes = this.construirExamenes(ciudadano, hoy);
    const requisitos = this.construirRequisitos(vacunas, examenes);
    const requisitosCumplidos = requisitos.filter((requisito) => requisito.cumplido).length;
    const requisitosTotales = requisitos.length;

    return {
      ciudadano,
      nombre: this.datos.nombreCompleto(ciudadano),
      iniciales: this.iniciales(this.datos.nombreCompleto(ciudadano)),
      edad: this.datos.edad(ciudadano.nacimiento),
      sexo: this.etiquetaSexo(ciudadano.sexo),
      ubicacion: [
        this.datos.nombreEstado(ciudadano.estadoId),
        this.datos.nombreMunicipio(ciudadano.municipioId),
        this.datos.nombreParroquia(ciudadano.parroquiaId),
      ].join(' · '),
      correo: ciudadano.correo,
      telefono: ciudadano.telefono,
      vacunas,
      examenes,
      requisitos,
      requisitosCumplidos,
      requisitosTotales,
      porcentajeRequisitos:
        requisitosTotales > 0 ? Math.round((requisitosCumplidos / requisitosTotales) * 100) : 0,
      vacunasVencidas: vacunas.filter((vacuna) => vacuna.estado === 'vencido').length,
      examenesVencidos: examenes.filter((examen) => examen.estado === 'vencido').length,
      aptoCertificado: requisitos.every((requisito) => requisito.cumplido),
      lineaTiempo: this.construirLineaTiempo(ciudadano, vacunas, examenes),
    };
  }

  private construirVacunas(ciudadano: Ciudadano, hoy: string): readonly VacunaFicha[] {
    const catalogoVacunas = this.catalogos.vacunas();

    return ciudadano.vacunas
      .map<VacunaFicha>((vacuna) => {
        const catalogo = catalogoVacunas.find((item) => item.id === vacuna.vacunaId);
        const vencimiento =
          catalogo?.vigenciaMeses === null || !catalogo
            ? null
            : this.sumarMeses(vacuna.fecha, catalogo.vigenciaMeses);
        const estado: EstadoVigencia =
          vencimiento === null || vencimiento >= hoy ? 'vigente' : 'vencido';

        return {
          id: `${vacuna.vacunaId}-${vacuna.fecha}`,
          vacunaId: vacuna.vacunaId,
          nombre: catalogo?.nombre ?? vacuna.vacunaId,
          dosis: vacuna.dosis,
          dosisRequeridas: catalogo?.dosisRequeridas ?? vacuna.dosis,
          fecha: vacuna.fecha,
          lote: vacuna.lote,
          centroId: vacuna.centroId,
          centroNombre: this.datos.nombreCentro(vacuna.centroId),
          vencimiento,
          estado,
        };
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  private construirExamenes(ciudadano: Ciudadano, hoy: string): readonly ExamenFicha[] {
    const catalogoExamenes = this.catalogos.examenes();

    return ciudadano.examenes
      .map<ExamenFicha>((examen) => {
        const catalogo = catalogoExamenes.find((item) => item.id === examen.examenId);
        const meses = VIGENCIA_EXAMENES_MESES[examen.examenId] ?? 12;
        const vencimiento = this.sumarMeses(examen.fecha, meses);
        const estado: EstadoVigencia = vencimiento >= hoy ? 'vigente' : 'vencido';

        return {
          id: `${examen.examenId}-${examen.fecha}`,
          examenId: examen.examenId,
          nombre: catalogo?.nombre ?? examen.examenId,
          fecha: examen.fecha,
          resultado: examen.resultado,
          sensible: examen.sensible,
          vencimiento,
          estado,
        };
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  private construirRequisitos(
    vacunas: readonly VacunaFicha[],
    examenes: readonly ExamenFicha[],
  ): readonly RequisitoCertificado[] {
    const requisitosVacunas = this.catalogos
      .vacunas()
      .filter((vacuna) => vacuna.obligatoriaCertificado)
      .map<RequisitoCertificado>((vacuna) => {
        const aplicaciones = vacunas.filter((ficha) => ficha.vacunaId === vacuna.id);
        const ultima = aplicaciones[0] ?? null;
        const dosisAplicadas = aplicaciones.reduce(
          (maxima, aplicacion) => Math.max(maxima, aplicacion.dosis),
          0,
        );
        let estado: EstadoRequisito = 'ausente';
        let detalle = 'Sin dosis registradas.';

        if (ultima) {
          if (dosisAplicadas < vacuna.dosisRequeridas) {
            estado = 'incompleto';
            detalle = `${dosisAplicadas} de ${vacuna.dosisRequeridas} dosis · última aplicación ${this.fechaCorta(ultima.fecha)}.`;
          } else if (ultima.estado === 'vencido') {
            estado = 'vencido';
            detalle = `Esquema completo · última dosis ${this.fechaCorta(ultima.fecha)} · venció el ${this.fechaCorta(ultima.vencimiento ?? ultima.fecha)}.`;
          } else {
            estado = 'vigente';
            detalle =
              ultima.vencimiento === null
                ? `Esquema completo · última dosis ${this.fechaCorta(ultima.fecha)} · vigencia permanente.`
                : `Esquema completo · última dosis ${this.fechaCorta(ultima.fecha)} · vigente hasta ${this.fechaCorta(ultima.vencimiento)}.`;
          }
        }

        return {
          id: `vacuna-${vacuna.id}`,
          tipo: 'vacuna',
          etiqueta: vacuna.nombre,
          detalle,
          estado,
          cumplido: estado === 'vigente',
        };
      });

    const requisitosExamenes = EXAMENES_REQUERIDOS_CERTIFICADO.map<RequisitoCertificado>(
      (examenId) => {
        const catalogo = this.catalogos.examenes().find((item) => item.id === examenId);
        const aplicaciones = examenes.filter((examen) => examen.examenId === examenId);
        const ultimo = aplicaciones[0] ?? null;
        let estado: EstadoRequisito = 'ausente';
        let detalle = 'Sin examen registrado.';

        if (ultimo) {
          const noReactivo = ultimo.resultado.toLowerCase().includes('no reactivo');

          if (ultimo.estado === 'vencido') {
            estado = 'vencido';
            detalle = `${ultimo.resultado} · ${this.fechaCorta(ultimo.fecha)} · venció el ${this.fechaCorta(ultimo.vencimiento)}.`;
          } else if (!noReactivo) {
            estado = 'incompleto';
            detalle = `${ultimo.resultado} · ${this.fechaCorta(ultimo.fecha)} · requiere valoración médica.`;
          } else {
            estado = 'vigente';
            detalle = `${ultimo.resultado} · ${this.fechaCorta(ultimo.fecha)} · vigente hasta ${this.fechaCorta(ultimo.vencimiento)}.`;
          }
        }

        return {
          id: `examen-${examenId}`,
          tipo: 'examen',
          etiqueta: `${catalogo?.nombre ?? examenId} (no reactivo)`,
          detalle,
          estado,
          cumplido: estado === 'vigente' && Boolean(ultimo),
        };
      },
    );

    return [...requisitosVacunas, ...requisitosExamenes];
  }

  private construirLineaTiempo(
    ciudadano: Ciudadano,
    vacunas: readonly VacunaFicha[],
    examenes: readonly ExamenFicha[],
  ): readonly HitoLineaTiempo[] {
    const hitos: HitoLineaTiempo[] = [];

    for (const vacuna of vacunas) {
      hitos.push({
        id: `vacuna-${vacuna.id}`,
        fecha: vacuna.fecha,
        tipo: 'vacuna',
        titulo: vacuna.nombre,
        detalle: `Dosis ${vacuna.dosis} · ${vacuna.centroNombre} · lote ${vacuna.lote}`,
        tono: vacuna.estado === 'vigente' ? 'ok' : 'warn',
      });
    }

    for (const examen of examenes) {
      hitos.push({
        id: `examen-${examen.id}`,
        fecha: examen.fecha,
        tipo: 'examen',
        titulo: `Examen de ${examen.nombre}`,
        detalle: `${examen.resultado} · ${examen.estado === 'vigente' ? 'vigente' : 'vencido'}`,
        tono: examen.estado === 'vigente' ? 'ok' : 'warn',
      });
    }

    hitos.push({
      id: `perfil-${ciudadano.id}`,
      fecha: ciudadano.creadoEn,
      tipo: 'perfil',
      titulo: 'Apertura del expediente',
      detalle: 'Registro inicial del ciudadano en el sistema.',
      tono: 'info',
    });

    for (const solicitud of this._solicitudes().filter(
      (item) => item.ciudadanoId === ciudadano.id,
    )) {
      hitos.push({
        id: `certificado-${solicitud.id}-${solicitud.estado}`,
        fecha: solicitud.fechaEmision ?? solicitud.fechaRevision ?? solicitud.fechaSolicitud,
        tipo: 'certificado',
        titulo: `Certificado ${solicitud.codigo}`,
        detalle: `Estado: ${this.etiquetaEstadoCertificado(solicitud.estado)}.`,
        tono:
          solicitud.estado === 'descartado'
            ? 'warn'
            : solicitud.estado === 'solicitado'
              ? 'info'
              : 'ok',
      });
    }

    return hitos
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 8)
      .map((hito) => ({ ...hito }));
  }

  private agregarNotificacion(
    notificacion: Omit<NotificacionSrs, 'id' | 'fecha' | 'estadoId' | 'leida'>,
  ): void {
    const nueva: NotificacionSrs = {
      ...notificacion,
      id: this.generarId('notif'),
      fecha: new Date().toISOString(),
      estadoId: this.estadoId,
      leida: false,
    };

    this._notificaciones.update((notificaciones) => [nueva, ...notificaciones]);
  }

  private siguienteCodigoCertificado(): string {
    const anio = new Date().getFullYear();
    const prefijo = `CERT-GUA-${anio}-`;
    const existentes = this._solicitudes().filter((solicitud) =>
      solicitud.codigo.startsWith(prefijo),
    ).length;

    return `${prefijo}${String(existentes + 1).padStart(3, '0')}`;
  }

  private fechaHoy(): string {
    const hoy = new Date();
    return [
      hoy.getFullYear(),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      String(hoy.getDate()).padStart(2, '0'),
    ].join('-');
  }

  private sumarMeses(fecha: string, meses: number): string {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const objetivo = new Date(anio, mes - 1, 1);
    objetivo.setMonth(objetivo.getMonth() + meses);

    const ultimoDia = new Date(objetivo.getFullYear(), objetivo.getMonth() + 1, 0).getDate();
    objetivo.setDate(Math.min(dia, ultimoDia));

    return [
      objetivo.getFullYear(),
      String(objetivo.getMonth() + 1).padStart(2, '0'),
      String(objetivo.getDate()).padStart(2, '0'),
    ].join('-');
  }

  private fechaCorta(fecha: string): string {
    return fecha.split('-').reverse().join('/');
  }

  private aniosServicio(ingreso: string): number {
    const inicio = new Date(`${ingreso}T00:00:00`);
    const hoy = new Date();
    let anios = hoy.getFullYear() - inicio.getFullYear();
    const diferenciaMeses = hoy.getMonth() - inicio.getMonth();

    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < inicio.getDate())) {
      anios -= 1;
    }

    return Math.max(anios, 0);
  }

  private iniciales(nombre: string): string {
    const limpio = nombre.replace(
      /^(lic\.|dra\.|dr\.|enf\.|tsu|téc\.|tec\.|bioanalista|analista|ing\.)\s+/i,
      '',
    );
    const partes = limpio.split(/\s+/).filter(Boolean);

    return `${partes[0]?.[0] ?? ''}${partes[1]?.[0] ?? ''}`.toUpperCase();
  }

  private generarId(prefijo: string): string {
    return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }
}
