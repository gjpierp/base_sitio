import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-icons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-icons.component.html',
  styleUrls: ['./ui-icons.component.css'],
})
export class UiIconsComponent {
  @Input() name: string = '';
  @Input() size: string = '1.5em';
  @Input() color: string = 'inherit';
  @Input() set: 'material' | 'bootstrap' | 'fontawesome' = 'material';
}
