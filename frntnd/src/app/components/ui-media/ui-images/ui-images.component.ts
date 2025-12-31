import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-images',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-images.component.html',
  styleUrls: ['./ui-images.component.css'],
})
export class UiImagesComponent {
  @Input() src: string = '';
  @Input() alt: string = '';
  @Input() width: string = 'auto';
  @Input() height: string = 'auto';
  @Input() fit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' = 'cover';
  @Input() radius: string = '0px';
  @Input() loading: 'eager' | 'lazy' = 'lazy';
  @Input() fallback: string = '';
  error = false;

  onError() {
    this.error = true;
  }
}
