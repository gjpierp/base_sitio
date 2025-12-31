import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-th',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-th.component.html',
  styleUrls: ['./ui-th.component.css'],
})
export class UiThComponent {
  @Input() scope?: string;
}
