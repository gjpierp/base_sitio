import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-error.component.html',
  styleUrl: './ui-error.component.css',
})
export class UiErrorComponent {
  @Input() message: string = 'Ha ocurrido un error.';
  @Input() icon: string = 'error';
  @Input() details?: string;
}
