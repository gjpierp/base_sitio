import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ui-textareas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ui-textareas.component.html',
  styleUrl: './ui-textareas.component.css',
})
export class UiTextareasComponent {
  private static idCounter = 0;
  private generatedId = `ui-textareas-${UiTextareasComponent.idCounter++}`;
  @Input() value: string = '';
  @Input() placeholder: string = '';
  @Input() rows: number = 3;
  @Input() disabled: boolean = false;
  @Input() maxlength?: number;
  @Input() label?: string;
  @Input() error?: string;
  @Input() id?: string;
  @Input() name?: string;
  @Output() valueChange = new EventEmitter<string>();

  get textareaId(): string {
    return this.id ?? this.generatedId;
  }

  get textareaName(): string {
    return this.name ?? this.textareaId;
  }

  onInput(event: Event) {
    const val = (event.target as HTMLTextAreaElement).value;
    this.value = val;
    this.valueChange.emit(val);
  }
}
