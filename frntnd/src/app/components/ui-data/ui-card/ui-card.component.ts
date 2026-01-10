import {
  Component,
  Input,
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-card.component.html',
  styleUrls: ['./ui-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCardComponent implements AfterContentInit {
  @Input() title?: string;
  @Input() subtitle?: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterContentInit(): void {
    // Evitar ExpressionChangedAfterItHasBeenCheckedError cuando contenido proyectado
    // modifica valores vinculados en el mismo ciclo de detección.
    try {
      this.cdr.detectChanges();
    } catch {}
  }
}
