import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-grid.component.html',
  styleUrl: './ui-grid.component.css',
})
export class UiGridComponent {
  @Input() columns: number = 2;
  @Input() gap: string = '1rem';
}
