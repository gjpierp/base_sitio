import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface UiSelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

import { ChangeDetectionStrategy } from '@angular/core';
@Component({
  selector: 'ui-selects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ui-selects.component.html',
  styleUrl: './ui-selects.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSelectsComponent {
  private static idCounter = 0;
  private generatedId = `ui-selects-${UiSelectsComponent.idCounter++}`;
  @Input() options: UiSelectOption[] = [];
  @Input() value: any = null;
  @Input() placeholder: string = 'Selecciona...';
  @Input() disabled = false;
  @Input() label?: string;
  @Input() error?: string;
  @Input() id?: string;
  @Input() name?: string;
  @Output() valueChange = new EventEmitter<any>();

  get selectId(): string {
    return this.id ?? this.generatedId;
  }

  get selectName(): string {
    return this.name ?? this.selectId;
  }

  onChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.value = val;
    this.valueChange.emit(val);
  }
}
