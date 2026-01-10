import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '../ui-button/ui-button.component';

import { ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiFormActionsComponent {}
