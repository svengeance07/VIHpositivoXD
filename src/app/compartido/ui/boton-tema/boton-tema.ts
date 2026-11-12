import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TemaService } from '../../../nucleo/servicios/tema.service';

@Component({
  selector: 'app-boton-tema',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './boton-tema.html',
  styleUrl: './boton-tema.css',
})
export class BotonTema {
  protected readonly temaSvc = inject(TemaService);
}
