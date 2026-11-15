import { computed, inject, Injectable, signal } from '@angular/core';

import { CUENTAS_ACCESO } from '../datos/cuentas-acceso';
import type { CuentaAcceso, RolInterno, SesionActiva } from '../modelos/cuenta-acceso';
import { ApiBackendService } from './api-backend.service';

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
 * Servicio de sesión.
 *
 * Se conecta al backend real mediante `ApiBackendService` (/api/auth/login, /api/auth/me)
 * utilizando cookies HttpOnly (`sv_access_token`).
 * Si el backend no está disponible o para pruebas unitarias aisladas, cuenta con fallback
 * seguro al almacenamiento local y catálogo de cuentas simuladas.
 */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly apiBackend = inject(ApiBackendService, { optional: true });
  private readonly _cuentas = signal<CuentaAcceso[]>(cargarCuentas());
  private readonly _sesion = signal<SesionActiva | null>(null);

  readonly sesion = this._sesion.asReadonly();
  readonly autenticado = computed(() => this._sesion() !== null);
  /** Solo para el panel de credenciales de prueba en desarrollo. */
  readonly cuentasDemo = computed(() => this._cuentas());

  constructor() {
    // Intentar restaurar sesión activa si hay cookie en el navegador
    if (this.apiBackend && typeof window !== 'undefined') {
      void this.restaurarSesion();
    }
  }

  /**
   * Inicia sesión autenticando primero contra el backend Fastify / Argon2id.
   * Si el backend valida con éxito, establece la sesión reactiva.
   * Si no hay conexión o no existe en backend, recurre al almacén simulado como fallback.
   */
  async iniciarSesion(
    rol: RolInterno,
    correo: string,
    clave: string,
  ): Promise<{ ok: boolean; error?: string }> {
    if (this.apiBackend) {
      try {
        const user = await this.apiBackend.login(correo, clave);

        const rolBackendValido =
          (rol === 1 && user.tipo_usuario === 'master') ||
          (rol === 2 && user.tipo_usuario === 'centro') ||
          (rol === 3 && user.tipo_usuario === 'subregion');

        if (!rolBackendValido) {
          await this.apiBackend.logout().catch(() => {});
          return {
            ok: false,
            error: 'La cuenta no corresponde al tipo de acceso institucional seleccionado.',
          };
        }

        const nombreCompleto = user.autoridad
          ? `${user.autoridad.primer_nombre} ${user.autoridad.primer_apellido}`
          : user.tipo_usuario === 'master'
            ? 'Administrador Master'
            : user.correo_usuario;

        const entidad =
          user.centro_salud?.nombre_centro ??
          (user.subregion ? `Subregión de Salud (Estado #${user.estado_id})` : null);

        const centroId = user.id_centro
          ? String(user.id_centro)
          : user.id_subregion
            ? String(user.id_subregion)
            : null;

        const sesion: SesionActiva = {
          id: String(user.id_usuarios),
          rol,
          nombre: nombreCompleto,
          correo: user.correo_usuario,
          entidad,
          centroId,
          nombreUsuario: user.correo_usuario,
        };

        this._sesion.set(sesion);
        return { ok: true };
      } catch (err: unknown) {
        // Si el backend rechazó explícitamente las credenciales (401 o 400), no fallback a mock
        const isHttpError = err && typeof err === 'object' && 'status' in err;
        if (isHttpError) {
          const status = (err as { status: number }).status;
          if (status === 401) {
            return {
              ok: false,
              error: 'El correo electrónico o la contraseña son incorrectos.',
            };
          }
          if (status === 429) {
            return {
              ok: false,
              error: 'Demasiados intentos fallidos. Por favor, espera un minuto.',
            };
          }
        }
      }
    }

    // Fallback simulado (offline o entorno de prueba)
    const cuentaLocal = this.validarCuenta(rol, correo, clave);
    if (cuentaLocal) {
      this.entrar(cuentaLocal);
      return { ok: true };
    }

    return {
      ok: false,
      error: 'El correo o la contraseña no corresponden a este tipo de cuenta.',
    };
  }

  /**
   * Restaura la sesión activa desde la cookie HttpOnly del backend.
   */
  async restaurarSesion(): Promise<boolean> {
    if (!this.apiBackend) return false;

    try {
      const user = await this.apiBackend.me();
      if (!user) return false;

      let rol: RolInterno = 1;
      if (user.tipo_usuario === 'centro') rol = 2;
      else if (user.tipo_usuario === 'subregion') rol = 3;

      const nombreCompleto = user.autoridad
        ? `${user.autoridad.primer_nombre} ${user.autoridad.primer_apellido}`
        : user.tipo_usuario === 'master'
          ? 'Administrador Master'
          : user.correo_usuario;

      const entidad =
        user.centro_salud?.nombre_centro ??
        (user.subregion ? `Subregión de Salud (Estado #${user.estado_id})` : null);

      const centroId = user.id_centro
        ? String(user.id_centro)
        : user.id_subregion
          ? String(user.id_subregion)
          : null;

      const sesion: SesionActiva = {
        id: String(user.id_usuarios),
        rol,
        nombre: nombreCompleto,
        correo: user.correo_usuario,
        entidad,
        centroId,
        nombreUsuario: user.correo_usuario,
      };

      this._sesion.set(sesion);
      return true;
    } catch {
      return false;
    }
  }

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
    if (this.apiBackend) {
      void this.apiBackend.logout().catch(() => {});
    }
  }

  private normalizar(valor: string): string {
    return valor.trim().toLowerCase();
  }
}
