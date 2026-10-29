import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Encabezado estandarizado para las vistas del Centro de Salud (/PS).
 * Proporciona jerarquía visual Liquid Glass, contexto de sección y área de proyección
 * para acciones rápidas o botones contextuales.
 */
@Component({
  selector: 'app-ps-encabezado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ps-encabezado.html',
  styleUrl: './ps-encabezado.css',
})
export class PsEncabezado {
  /** Texto superior de contexto (ej: 'Centro de Salud', 'Inmunizaciones') */
  readonly eyebrow = input('Centro de Salud');

  /** Título principal de la vista */
  readonly titulo = input.required<string>();

  /** Descripción explicativa o bajada de título */
  readonly descripcion = input<string>('');
}
