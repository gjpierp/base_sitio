import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-loaders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-loaders.component.html',
  styleUrl: './ui-loaders.component.css',
})
export class UiLoadersComponent {
  @Input() type: 'spinner' | 'dots' = 'spinner';
  @Input() size: string = '2.5rem';
  @Input() color: string = '#1976d2';
}
