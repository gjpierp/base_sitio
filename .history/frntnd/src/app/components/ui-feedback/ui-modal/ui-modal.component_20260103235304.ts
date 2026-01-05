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
  private _open = false;
  private lastOpenedAt = 0;

  @Input()
  get open() {
    return this._open;
  }
  set open(v: boolean) {
    this._open = !!v;
    if (this._open) this.lastOpenedAt = Date.now();
  }
  @Input() title = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  onBackdropClick() {
    // Ignore backdrop clicks that occur immediately after opening (click that triggered open)
    try {
      const now = Date.now();
      if (now - this.lastOpenedAt < 250) return;
    } catch {}
    this.close();
  }

  close() {
    this.closed.emit();
  }

  confirm() {
    this.confirmed.emit();
  }
}
