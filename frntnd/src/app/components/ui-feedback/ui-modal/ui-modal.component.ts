import { Component, ElementRef, EventEmitter, Input, Output, Renderer2 } from '@angular/core';
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
  // no DOM relocation: keep component in Angular's render tree

  @Input() title = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  @Input()
  get isOpen() {
    return this._open;
  }
  set isOpen(v: boolean) {
    const prev = this._open;
    this._open = !!v;
    if (this._open) this.lastOpenedAt = Date.now();
    try {
    } catch {}
  }

  // Backwards-compatible alias: allow binding to [open] as well
  @Input('open')
  get open() {
    return this.isOpen;
  }
  set open(v: boolean) {
    this.isOpen = v;
  }

  constructor() {}

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
    } catch {}
    this.confirmed.emit();
  }

  // Public helpers to open/close programmatically
  openModal() {
    try {
      this.isOpen = true;
    } catch {}
  }

  closeModal() {
    try {
      this.isOpen = false;
    } catch {}
  }
}
