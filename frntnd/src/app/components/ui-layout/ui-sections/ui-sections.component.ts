import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-sections',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-sections.component.html',
  styleUrl: './ui-sections.component.css',
})
export class UiSectionsComponent {
  @Input() gap: string = '2rem';
}
