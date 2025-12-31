import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-snippers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-snippers.component.html',
  styleUrl: './ui-snippers.component.css',
})
export class UiSnippersComponent {
  @Input() lines: number = 3;
  @Input() width: string = '100%';
  @Input() height: string = '1.2em';
  @Input() borderRadius: string = '4px';
  @Input() color: string = '#e0e0e0';
  @Input() margin: string = '0.5em 0';
  get linesArray() {
    return Array(this.lines);
  }
}
