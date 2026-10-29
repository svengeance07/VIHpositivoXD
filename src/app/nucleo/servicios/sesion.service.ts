import { computed, Injectable, signal } from '@angular/core';

import { CUENTAS_ACCESO } from '../datos/cuentas-acceso';
import type {
  CuentaAcceso,
  PerfilAcceso,
  RolInterno,
  SesionActiva,
} from '../modelos/cuenta-acceso';

const CLAVE_STORAGE_CUENTAS = 'vih_cuentas_acceso_v1';

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
  return CUENTAS_ACCESO.map((c) => ({ ...c, perfiles: [...c.perfiles] }));
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
 * Sin backend: valida contra el array de cuentas de prueba, persiste las cuentas en
 * localStorage y mantiene la sesión en memoria. Al existir API, solo cambia la implementación
 * de los métodos de validación.
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
   * Obtiene la lista actualizada de perfiles asociados a una cuenta/entidad.
   */
  obtenerPerfilesDeCuenta(cuentaId: string): readonly PerfilAcceso[] {
    const cuenta = this._cuentas().find((c) => c.id === cuentaId);
    return cuenta?.perfiles ?? [];
  }

  /**
   * Registra un nuevo perfil de enfermero en el centro de salud para permitir su inicio de sesión.
   */
  registrarPerfilEnCentro(
    centroId: string,
    perfil: { id: string; nombre: string; tipo: 'trabajador'; correo: string; clave: string },
  ): void {
    const correoNorm = this.normalizar(perfil.correo);
    this._cuentas.update((lista) => {
      const actualizadas = lista.map((cuenta) => {
        if (cuenta.id === centroId) {
          const yaExiste = cuenta.perfiles.some((p) => this.normalizar(p.correo) === correoNorm);
          const perfilesActualizados = yaExiste
            ? cuenta.perfiles.map((p) =>
                this.normalizar(p.correo) === correoNorm ? { ...p, ...perfil } : p,
              )
            : [...cuenta.perfiles, perfil];

          return { ...cuenta, perfiles: perfilesActualizados };
        }
        return cuenta;
      });
      guardarCuentas(actualizadas);
      return actualizadas;
    });
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

  validarPerfil(
    cuenta: CuentaAcceso,
    perfilId: string,
    correo: string,
    clave: string,
  ): PerfilAcceso | null {
    const correoNormalizado = this.normalizar(correo);
    const cuentaActual = this._cuentas().find((c) => c.id === cuenta.id) ?? cuenta;
    const perfil = cuentaActual.perfiles.find(
      (candidato) =>
        candidato.id === perfilId &&
        this.normalizar(candidato.correo) === correoNormalizado &&
        candidato.clave === clave.trim(),
    );

    return perfil ?? null;
  }

  entrar(cuenta: CuentaAcceso, perfil: PerfilAcceso | null): SesionActiva {
    const sesion: SesionActiva = {
      rol: cuenta.rol,
      nombre: perfil?.nombre ?? cuenta.nombre,
      entidad: perfil ? cuenta.nombre : null,
      nombreUsuario: perfil ? null : (cuenta.nombreUsuario ?? null),
      perfil: perfil ? { id: perfil.id, nombre: perfil.nombre, tipo: perfil.tipo } : null,
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
