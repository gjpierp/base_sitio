import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiLabelComponent } from '../ui-label/ui-label.component';
import { UiInputComponent } from '../ui-input/ui-input.component';
import { UiSelectsComponent } from '../ui-selects/ui-selects.component';
import { FormsModule } from '@angular/forms';

export interface FieldDef {
  key: string;
  label: string;
  // Permitimos literales comunes y también cadenas generales para evitar errores
  // cuando el valor se infiere como `string` en propiedades de clase.
  type?: 'text' | 'email' | 'number' | 'select' | 'password' | string;
  options?: any[];
}

@Component({
  selector: 'ui-field',
  standalone: true,
  imports: [CommonModule, FormsModule, UiLabelComponent, UiInputComponent, UiSelectsComponent],
  templateUrl: './ui-field.component.html',
  styleUrls: ['./ui-field.component.css'],
})
export class UiFieldComponent {
  @Input() field!: FieldDef;
  @Input() model: any = {};
  @Output() modelChange = new EventEmitter<any>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    // Evita ExpressionChangedAfterItHasBeenCheckedError cuando NgModel/NgControl
    // establece clases (ng-untouched/ng-dirty) después de la primera comprobación.
    // Forzamos una detección en la siguiente microtarea.
    Promise.resolve().then(() => this.cdr.detectChanges());
  }

  onChange(value: any) {
    if (!this.field) return;
    this.model[this.field.key] = value;
    this.modelChange.emit(this.model);
  }
}
