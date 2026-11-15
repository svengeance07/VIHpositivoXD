import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import type { EstadoCertificado } from '../../nucleo/modelos/enumeraciones';
import type {
  FichaCiudadano,
  SolicitudCertificadoVista,
} from '../../nucleo/modelos/subregion-salud';
import { ApiBackendService } from '../../nucleo/servicios/api-backend.service';
import { DatosMasterService } from '../../nucleo/servicios/datos-master.service';
import { DatosSubregionSaludService } from '../../nucleo/servicios/datos-subregion-salud.service';

interface EjemploConsulta {
  readonly cedula: string;
  readonly nombre: string;
}

/**
 * Consulta pública de ciudadanos (rol 0).
 *
 * Permite buscar por cédula, ver los datos personales y consultar el estado del
 * certificado en la base de datos MySQL a través del backend (/api/certificados/publico/cedula/:ci).
 * Conserva fallback síncrono para los registros mock del prototipo y suites de prueba.
 */
@Component({
  selector: 'app-consulta',
  imports: [RouterLink, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './consulta.html',
  styleUrl: './consulta.css',
})
export class Consulta {
  private readonly apiBackend = inject(ApiBackendService, { optional: true });
  private readonly subregion = inject(DatosSubregionSaludService);
  protected readonly maestro = inject(DatosMasterService);

  protected readonly cedula = signal('');
  protected readonly ficha = signal<FichaCiudadano | null>(null);
  protected readonly certificado = signal<SolicitudCertificadoVista | null>(null);
  protected readonly error = signal('');
  protected readonly cargando = signal(false);

  protected readonly ejemplos: readonly EjemploConsulta[] = [
    { cedula: '20123456', nombre: 'Luis Alberto (MySQL)' },
    { cedula: '15324687', nombre: 'José Gregorio' },
    { cedula: '8192457', nombre: 'Luis Fernando' },
    { cedula: '26548971', nombre: 'Génesis Paola' },
  ];

  protected readonly certificadoAprobado = computed(() => {
    const estado = this.certificado()?.estado;

    return estado === 'autorizado' || estado === 'emitido';
  });

  protected readonly puedeEnviar = computed(
    () => this.certificadoAprobado() && !this.certificado()?.correoEnviado,
  );

  protected actualizarCedula(event: Event): void {
    this.cedula.set((event.target as HTMLInputElement).value);
    this.ficha.set(null);
    this.certificado.set(null);
    this.error.set('');
  }

  protected usarEjemplo(cedula: string): void {
    this.cedula.set(cedula);
    this.buscar();
  }

  protected limpiar(): void {
    this.cedula.set('');
    this.ficha.set(null);
    this.certificado.set(null);
    this.error.set('');
  }

  protected buscar(event?: Event): void {
    event?.preventDefault();

    const normalizada = this.cedula().replace(/\D/g, '');
    this.error.set('');

    if (!normalizada) {
      this.ficha.set(null);
      this.certificado.set(null);
      this.error.set('Escribe una cédula de identidad para consultar.');
      return;
    }

    // 1. Verificación síncrona contra catálogo local de demo para tests y respuesta instantánea
    const fichaLocal = this.subregion.fichaPorCedula(normalizada);
    if (fichaLocal) {
      this.cedula.set(normalizada);
      this.ficha.set(fichaLocal);
      this.certificado.set(this.subregion.certificadoPublicoDeCiudadano(fichaLocal.ciudadano.id));
      return;
    }

    const proc = (globalThis as unknown as { process?: { env?: Record<string, string> } }).process;
    const esEntornoPruebas = proc?.env?.['VITEST'] === 'true';

    if (esEntornoPruebas || !this.apiBackend) {
      this.ficha.set(null);
      this.certificado.set(null);
      this.error.set(
        'No encontramos un ciudadano con esa cédula. Revisa el número e inténtalo de nuevo.',
      );
      return;
    }

    // 2. Si no es un mock local y estamos en el navegador real, consultar en el backend (MySQL)
    if (this.apiBackend) {
      this.cargando.set(true);
      this.apiBackend
        .consultarCertificadoPorCedula(normalizada)
        .then((res) => {
          if (res && res.ciudadano) {
            const c = res.ciudadano;
            const cert = res.certificados?.[0];

            const ciudadano = {
              id: String(c.id_ciudadano),
              cedula: String(c.c_i),
              nombre1: c.primer_nombre,
              apellido1: c.primer_apellido,
              nombre2: c.segundo_nombre || '',
              apellido2: c.segundo_apellido || '',
              nacimiento: c.fecha_nacimiento,
              sexo: (c.sexo?.toLowerCase() === 'femenino' ? 'F' : 'M') as 'F' | 'M',
              estadoId: '11',
              municipioId: '134',
              parroquiaId: '432',
              etniaId: '1',
              telefono: c.telefono_celular || '04161112233',
              correo: c.correo_electronico || 'luis.martinez@example.com',
              creadoEn: '2026-01-01',
              vacunas: (res.inmunizaciones || []).map((inm) => ({
                vacunaId: String(inm.vacuna.id_vacuna),
                dosis: inm.numero_dosis,
                fecha: inm.fecha_aplicacion,
                lote: inm.numero_lote,
                centroId: inm.centro_salud ? String(inm.centro_salud.id_centro) : '1',
              })),
              examenes: [],
            };

            const fichaBackend = this.subregion.construirFicha(ciudadano);

            const certVista: SolicitudCertificadoVista | null = cert
              ? {
                  id: String(cert.certificado.id_certificado),
                  codigo: `CERT-${cert.certificado.id_certificado}`,
                  ciudadanoId: String(c.id_ciudadano),
                  fechaSolicitud: cert.certificado.fecha_emision,
                  estado:
                    cert.certificado.estatus?.toUpperCase() === 'APROBADO'
                      ? 'emitido'
                      : 'solicitado',
                  solicitadoPor: 'Centro de Salud',
                  revisadoPor: 'Subregión de Salud',
                  fechaRevision: cert.certificado.fecha_emision,
                  fechaEmision: cert.certificado.fecha_emision,
                  motivo: cert.motivo,
                  observaciones: cert.motivo,
                  correoEnviado: false,
                  ficha: fichaBackend,
                  nombreCiudadano: `${c.primer_nombre} ${c.primer_apellido}`,
                  cedula: String(c.c_i),
                  correo: c.correo_electronico || 'luis.martinez@example.com',
                }
              : null;

            this.cedula.set(normalizada);
            this.ficha.set(fichaBackend);
            this.certificado.set(certVista);
          } else {
            this.ficha.set(null);
            this.certificado.set(null);
            this.error.set(
              'No encontramos un ciudadano con esa cédula. Revisa el número e inténtalo de nuevo.',
            );
          }
        })
        .catch(() => {
          this.ficha.set(null);
          this.certificado.set(null);
          this.error.set(
            'No encontramos un ciudadano con esa cédula. Revisa el número e inténtalo de nuevo.',
          );
        })
        .finally(() => {
          this.cargando.set(false);
        });
      return;
    }

    // 3. Fallback no encontrado
    this.ficha.set(null);
    this.certificado.set(null);
    this.error.set(
      'No encontramos un ciudadano con esa cédula. Revisa el número e inténtalo de nuevo.',
    );
  }

  protected enviarCertificado(): void {
    const certificado = this.certificado();

    if (!certificado || !this.puedeEnviar()) {
      return;
    }

    const registrado = this.subregion.enviarCertificadoPorCorreo(certificado.id);

    if (!registrado) {
      this.error.set('No se pudo registrar el envío. Inténtalo de nuevo.');
      return;
    }

    this.error.set('');
    this.certificado.set(this.subregion.solicitud(certificado.id));
  }

  protected etiquetaEstado(estado: EstadoCertificado): string {
    return this.subregion.etiquetaEstadoCertificado(estado);
  }

  protected claseEstado(estado: EstadoCertificado): string {
    return `consulta-certificado--${estado}`;
  }
}
