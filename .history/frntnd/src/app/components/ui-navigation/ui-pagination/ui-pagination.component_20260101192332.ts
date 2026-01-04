import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-pagination.component.html',
  styleUrls: ['./ui-pagination.component.css'],
})
export class UiPaginationComponent {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  @Input() maxPages = 5;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.page;
    const max = this.maxPages;
    let start = Math.max(1, current - Math.floor(max / 2));
    let end = start + max - 1;
    if (end > total) {
      end = total;
      start = Math.max(1, end - max + 1);
    }
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }

  goTo(page: number) {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    try {
      console.debug('[ui-pagination] goTo ->', { requested: page, current: this.page, totalPages: this.totalPages });
    } catch {}
    this.pageChange.emit(page);
  }
}
