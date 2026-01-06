import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-modal.component.html',
  styleUrls: ['./ui-modal.component.css'],
})
export class UiModalComponent implements AfterViewInit {
  @ViewChild('dialogRef', { static: false }) dialogRef!: ElementRef<HTMLDivElement>;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    // Removed dynamic width adjustment
    // setTimeout(() => this.adjustDialogWidth(), 0);
  }

  private adjustDialogWidth() {
    // Removed dynamic width adjustment logic
    // if (!this.dialogRef) return;
    // const dialog = this.dialogRef.nativeElement;
    // const content = dialog.querySelector('.content');
    // if (!content) return;
    // const contentWidth = content.scrollWidth;
    // const minWidth = 360;
    // const maxWidth = 1100;
    // let newWidth = Math.max(minWidth, Math.min(contentWidth, maxWidth));
    // this.renderer.setStyle(dialog, 'width', newWidth + 'px');
  }
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

  // ...

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
