import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-td',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-td.component.html',
  styleUrls: ['./ui-td.component.css'],
})
export class UiTdComponent {
  @Input() colspan?: number;
}
