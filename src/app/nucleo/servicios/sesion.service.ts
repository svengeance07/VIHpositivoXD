import { computed, Injectable, signal } from '@angular/core';

import { CUENTAS_ACCESO } from '../datos/cuentas-acceso';
import type {
  CuentaAcceso,
  PerfilAcceso,
  RolInterno,
  SesionActiva,
} from '../modelos/cuenta-acceso';

/**
 * Sesión simulada.
 *
 * Sin backend: valida contra el array de cuentas de prueba y guarda la sesión en
 * memoria. Al existir API, solo cambia la implementación de los métodos de validación.
 */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly cuentas = CUENTAS_ACCESO;
  private readonly _sesion = signal<SesionActiva | null>(null);

  readonly sesion = this._sesion.asReadonly();
  readonly autenticado = computed(() => this._sesion() !== null);
  /** Solo para el panel de credenciales de prueba en desarrollo. */
  readonly cuentasDemo = this.cuentas;

  validarCuenta(rol: RolInterno, correo: string, clave: string): CuentaAcceso | null {
    const correoNormalizado = this.normalizar(correo);
    const cuenta = this.cuentas.find(
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
    const perfil = cuenta.perfiles.find(
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
