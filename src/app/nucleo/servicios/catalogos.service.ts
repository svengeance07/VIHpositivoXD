import { inject, Injectable, signal } from '@angular/core';

import {
  ESTADOS_CERTIFICADO,
  ESTADOS_LOTE,
  EXAMENES,
  GRADOS_INSTRUCCION,
  GRUPOS_ETNICOS,
  PROFESIONES,
  ROLES,
  TIPOS_EMPLEADO,
  TIPOS_ESTABLECIMIENTO,
  TIPOS_SANGRE,
  VACUNAS,
} from '../datos/catalogos';
import type { ItemCatalogo, RolSistema, VacunaCatalogo } from '../modelos/catalogo';
import type { EstadoCertificado, EstadoLote, TipoEmpleado } from '../modelos/enumeraciones';
import { ApiBackendService } from './api-backend.service';

/**
 * Acceso reactivo a los catálogos del sistema.
 *
 * Carga de forma asíncrona los catálogos reales desde el backend Fastify / MySQL
 * (`/api/catalogos/resumen`), manteniendo los datos iniciales como fallback
 * síncrono para garantizar que ningún componente falle durante el renderizado.
 */
@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private readonly apiBackend = inject(ApiBackendService, { optional: true });

  private readonly _roles = signal<readonly RolSistema[]>(ROLES);
  private readonly _tiposEmpleado =
    signal<readonly { id: TipoEmpleado; nombre: string }[]>(TIPOS_EMPLEADO);
  private readonly _estadosLote =
    signal<readonly { id: EstadoLote; nombre: string }[]>(ESTADOS_LOTE);
  private readonly _estadosCertificado =
    signal<readonly { id: EstadoCertificado; nombre: string }[]>(ESTADOS_CERTIFICADO);
  private readonly _vacunas = signal<readonly VacunaCatalogo[]>(VACUNAS);
  private readonly _profesiones = signal<readonly ItemCatalogo[]>(PROFESIONES);
  private readonly _examenes = signal<readonly ItemCatalogo[]>(EXAMENES);
  private readonly _gradosInstruccion = signal<readonly ItemCatalogo[]>(GRADOS_INSTRUCCION);
  private readonly _gruposEtnicos = signal<readonly ItemCatalogo[]>(GRUPOS_ETNICOS);
  private readonly _tiposEstablecimiento = signal<readonly ItemCatalogo[]>(TIPOS_ESTABLECIMIENTO);
  private readonly _tiposSangre = signal<readonly ItemCatalogo[]>(TIPOS_SANGRE);

  readonly roles = this._roles.asReadonly();
  readonly tiposEmpleado = this._tiposEmpleado.asReadonly();
  readonly estadosLote = this._estadosLote.asReadonly();
  readonly estadosCertificado = this._estadosCertificado.asReadonly();
  readonly vacunas = this._vacunas.asReadonly();
  readonly profesiones = this._profesiones.asReadonly();
  readonly examenes = this._examenes.asReadonly();
  readonly gradosInstruccion = this._gradosInstruccion.asReadonly();
  readonly gruposEtnicos = this._gruposEtnicos.asReadonly();
  readonly tiposEstablecimiento = this._tiposEstablecimiento.asReadonly();
  readonly tiposSangre = this._tiposSangre.asReadonly();

  constructor() {
    if (this.apiBackend && typeof window !== 'undefined') {
      void this.cargarDesdeBackend();
    }
  }

  private async cargarDesdeBackend(): Promise<void> {
    if (!this.apiBackend) return;
    try {
      const resumen = await this.apiBackend.getCatalogosResumen();
      if (!resumen) return;

      if (resumen.profesiones && resumen.profesiones.length > 0) {
        this._profesiones.set(
          resumen.profesiones.map((p) => ({
            id: String(p.id_profesion),
            nombre: p.nombre_profesion,
          })),
        );
      }

      if (resumen.etnias && resumen.etnias.length > 0) {
        this._gruposEtnicos.set(
          resumen.etnias.map((e) => ({
            id: String(e.id_etnia),
            nombre: e.nombre_etnia,
          })),
        );
      }

      if (resumen.tipos_sangre && resumen.tipos_sangre.length > 0) {
        this._tiposSangre.set(
          resumen.tipos_sangre.map((t) => ({
            id: String(t.id_tipo_sangre),
            nombre: t.nombre_tipo_sangre,
          })),
        );
      }

      if (resumen.vacunas && resumen.vacunas.length > 0) {
        this._vacunas.set(
          resumen.vacunas.map((v) => ({
            id: String(v.id_vacuna),
            nombre: v.nombre_vacuna,
            dosisRequeridas: v.cantidad_dosis,
            vigenciaMeses: 12,
            obligatoriaCertificado: true,
          })),
        );
      }

      if (resumen.examenes && resumen.examenes.length > 0) {
        this._examenes.set(
          resumen.examenes.map((ex) => ({
            id: String(ex.id_examen),
            nombre: ex.nombre_examen,
          })),
        );
      }
    } catch {
      // Silencioso: conserva los valores mock predeterminados si el backend no responde
    }
  }
}
