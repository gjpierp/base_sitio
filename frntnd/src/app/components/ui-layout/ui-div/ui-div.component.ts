import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-div',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-div.component.html',
  styleUrls: ['./ui-div.component.css'],
})
export class UiDivComponent {
  @Input() gap?: string;
  @Input() align: 'left' | 'center' | 'right' = 'left';
}
