import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, Params } from '@angular/router';
import { NgIf } from '@angular/common';

import { ChangeDetectionStrategy } from '@angular/core';
@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './ui-button.component.html',
  styleUrls: ['./ui-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiButtonComponent {
  @Input() label = 'Button';
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning' =
    'primary';
  @Input() disabled = false;
  @Input() icon?: string;
  @Input() iconUrl?: string;
  @Input() iconOnly: boolean = false;
  @Input() ariaLabel?: string;
  @Input() routerLink?: string | any[];
  @Input() queryParams?: Params;
  @Input() fragment?: string;
  @Output() pressed = new EventEmitter<void>();

  onClick() {
    if (!this.disabled) this.pressed.emit();
  }
}
