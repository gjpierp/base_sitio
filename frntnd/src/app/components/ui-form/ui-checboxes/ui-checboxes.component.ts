import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface UiCheckboxOption {
  label: string;
  value: any;
  disabled?: boolean;
}

@Component({
  selector: 'ui-checboxes',
  standalone: true,
  templateUrl: './ui-checboxes.component.html',
  styleUrl: './ui-checboxes.component.css',
  imports: [CommonModule, FormsModule],
})
export class UiChecboxesComponent {
  @Input() options: UiCheckboxOption[] = [];
  @Input() values: any[] = [];
  @Input() disabled = false;
  @Input() label?: string;
  @Input() error?: string;
  @Input() id?: string;
  @Input() name?: string;
  @Output() valuesChange = new EventEmitter<any[]>();

  toggle(option: UiCheckboxOption) {
    if (this.disabled || option.disabled) return;
    const idx = this.values.indexOf(option.value);
    if (idx > -1) {
      this.values = this.values.filter((v) => v !== option.value);
    } else {
      this.values = [...this.values, option.value];
    }
    this.valuesChange.emit(this.values);
  }

  isChecked(option: UiCheckboxOption): boolean {
    return this.values.includes(option.value);
  }
}
