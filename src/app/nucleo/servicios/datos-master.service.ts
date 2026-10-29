import { computed, inject, Injectable, signal } from '@angular/core';

import {
  BUSQUEDAS,
  CENTROS,
  CIUDADANOS,
  ESTADOS,
  LOTES,
  MOVIMIENTOS,
  MUNICIPIOS,
  PARROQUIAS,
  PERSONAL,
  VACUNACION_SEMANA,
} from '../datos/master';
import type {
  AltaCentro,
  AltaEmpleado,
  AltaSubregion,
  BusquedaAuditada,
  CentroSalud,
  CentroVista,
  Ciudadano,
  Estado,
  FiltrosCiudadano,
  LoteVacuna,
  MovimientoSistema,
  Municipio,
  Parroquia,
  PersonalSalud,
  PersonalVista,
  SubregionVista,
  TipoMovimiento,
  VacunacionSemana,
} from '../modelos/master';
import { CatalogosService } from './catalogos.service';

const CLAVE_STORAGE_CENTROS = 'vih_centros_master_v1';
const CLAVE_STORAGE_PERSONAL = 'vih_personal_master_v1';

function cargarCentros(): readonly CentroSalud[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(CLAVE_STORAGE_CENTROS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch {
    // fallback
  }
  return CENTROS;
}

function guardarCentros(lista: readonly CentroSalud[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CLAVE_STORAGE_CENTROS, JSON.stringify(lista));
    }
  } catch {
    // ignorar cuotas
  }
}

function cargarPersonal(): readonly PersonalSalud[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(CLAVE_STORAGE_PERSONAL);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch {
    // fallback
  }
  return PERSONAL;
}

function guardarPersonal(lista: readonly PersonalSalud[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CLAVE_STORAGE_PERSONAL, JSON.stringify(lista));
    }
  } catch {
    // ignorar cuotas
  }
}

/**
 * Acceso a los datos de las vistas del master.
 *
 * Todo vive en signals para que las pantallas reaccionen sin `zone.js`. Las altas
 * modifican el signal correspondiente y, cuando exista API, estos métodos pasan a
 * llamar al backend sin cambiar los componentes.
 */
@Injectable({ providedIn: 'root' })
export class DatosMasterService {
  private readonly catalogos = inject(CatalogosService);

  private readonly _estados = signal<readonly Estado[]>(ESTADOS);
  private readonly _municipios = signal<readonly Municipio[]>(MUNICIPIOS);
  private readonly _parroquias = signal<readonly Parroquia[]>(PARROQUIAS);
  private readonly _centros = signal<readonly CentroSalud[]>(cargarCentros());
  private readonly _personal = signal<readonly PersonalSalud[]>(cargarPersonal());
  private readonly _ciudadanos = signal<readonly Ciudadano[]>(CIUDADANOS);
  private readonly _lotes = signal<readonly LoteVacuna[]>(LOTES);
  private readonly _movimientos = signal<readonly MovimientoSistema[]>(MOVIMIENTOS);
  private readonly _busquedas = signal<readonly BusquedaAuditada[]>(BUSQUEDAS);
  private readonly _vacunaciones = signal<readonly VacunacionSemana[]>(VACUNACION_SEMANA);

  readonly estados = this._estados.asReadonly();
  readonly municipios = this._municipios.asReadonly();
  readonly parroquias = this._parroquias.asReadonly();
  readonly centros = computed(() => this._centros().filter((centro) => centro.activo));
  readonly lotes = this._lotes.asReadonly();
  readonly ciudadanos = this._ciudadanos.asReadonly();

  readonly subregiones = computed<readonly SubregionVista[]>(() => {
    const centros = this._centros();
    const personal = this._personal();

    return centros
      .filter((centro) => centro.tipo === 3 && centro.activo)
      .map((centro) => ({
        centro,
        estado: this.buscarEstado(centro.estadoId),
        jefe: personal.find((persona) => persona.id === centro.encargadoId) ?? null,
        empleados: personal.filter((persona) => persona.centroId === centro.id && persona.activo)
          .length,
        centros: centros.filter(
          (candidato) =>
            candidato.tipo === 2 && candidato.estadoId === centro.estadoId && candidato.activo,
        ).length,
      }));
  });

  readonly centrosVista = computed<readonly CentroVista[]>(() => {
    const personal = this._personal();

    return this._centros()
      .filter((centro) => centro.tipo === 2 && centro.activo)
      .map((centro) => ({
        centro,
        estado: this.buscarEstado(centro.estadoId),
        municipio: this.buscarMunicipio(centro.municipioId),
        parroquia: this.buscarParroquia(centro.parroquiaId),
        jefe: personal.find((persona) => persona.id === centro.encargadoId) ?? null,
        empleados: personal.filter((persona) => persona.centroId === centro.id && persona.activo)
          .length,
      }));
  });

  readonly personalVista = computed<readonly PersonalVista[]>(() => {
    const centros = this._centros();

    return this._personal().map((personal) => {
      const centro = centros.find((candidato) => candidato.id === personal.centroId) ?? null;

      return {
        personal,
        centro,
        estado: centro ? this.buscarEstado(centro.estadoId) : null,
        municipio: centro ? this.buscarMunicipio(centro.municipioId) : null,
        parroquia: centro ? this.buscarParroquia(centro.parroquiaId) : null,
        esJefe: centro?.encargadoId === personal.id,
        profesion: this.nombreProfesion(personal.profesionId),
      };
    });
  });

  readonly movimientos = computed<readonly MovimientoSistema[]>(() =>
    [...this._movimientos()].sort((a, b) => b.fecha.localeCompare(a.fecha)),
  );

  readonly busquedas = computed<readonly BusquedaAuditada[]>(() =>
    [...this._busquedas()].sort((a, b) => b.fecha.localeCompare(a.fecha)),
  );

  readonly vacunacionesSemana = computed<readonly VacunacionSemana[]>(() =>
    [...this._vacunaciones()].sort((a, b) => b.total - a.total),
  );

  readonly resumen = computed(() => {
    const ciudadanos = this._ciudadanos();
    const centros = this._centros().filter((centro) => centro.tipo === 2 && centro.activo);
    const personal = this._personal().filter((persona) => persona.activo);
    const lotes = this._lotes();

    return {
      ciudadanos: ciudadanos.length,
      centros: centros.length,
      personal: personal.length,
      lotesEnCamino: lotes.filter((lote) => lote.estado === 'en_camino').length,
      lotesReportados: lotes.filter((lote) => lote.estado === 'reportado').length,
      vacunacionesSemana: this._vacunaciones().reduce((total, fila) => total + fila.total, 0),
    };
  });

  /** Últimos lotes, del más reciente al más antiguo. */
  readonly lotesRecientes = computed<readonly LoteVacuna[]>(() =>
    [...this._lotes()].sort((a, b) => b.fechaEnvio.localeCompare(a.fechaEnvio)).slice(0, 5),
  );

  get estadoActual(): readonly Estado[] {
    return this._estados();
  }

  estado(id: string): Estado | null {
    return this.buscarEstado(id);
  }

  municipio(id: string): Municipio | null {
    return this.buscarMunicipio(id);
  }

  parroquia(id: string): Parroquia | null {
    return this.buscarParroquia(id);
  }

  centro(id: string): CentroSalud | null {
    return this._centros().find((centro) => centro.id === id) ?? null;
  }

  personal(id: string): PersonalSalud | null {
    return this._personal().find((persona) => persona.id === id) ?? null;
  }

  ciudadano(id: string): Ciudadano | null {
    return this._ciudadanos().find((ciudadano) => ciudadano.id === id) ?? null;
  }

  lote(id: string): LoteVacuna | null {
    return this._lotes().find((lote) => lote.id === id) ?? null;
  }

  jefeDeCentro(centroId: string): PersonalSalud | null {
    const centro = this.centro(centroId);
    return centro ? this.personal(centro.encargadoId) : null;
  }

  personalDeCentro(centroId: string): readonly PersonalSalud[] {
    return this._personal().filter((persona) => persona.centroId === centroId && persona.activo);
  }

  centrosDeEstado(estadoId: string): readonly CentroVista[] {
    return this.centrosVista().filter((fila) => fila.centro.estadoId === estadoId);
  }

  municipiosDeEstado(estadoId: string): readonly Municipio[] {
    return this._municipios().filter((municipio) => municipio.estadoId === estadoId);
  }

  parroquiasDeMunicipio(municipioId: string): readonly Parroquia[] {
    return this._parroquias().filter((parroquia) => parroquia.municipioId === municipioId);
  }

  lotesDeCentro(centroId: string): readonly LoteVacuna[] {
    return this._lotes().filter((lote) => lote.destinoCentroId === centroId);
  }

  nombreEstado(id: string): string {
    return this.buscarEstado(id)?.nombre ?? '—';
  }

  nombreMunicipio(id: string): string {
    return this.buscarMunicipio(id)?.nombre ?? '—';
  }

  nombreParroquia(id: string): string {
    return this.buscarParroquia(id)?.nombre ?? '—';
  }

  nombreCentro(id: string): string {
    return this.centro(id)?.nombre ?? '—';
  }

  nombreVacuna(id: string): string {
    return this.catalogos.vacunas().find((vacuna) => vacuna.id === id)?.nombre ?? id;
  }

  nombreExamen(id: string): string {
    return this.catalogos.examenes().find((examen) => examen.id === id)?.nombre ?? id;
  }

  nombreEtnia(id: string | null): string {
    if (!id) {
      return 'No declarada';
    }

    return this.catalogos.gruposEtnicos().find((etnia) => etnia.id === id)?.nombre ?? id;
  }

  nombreProfesion(id: string): string {
    return this.catalogos.profesiones().find((profesion) => profesion.id === id)?.nombre ?? id;
  }

  edad(nacimiento: string): number {
    const fecha = new Date(nacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad -= 1;
    }

    return edad;
  }

  nombreCompleto(ciudadano: Ciudadano): string {
    return [ciudadano.nombre1, ciudadano.nombre2, ciudadano.apellido1, ciudadano.apellido2]
      .filter(Boolean)
      .join(' ');
  }

  buscarCiudadanos(filtros: FiltrosCiudadano): readonly Ciudadano[] {
    const nombres = this.normalizar(filtros.nombres);
    const apellidos = this.normalizar(filtros.apellidos);
    const cedula = this.normalizar(filtros.cedula);
    const edadMin = filtros.edadMin ? Number(filtros.edadMin) : null;
    const edadMax = filtros.edadMax ? Number(filtros.edadMax) : null;

    return this._ciudadanos().filter((ciudadano) => {
      const nombre = this.normalizar(
        [ciudadano.nombre1, ciudadano.nombre2].filter(Boolean).join(' '),
      );
      const apellido = this.normalizar(
        [ciudadano.apellido1, ciudadano.apellido2].filter(Boolean).join(' '),
      );
      const edad = this.edad(ciudadano.nacimiento);

      if (nombres && !nombre.includes(nombres)) {
        return false;
      }
      if (apellidos && !apellido.includes(apellidos)) {
        return false;
      }
      if (cedula && !this.normalizar(ciudadano.cedula).includes(cedula)) {
        return false;
      }
      if (filtros.vacunaId && !ciudadano.vacunas.some((v) => v.vacunaId === filtros.vacunaId)) {
        return false;
      }
      if (edadMin !== null && edad < edadMin) {
        return false;
      }
      if (edadMax !== null && edad > edadMax) {
        return false;
      }
      if (
        filtros.examenId &&
        !ciudadano.examenes.some((examen) => examen.examenId === filtros.examenId)
      ) {
        return false;
      }
      if (filtros.creadoDesde && ciudadano.creadoEn < filtros.creadoDesde) {
        return false;
      }
      if (filtros.creadoHasta && ciudadano.creadoEn > filtros.creadoHasta) {
        return false;
      }
      if (filtros.sexo && ciudadano.sexo !== filtros.sexo) {
        return false;
      }
      if (filtros.etniaId && ciudadano.etniaId !== filtros.etniaId) {
        return false;
      }
      if (filtros.estadoId && ciudadano.estadoId !== filtros.estadoId) {
        return false;
      }
      if (filtros.municipioId && ciudadano.municipioId !== filtros.municipioId) {
        return false;
      }
      if (filtros.parroquiaId && ciudadano.parroquiaId !== filtros.parroquiaId) {
        return false;
      }

      return true;
    });
  }

  registrarBusqueda(filtros: string, resultados: number): void {
    const nueva: BusquedaAuditada = {
      id: this.generarId('bus'),
      fecha: new Date().toISOString(),
      usuario: 'master',
      rol: 'Master',
      filtros,
      resultados,
      origen: 'Búsqueda global',
    };

    this._busquedas.update((busquedas) => [nueva, ...busquedas]);
  }

  crearSubregion(datos: AltaSubregion): CentroSalud | null {
    const municipio = this._municipios().find((fila) => fila.estadoId === datos.estadoId);
    const parroquia = municipio
      ? this._parroquias().find((fila) => fila.municipioId === municipio.id)
      : null;

    if (!municipio || !parroquia) {
      return null;
    }

    if (
      this._centros().some(
        (centro) => centro.tipo === 3 && centro.estadoId === datos.estadoId && centro.activo,
      )
    ) {
      return null;
    }

    const jefeId = this.generarId('p');
    const centroId = this.generarId('srs');
    const jefe: PersonalSalud = {
      id: jefeId,
      nombre: datos.jefeNombre,
      cedula: datos.jefeCedula,
      correo: datos.jefeCorreo,
      telefono: '—',
      profesionId: 'medico-cirujano',
      tipoCuenta: 3,
      centroId,
      idProfesional: `MPPS-${datos.jefeCedula.slice(-5)}`,
      ingreso: new Date().toISOString().slice(0, 10),
      activo: true,
    };
    const centro: CentroSalud = {
      id: centroId,
      codigo: `SRS-${datos.estadoId.slice(0, 3).toUpperCase()}-${this._centros().length + 1}`,
      nombre: datos.nombre,
      tipo: 3,
      estadoId: datos.estadoId,
      municipioId: municipio.id,
      parroquiaId: parroquia.id,
      encargadoId: jefeId,
      telefono: '—',
      direccion: 'Por completar',
      activo: true,
    };

    this._personal.update((personal) => {
      const actual = [...personal, jefe];
      guardarPersonal(actual);
      return actual;
    });
    this._centros.update((centros) => {
      const actual = [...centros, centro];
      guardarCentros(actual);
      return actual;
    });
    this.registrarMovimiento(
      'creacion',
      'Centros',
      `Dio de alta la subregión ${datos.nombre}.`,
      datos.nombre,
    );

    return centro;
  }

  crearCentro(datos: AltaCentro): CentroSalud | null {
    const municipio = this.buscarMunicipio(datos.municipioId);
    const parroquia = this.buscarParroquia(datos.parroquiaId);

    if (
      !municipio ||
      !parroquia ||
      municipio.estadoId !== datos.estadoId ||
      parroquia.municipioId !== datos.municipioId
    ) {
      return null;
    }

    const jefeId = this.generarId('p');
    const centroId = this.generarId('centro');
    const jefe: PersonalSalud = {
      id: jefeId,
      nombre: datos.jefeNombre,
      cedula: datos.jefeCedula,
      correo: datos.jefeCorreo,
      telefono: '—',
      profesionId: 'medico-cirujano',
      tipoCuenta: 2,
      centroId,
      idProfesional: `MPPS-${datos.jefeCedula.slice(-5)}`,
      ingreso: new Date().toISOString().slice(0, 10),
      activo: true,
    };
    const centro: CentroSalud = {
      id: centroId,
      codigo: datos.codigo,
      nombre: datos.nombre,
      tipo: 2,
      estadoId: datos.estadoId,
      municipioId: datos.municipioId,
      parroquiaId: datos.parroquiaId,
      encargadoId: jefeId,
      telefono: '—',
      direccion: 'Por completar',
      activo: true,
    };

    this._personal.update((personal) => {
      const actual = [...personal, jefe];
      guardarPersonal(actual);
      return actual;
    });
    this._centros.update((centros) => {
      const actual = [...centros, centro];
      guardarCentros(actual);
      return actual;
    });
    this.registrarMovimiento(
      'creacion',
      'Centros',
      `Dio de alta el centro ${datos.nombre}.`,
      datos.nombre,
    );

    return centro;
  }

  crearEmpleado(datos: AltaEmpleado): PersonalSalud | null {
    const centro = this.centro(datos.centroId);

    if (!centro) {
      return null;
    }

    const empleado: PersonalSalud = {
      id: this.generarId('p'),
      nombre: datos.nombre,
      cedula: datos.cedula,
      correo: datos.correo,
      telefono: datos.telefono,
      profesionId: datos.profesionId,
      tipoCuenta: centro.tipo,
      centroId: centro.id,
      idProfesional: `MPPS-${datos.cedula.slice(-5)}`,
      ingreso: new Date().toISOString().slice(0, 10),
      activo: true,
    };

    this._personal.update((personal) => {
      const actual = [...personal, empleado];
      guardarPersonal(actual);
      return actual;
    });

    if (datos.tipo === 'jefe') {
      this._centros.update((centros) => {
        const actual = centros.map((candidato) =>
          candidato.id === centro.id ? { ...candidato, encargadoId: empleado.id } : candidato,
        );
        guardarCentros(actual);
        return actual;
      });
    }

    this.registrarMovimiento(
      'creacion',
      'Personal',
      `Registró a ${datos.nombre} en ${centro.nombre}.`,
      centro.nombre,
    );

    return empleado;
  }

  /** Reinicia centros y personal al catálogo original (útil para pruebas y desarrollo). */
  limpiarAlmacenamiento(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(CLAVE_STORAGE_CENTROS);
        localStorage.removeItem(CLAVE_STORAGE_PERSONAL);
      }
    } catch {
      // ignorar
    }
    this._centros.set(CENTROS);
    this._personal.set(PERSONAL);
  }

  private registrarMovimiento(
    tipo: TipoMovimiento,
    modulo: string,
    detalle: string,
    entidad: string,
  ): void {
    const movimiento: MovimientoSistema = {
      id: this.generarId('mov'),
      fecha: new Date().toISOString(),
      actor: 'master',
      rol: 'Master',
      tipo,
      modulo,
      detalle,
      entidad,
    };

    this._movimientos.update((movimientos) => [movimiento, ...movimientos]);
  }

  private buscarEstado(id: string): Estado | null {
    return this._estados().find((estado) => estado.id === id) ?? null;
  }

  private buscarMunicipio(id: string): Municipio | null {
    return this._municipios().find((municipio) => municipio.id === id) ?? null;
  }

  private buscarParroquia(id: string): Parroquia | null {
    return this._parroquias().find((parroquia) => parroquia.id === id) ?? null;
  }

  private normalizar(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private generarId(prefijo: string): string {
    return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }
}
