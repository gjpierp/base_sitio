import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-columns',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-columns.component.html',
  styleUrl: './ui-columns.component.css',
})
export class UiColumnsComponent {
  @Input() columns: number = 2;
  @Input() gap: string = '1rem';
  @Input() align: string = 'stretch';
}
