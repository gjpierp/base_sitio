import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-container.component.html',
  styleUrl: './ui-container.component.css',
})
export class UiContainerComponent {
  @Input() maxWidth: string = '1200px';
  @Input() padding: string = '1rem';
  @Input() margin: string = '0 auto';
}
