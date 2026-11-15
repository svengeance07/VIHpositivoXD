import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface BackendUser {
  readonly id_usuarios: number;
  readonly correo_usuario: string;
  readonly tipo_usuario: 'master' | 'subregion' | 'centro';
  readonly id_autoridades: number | null;
  readonly id_centro: number | null;
  readonly id_subregion: number | null;
  readonly estado_id: number | null;
  readonly autoridad?: {
    readonly id_autoridades: number;
    readonly primer_nombre: string;
    readonly segundo_nombre: string;
    readonly primer_apellido: string;
    readonly segundo_apellido: string;
    readonly c_i: number;
    readonly n_impre: number;
    readonly domicilio: string | null;
    readonly telefono: string;
    readonly profesion_id: number | null;
    readonly nombre_profesion: string | null;
  } | null;
  readonly centro_salud?: {
    readonly id_centro: number;
    readonly nombre_centro: string;
    readonly ubicacion_centro: string;
    readonly codigo_centro: string;
    readonly estado_id: number | null;
  } | null;
  readonly subregion?: {
    readonly id_subregion: number;
    readonly ubicacion: string;
    readonly estado_id: number | null;
  } | null;
}

export interface BackendAuthResponse {
  readonly ok: boolean;
  readonly data: {
    readonly user: BackendUser;
  };
}

export interface BackendConsultaCertificadoResponse {
  readonly ok: boolean;
  readonly data: {
    readonly ciudadano: {
      readonly id_ciudadano: number;
      readonly primer_nombre: string;
      readonly segundo_nombre: string | null;
      readonly primer_apellido: string;
      readonly segundo_apellido: string | null;
      readonly c_i: number;
      readonly fecha_nacimiento: string;
      readonly sexo: string;
      readonly tipo_sangre: string;
      readonly domicilio?: string | null;
      readonly telefono_celular?: string | null;
      readonly correo_electronico?: string | null;
    };
    readonly certificados: Array<{
      readonly valido: boolean;
      readonly motivo: string;
      readonly certificado: {
        readonly id_certificado: number;
        readonly fecha_emision: string;
        readonly estatus: string;
        readonly nombre_examen?: string | null;
        readonly total_inmunizaciones_registradas: number;
      };
    }>;
    readonly inmunizaciones: Array<{
      readonly id_inmunizacion: number;
      readonly numero_dosis: number;
      readonly fecha_aplicacion: string;
      readonly numero_lote: string;
      readonly vacuna: {
        readonly id_vacuna: number;
        readonly nombre_vacuna: string;
        readonly cantidad_dosis: number;
      };
      readonly centro_salud?: {
        readonly id_centro: number;
        readonly nombre_centro: string;
        readonly codigo_centro: string;
      } | null;
    }>;
  };
}

export interface BackendCatalogosResumenResponse {
  readonly ok: boolean;
  readonly data: {
    readonly estados: Array<{ id_estado: number; nombre_estado: string }>;
    readonly etnias: Array<{ id_etnia: number; nombre_etnia: string }>;
    readonly tipos_sangre: Array<{ id_tipo_sangre: number; nombre_tipo_sangre: string }>;
    readonly profesiones: Array<{ id_profesion: number; nombre_profesion: string }>;
    readonly vacunas: Array<{
      id_vacuna: number;
      nombre_vacuna: string;
      cantidad_dosis: number;
      descripcion?: string | null;
    }>;
    readonly examenes: Array<{ id_examen: number; nombre_examen: string }>;
    readonly sintomas_comunes: Array<{ id_sintoma: number; nombre_sintoma: string }>;
  };
}

@Injectable({ providedIn: 'root' })
export class ApiBackendService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  /**
   * Inicia sesión contra el backend (Fastify / Argon2id).
   * La cookie `sv_access_token` se almacena automáticamente en el navegador por ser HttpOnly.
   */
  async login(correoUsuario: string, contrasena: string): Promise<BackendUser> {
    const res = await firstValueFrom(
      this.http.post<BackendAuthResponse>(
        `${this.baseUrl}/auth/login`,
        { correo_usuario: correoUsuario.trim().toLowerCase(), contrasena },
        { withCredentials: true },
      ),
    );
    return res.data.user;
  }

  /**
   * Cierra sesión eliminando la cookie de acceso.
   */
  async logout(): Promise<void> {
    await firstValueFrom(
      this.http.post<{ ok: boolean; message: string }>(
        `${this.baseUrl}/auth/logout`,
        {},
        { withCredentials: true },
      ),
    );
  }

  /**
   * Obtiene el perfil del usuario autenticado si la cookie de sesión es válida.
   */
  async me(): Promise<BackendUser | null> {
    try {
      const res = await firstValueFrom(
        this.http.get<BackendAuthResponse>(`${this.baseUrl}/auth/me`, {
          withCredentials: true,
        }),
      );
      return res.data.user;
    } catch {
      return null;
    }
  }

  /**
   * Consulta pública de certificados e historial de vacunación por cédula de identidad.
   */
  async consultarCertificadoPorCedula(
    cedula: string | number,
  ): Promise<BackendConsultaCertificadoResponse['data'] | null> {
    const ci = typeof cedula === 'number' ? cedula : parseInt(cedula.replace(/\D/g, ''), 10);
    if (isNaN(ci) || ci <= 0) return null;

    try {
      const res = await firstValueFrom(
        this.http.get<BackendConsultaCertificadoResponse>(
          `${this.baseUrl}/certificados/publico/cedula/${ci}`,
        ),
      );
      return res.data;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Obtiene el resumen de todos los catálogos almacenados en la base de datos MySQL.
   */
  async getCatalogosResumen(): Promise<BackendCatalogosResumenResponse['data'] | null> {
    try {
      const res = await firstValueFrom(
        this.http.get<BackendCatalogosResumenResponse>(`${this.baseUrl}/catalogos/resumen`, {
          withCredentials: true,
        }),
      );
      return res.data;
    } catch {
      return null;
    }
  }

  /**
   * Obtiene la lista completa de estados (25 entidades federales de Venezuela).
   */
  async getEstados(): Promise<Array<{ id_estado: number; nombre_estado: string }>> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ ok: boolean; data: Array<{ id_estado: number; nombre_estado: string }> }>(
          `${this.baseUrl}/catalogos/estados`,
          { withCredentials: true },
        ),
      );
      return res.data;
    } catch {
      return [];
    }
  }

  /**
   * Obtiene los municipios filtrados opcionalmente por estado.
   */
  async getMunicipios(
    estadoId?: number,
  ): Promise<Array<{ id_municipio: number; nombre_municipio: string; estado_id: number }>> {
    try {
      const params = estadoId ? `?estado_id=${estadoId}` : '';
      const res = await firstValueFrom(
        this.http.get<{
          ok: boolean;
          data: Array<{ id_municipio: number; nombre_municipio: string; estado_id: number }>;
        }>(`${this.baseUrl}/catalogos/municipios${params}`, { withCredentials: true }),
      );
      return res.data;
    } catch {
      return [];
    }
  }

  /**
   * Obtiene las parroquias filtradas por municipio y/o estado.
   */
  async getParroquias(
    municipioId?: number,
    estadoId?: number,
  ): Promise<
    Array<{
      id_parroquia: number;
      nombre_parroquia: string;
      municipio_id: number;
      estado_id: number;
    }>
  > {
    try {
      const queryParams = new URLSearchParams();
      if (municipioId) queryParams.set('municipio_id', String(municipioId));
      if (estadoId) queryParams.set('estado_id', String(estadoId));
      const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const res = await firstValueFrom(
        this.http.get<{
          ok: boolean;
          data: Array<{
            id_parroquia: number;
            nombre_parroquia: string;
            municipio_id: number;
            estado_id: number;
          }>;
        }>(`${this.baseUrl}/catalogos/parroquias${qs}`, { withCredentials: true }),
      );
      return res.data;
    } catch {
      return [];
    }
  }
}
