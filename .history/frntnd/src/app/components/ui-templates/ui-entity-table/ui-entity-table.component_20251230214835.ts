import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '../../ui-form/ui-button/ui-button.component';
import { UiSpinnerComponent } from '../../ui-feedback/ui-spinner/ui-spinner.component';
import { UiCardComponent } from '../../ui-data/ui-card/ui-card.component';

export interface ColumnDef {
  key: string;
  label: string;
}

@Component({
  selector: 'ui-entity-table',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, UiSpinnerComponent, UiCardComponent],
  templateUrl: './ui-entity-table.component.html',
  styleUrls: ['./ui-entity-table.component.css'],
})
export class UiEntityTableComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() error?: string;

  @Input() columns: ColumnDef[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() pageSize = 10;
  @Input() total = 0;

  @Output() pageChange = new EventEmitter<{
    page: number;
    pageSize: number;
    term?: string;
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
  }>();
  @Output() edit = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();

  page = 1;

  get lastPage(): number {
    const t = Number(this.total) || 0;
    const ps = Number(this.pageSize) || 10;
    return Math.max(1, Math.ceil(t / ps));
  }

  /** Columnas visibles (excluir `id`). */
  get visibleColumns(): ColumnDef[] {
    return (this.columns || []).filter((c) => !/^id$/i.test(String(c.key)));
  }

  onPage(p: number) {
    const np = Math.max(1, Math.min(this.lastPage, Number(p) || 1));
    if (np === this.page) return;
    this.page = np;
    this.pageChange.emit({ page: np, pageSize: this.pageSize });
  }

  onEdit(row: any) {
    this.edit.emit(row);
  }

  onRemove(row: any) {
    this.remove.emit(row);
  }

  emitEdit(row: any) {
    this.edit.emit(row);
  }

  emitRemove(row: any) {
    this.remove.emit(row);
  }
}
