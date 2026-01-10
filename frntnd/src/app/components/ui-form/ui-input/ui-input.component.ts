import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChangeDetectionStrategy } from '@angular/core';
@Component({
  selector: 'ui-input',
  standalone: true,
  templateUrl: './ui-input.component.html',
  styleUrls: ['./ui-input.component.css'],
  imports: [FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiInputComponent {
  private static idCounter = 0;
  private generatedId = `ui-input-${UiInputComponent.idCounter++}`;
  @Input() label?: string;
  @Input() placeholder?: string;
  // Permitimos cadenas generales para evitar errores cuando el valor viene de `FieldDef.type`.
  @Input() type: 'text' | 'email' | 'password' | 'number' | string = 'text';
  @Input() value = '';
  @Input() id?: string;
  @Input() name?: string;
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();

  get inputId(): string {
    return this.id ?? this.generatedId;
  }

  get inputName(): string {
    return this.name ?? this.inputId;
  }
}
