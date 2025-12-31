import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '../ui-button/ui-button.component';

@Component({
  selector: 'ui-form-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="actions">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }
    `,
  ],
})
export class UiFormActionsComponent {}
