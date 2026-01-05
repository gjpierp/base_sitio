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

  @Input() title = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  @Input()
  get open() {
    return this._open;
  }
  set open(v: boolean) {
    this._open = !!v;
    if (this._open) this.lastOpenedAt = Date.now();
    try {
      console.log('[UiModal] open set ->', this._open, 'lastOpenedAt:', this.lastOpenedAt);
    } catch {}
  }

  onBackdropClick() {
    // Ignore backdrop clicks that occur immediately after opening (click that triggered open)
    try {
      const now = Date.now();
      if (now - this.lastOpenedAt < 250) return;
    } catch {}
    this.close();
  }

  close() {
    try {
      console.log('[UiModal] close() called');
    } catch {}
    // Close internally first to update component state
    try {
      this._open = false;
    } catch {}
    // Emit closed asynchronously to avoid ExpressionChangedAfterItHasBeenCheckedError
    try {
      setTimeout(() => {
        try {
          this.closed.emit();
        } catch {}
      }, 0);
    } catch {
      try {
        this.closed.emit();
      } catch {}
    }
  }

  confirm() {
    try {
      console.log('[UiModal] confirm() called');
    } catch {}
    this.confirmed.emit();
  }

  // Public helpers to open/close programmatically
  openModal() {
    try {
      this.open = true;
    } catch {}
  }

  closeModal() {
    try {
      this.open = false;
    } catch {}
  }
}
