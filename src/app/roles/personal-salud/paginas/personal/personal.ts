import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { DatosPersonalSaludService } from '../../../../nucleo/servicios/datos-personal-salud.service';
import { SesionService } from '../../../../nucleo/servicios/sesion.service';
import { PsEncabezado } from '../../componentes/ps-encabezado/ps-encabezado';

/**
 * Vista de Credencial Digital y Rendimiento del Jefe de Centro (/PS/personal).
 *
 * En el modelo de usuario único por entidad, cada Centro de Salud cuenta
 * únicamente con su Jefe / Encargado titular, quien consulta aquí su
 * credencial digital institucional (MPPS) y sus indicadores de actividad clínica.
 */
@Component({
  selector: 'app-personal-salud-personal',
  imports: [DecimalPipe, RouterLink, PsEncabezado],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './personal.html',
  styleUrl: './personal.css',
})
export class PersonalSaludPersonal {
  protected readonly datosPS = inject(DatosPersonalSaludService);
  private readonly sesion = inject(SesionService);

  /** Datos del Jefe de Centro y entidad activa */
  protected readonly nombreCentro = computed(
    () => this.sesion.sesion()?.entidad ?? this.datosPS.centroNombre,
  );
  protected readonly miPerfil = this.datosPS.enfermeroActual;
  protected readonly misMetricas = this.datosPS.metricasEnfermero;

  /** Estado de la Credencial Digital Institucional */
  protected readonly caraCredencial = signal<'frente' | 'reverso'>('frente');
  protected readonly mensajeCredencial = signal('');

  /** Iniciales limpias del perfil activo para el carnet */
  protected readonly inicialesPerfil = computed(() => {
    const limpio = this.miPerfil().nombre.replace(/^(Dra\.|Dr\.|Lic\.|Enf\.)\s*/i, '');
    const partes = limpio.split(/\s+/).filter(Boolean);
    if (partes.length >= 2) {
      return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    }
    return (partes[0]?.slice(0, 2) ?? 'JC').toUpperCase();
  });

  /** Dosis biológicas totales administradas por este profesional */
  protected readonly misAplicacionesTotales = computed(() => {
    const enf = this.miPerfil();
    return this.datosPS.aplicaciones().filter((a) => a.enfermeroId === enf.id);
  });

  /**
   * Conmuta la visualización entre el anverso (frente) y reverso de la credencial.
   */
  protected voltearCredencial(): void {
    this.caraCredencial.update((c) => (c === 'frente' ? 'reverso' : 'frente'));
  }

  /**
   * Simula la descarga oficial de la credencial profesional en formato digital.
   */
  protected descargarCredencial(): void {
    const matricula = this.miPerfil().idProfesional;
    this.mensajeCredencial.set(
      `Credencial descargada exitosamente en formato PDF oficial (MPPS-${matricula}.pdf).`,
    );
    setTimeout(() => {
      this.mensajeCredencial.set('');
    }, 4500);
  }

  /**
   * Copia el código criptográfico / hash de validación sanitaria al portapapeles.
   */
  protected copiarEnlaceVerificacion(): void {
    const enlace = `https://mpps.gob.ve/verificar-personal?colegiado=${encodeURIComponent(
      this.miPerfil().idProfesional,
    )}&ci=${encodeURIComponent(this.miPerfil().cedula)}`;

    void navigator.clipboard?.writeText(enlace);
    this.mensajeCredencial.set('¡Código de verificación copiado al portapapeles!');
    setTimeout(() => {
      this.mensajeCredencial.set('');
    }, 3500);
  }
}
