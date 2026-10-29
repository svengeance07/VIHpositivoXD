import { Injectable, signal } from '@angular/core';

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

/**
 * Acceso de solo lectura a los catálogos.
 *
 * Las vistas piden los catálogos aquí; los arrays de `nucleo/datos` no se importan
 * directamente. Cuando exista backend, este servicio cambia su implementación y las
 * vistas no se tocan.
 */
@Injectable({ providedIn: 'root' })
export class CatalogosService {
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
}
