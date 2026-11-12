import type { TipoUsuarioSql } from '../tablas-sql.model';

/**
 * Modelos para la cuenta de administración central Master y auditoría de accesos (/master).
 */

export interface CuentaMasterSql {
  readonly idUsuarios: number;
  readonly correoUsuario: string;
  readonly nombreUsuario: string;
  readonly tipoUsuario: TipoUsuarioSql;
  readonly activo: boolean;
  readonly ultimoAcceso?: string;
}

export interface AuditoriaAccesoMasterSql {
  readonly idAcceso: number;
  readonly usuarioId: number;
  readonly correoUsuario: string;
  readonly tipoUsuario: TipoUsuarioSql;
  readonly fechaAcceso: string;
  readonly ipOrigen: string;
  readonly exito: boolean;
}

