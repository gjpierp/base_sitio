import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DropdownOption {
  label: string;
  value: any;
  disabled?: boolean;
}

@Component({
  selector: 'ui-dropdowns',
  standalone: true,
  templateUrl: './ui-dropdowns.component.html',
  styleUrl: './ui-dropdowns.component.css',
  imports: [CommonModule, FormsModule],
})
export class UiDropdownsComponent {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder: string = 'Selecciona...';
  @Input() value: any = null;
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<any>();
  open = false;

  select(option: DropdownOption) {
    if (option.disabled || this.disabled) return;
    this.value = option.value;
    this.valueChange.emit(this.value);
    this.open = false;
  }

  toggle() {
    if (this.disabled) return;
    this.open = !this.open;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.ui-dropdowns')) {
      this.open = false;
    }
  }

  get selectedLabel(): string {
    const found = this.options.find((o) => o.value === this.value);
    return found ? found.label : this.placeholder;
  }
}
