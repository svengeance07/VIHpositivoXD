import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TemaService } from './nucleo/servicios/tema.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly tema = inject(TemaService);
}
