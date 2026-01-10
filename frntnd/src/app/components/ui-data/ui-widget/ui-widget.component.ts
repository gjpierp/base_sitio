import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiIconsComponent } from '../../ui-media/ui-icons/ui-icons.component';

import { ChangeDetectionStrategy } from '@angular/core';
@Component({
  selector: 'ui-widget',
  standalone: true,
  imports: [CommonModule, UiIconsComponent],
  templateUrl: './ui-widget.component.html',
  styleUrls: ['./ui-widget.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiWidgetComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = '';
  @Input() color: string = 'var(--color-primary)';
  @Input() background: string = 'var(--bg-card)';
  @Input() padding: string = '1.5rem';
  @Input() radius: string = '12px';
  @Input() shadow: boolean = true;
}
