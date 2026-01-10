import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-spinner',
  standalone: true,
  templateUrl: './ui-spinner.component.html',
  styleUrl: './ui-spinner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSpinnerComponent {
  /** Texto accesible anunciado por screen readers */
  @Input() label: string = 'Cargando…';
  /** Tamaño del spinner */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
