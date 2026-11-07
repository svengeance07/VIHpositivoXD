import { computed, Injectable, signal } from '@angular/core';

import { CUENTAS_ACCESO } from '../datos/cuentas-acceso';
import type { CuentaAcceso, RolInterno, SesionActiva } from '../modelos/cuenta-acceso';

const CLAVE_STORAGE_CUENTAS = 'vih_cuentas_acceso_v2';

function cargarCuentas(): CuentaAcceso[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(CLAVE_STORAGE_CUENTAS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch {
    // fallback a catálogo inicial
  }
  return CUENTAS_ACCESO.map((c) => ({ ...c }));
}

function guardarCuentas(cuentas: CuentaAcceso[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CLAVE_STORAGE_CUENTAS, JSON.stringify(cuentas));
    }
  } catch {
    // ignorar cuotas de almacenamiento
  }
}

/**
 * Sesión simulada.
 *
 * Sin backend: valida directamente las credenciales de cada usuario (Master, Jefe de Centro
 * o Jefe de Subregión), persiste las cuentas en localStorage y mantiene la sesión en memoria.
 */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly _cuentas = signal<CuentaAcceso[]>(cargarCuentas());
  private readonly _sesion = signal<SesionActiva | null>(null);

  readonly sesion = this._sesion.asReadonly();
  readonly autenticado = computed(() => this._sesion() !== null);
  /** Solo para el panel de credenciales de prueba en desarrollo. */
  readonly cuentasDemo = computed(() => this._cuentas());

  /**
   * Registra o actualiza la cuenta directa del jefe encargado de un centro o subregión.
   */
  registrarCuentaCentro(
    centro: { id: string; nombre: string; codigo?: string; rol?: RolInterno },
    jefe: { id: string; nombre: string; correo: string; clave?: string },
  ): void {
    const rolCuenta = centro.rol ?? 2;
    const correoNormalizado = this.normalizar(jefe.correo);
    const claveAcceso = jefe.clave?.trim() || 'jefe123';

    this._cuentas.update((lista) => {
      const nuevaCuenta: CuentaAcceso = {
        id: jefe.id,
        rol: rolCuenta,
        nombre: jefe.nombre,
        entidad: centro.nombre,
        centroId: centro.id,
        correo: correoNormalizado,
        clave: claveAcceso,
      };

      const indiceExistente = lista.findIndex(
        (c) => c.centroId === centro.id || this.normalizar(c.correo) === correoNormalizado,
      );

      const actualizadas =
        indiceExistente >= 0
          ? lista.map((c, idx) => (idx === indiceExistente ? nuevaCuenta : c))
          : [...lista, nuevaCuenta];

      guardarCuentas(actualizadas);
      return actualizadas;
    });
  }

  /** Reinicia el catálogo de cuentas de acceso a los valores iniciales de prueba. */
  limpiarAlmacenamiento(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(CLAVE_STORAGE_CUENTAS);
      }
    } catch {
      // ignorar
    }
    this._cuentas.set(CUENTAS_ACCESO.map((c) => ({ ...c })));
  }

  validarCuenta(rol: RolInterno, correo: string, clave: string): CuentaAcceso | null {
    const correoNormalizado = this.normalizar(correo);
    const cuenta = this._cuentas().find(
      (candidata) =>
        candidata.rol === rol &&
        this.normalizar(candidata.correo) === correoNormalizado &&
        candidata.clave === clave.trim(),
    );

    return cuenta ?? null;
  }

  entrar(cuenta: CuentaAcceso): SesionActiva {
    const sesion: SesionActiva = {
      id: cuenta.id,
      rol: cuenta.rol,
      nombre: cuenta.nombre,
      correo: cuenta.correo,
      entidad: cuenta.entidad ?? null,
      centroId: cuenta.centroId ?? null,
      nombreUsuario: cuenta.nombreUsuario ?? null,
    };

    this._sesion.set(sesion);
    return sesion;
  }

  salir(): void {
    this._sesion.set(null);
  }

  private normalizar(valor: string): string {
    return valor.trim().toLowerCase();
  }
}
