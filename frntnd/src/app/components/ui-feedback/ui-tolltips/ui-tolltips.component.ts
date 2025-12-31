import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-tolltips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-tolltips.component.html',
  styleUrl: './ui-tolltips.component.css',
})
export class UiTolltipsComponent {
  @Input() text: string = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  show = false;

  @HostListener('mouseenter') onMouseEnter() {
    this.show = true;
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.show = false;
  }
}
