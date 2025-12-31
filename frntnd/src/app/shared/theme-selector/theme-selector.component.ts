import { Component } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import { FormsModule } from '@angular/forms';
import { UiLabelComponent } from '../../components/ui-form/ui-label/ui-label.component';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [FormsModule, UiLabelComponent],
  template: `
    <ui-label for="theme-select">Diseño:</ui-label>
    <select
      id="theme-select"
      name="theme-select"
      [(ngModel)]="selectedTheme"
      (ngModelChange)="onThemeChange($event)"
    >
      <option value="modern">Moderno</option>
      <option value="classic">Clásico</option>
      <option value="minimalist">Minimalista</option>
      <option value="material">Material</option>
      <option value="neumorphism">Neumorfismo</option>
      <option value="glassmorphism">Glassmorphism</option>
      <option value="flat">Flat</option>
      <option value="dark">Oscuro</option>
      <option value="light">Suave</option>
      <option value="retro">Retro</option>
      <option value="elegant">Elegante</option>
      <option value="futuristic">Futurístico</option>
      <option value="fach-light">FACH Claro</option>
      <option value="fach-dark">FACH Oscuro</option>
    </select>
  `,
  styles: [':host { display: inline-block; }'],
})
export class ThemeSelectorComponent {
  selectedTheme: string;
  constructor(public themeService: ThemeService) {
    this.selectedTheme = this.themeService.getTheme();
  }

  onThemeChange(value: string) {
    this.themeService.setTheme(value);
  }
}
