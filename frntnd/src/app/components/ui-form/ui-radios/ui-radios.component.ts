import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UiRadioOption {
  label: string;
  value: any;
  disabled?: boolean;
}

import { ChangeDetectionStrategy } from '@angular/core';
@Component({
  selector: 'ui-radios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-radios.component.html',
  styleUrl: './ui-radios.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiRadiosComponent {
  private static idCounter = 0;
  private generatedId = `ui-radios-${UiRadiosComponent.idCounter++}`;
  @Input() options: UiRadioOption[] = [];
  @Input() id?: string;
  @Input() name?: string;
  @Input() value: any = null;
  @Input() disabled = false;
  @Input() label?: string;
  @Input() error?: string;
  @Output() valueChange = new EventEmitter<any>();

  get radioName(): string {
    return this.name ?? this.generatedId;
  }

  radioOptionId(optionValue: any): string {
    const safe = String(optionValue).replace(/\s+/g, '-');
    return this.id ? `${this.id}-${safe}` : `${this.generatedId}-${safe}`;
  }

  select(option: UiRadioOption) {
    if (this.disabled || option.disabled) return;
    this.value = option.value;
    this.valueChange.emit(this.value);
  }

  isChecked(option: UiRadioOption): boolean {
    return this.value === option.value;
  }
}
