import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-modal.component.html',
  styleUrls: ['./ui-modal.component.css'],
})
export class UiModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  onBackdropClick() {
    this.close();
  }

  close() {
    this.closed.emit();
  }

  confirm() {
    this.confirmed.emit();
  }
}
