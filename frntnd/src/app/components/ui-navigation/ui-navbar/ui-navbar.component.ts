import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ui-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ui-navbar.component.html',
  styleUrls: ['./ui-navbar.component.css'],
})
export class UiNavbarComponent {
  @Input() title: string = 'Admin Sitio';
  @Input() logo: string = 'AP';
  @Input() links: Array<{ label: string; url: string }> = [
    { label: 'Inicio', url: '/' },
    { label: 'Acerca', url: '/about' },
    { label: 'Contacto', url: '/contact' },
  ];
  @Output() menuToggle = new EventEmitter<void>();

  onMenuToggle() {
    this.menuToggle.emit();
  }
}
