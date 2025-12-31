import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, Params } from '@angular/router';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ui-button.component.html',
  styleUrl: './ui-button.component.css',
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
