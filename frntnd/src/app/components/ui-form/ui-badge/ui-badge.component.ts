import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-badge',
  standalone: true,
  templateUrl: './ui-badge.component.html',
  styleUrl: './ui-badge.component.css',
})
export class UiBadgeComponent {
  @Input() text = '';
  @Input() variant: 'primary' | 'success' | 'warning' | 'danger' = 'primary';
}
