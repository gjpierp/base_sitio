import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-avatars',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-avatars.component.html',
  styleUrls: ['./ui-avatars.component.css'],
})
export class UiAvatarsComponent {
  @Input() src: string = '';
  @Input() alt: string = '';
  @Input() size: string = '3rem';
  @Input() shape: 'circle' | 'rounded' | 'square' = 'circle';
  @Input() fallback: string = '';
  @Input() initials: string = '';
  error = false;

  onError() {
    this.error = true;
  }
}
