import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-label.component.html',
  styleUrls: ['./ui-label.component.css'],
})
export class UiLabelComponent {
  @Input() for?: string;
  @Input() muted = false;
}
