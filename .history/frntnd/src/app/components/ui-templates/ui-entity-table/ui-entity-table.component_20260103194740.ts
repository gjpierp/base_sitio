import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '../../ui-form/ui-button/ui-button.component';
import { UiSpinnerComponent } from '../../ui-feedback/ui-spinner/ui-spinner.component';
import { UiCardComponent } from '../../ui-data/ui-card/ui-card.component';
import { UiPaginationComponent } from '../../ui-navigation/ui-pagination/ui-pagination.component';
import { ConfigService } from '../../../services/config.service';

export interface ColumnDef {
  key: string;
  label: string;
}

@Component({
  selector: 'ui-entity-table',
  standalone: true,
  imports: [
    CommonModule,
    UiButtonComponent,
    UiSpinnerComponent,
    UiCardComponent,
    UiPaginationComponent,
  ],
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
  /** pageSize may be provided by parent; if not, we use configured default */
  @Input() pageSize?: number;
  @Input() total = 0;

  private _defaultPageSize = 10;
  private configService = inject(ConfigService);

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

  trackByCol(_index: number, col: ColumnDef) {
    return col?.key ?? _index;
  }

  trackByRow(index: number, row: any) {
    return row?.id ?? index;
  }

  async ngOnInit(): Promise<void> {
    try {
      const val = await this.configService.getItemsPerPage();
      this._defaultPageSize = val;
    } catch {}
  }

  get effectivePageSize(): number {
    return Number(this.pageSize ?? (this._defaultPageSize || 10));
  }

  get lastPage(): number {
    const t = Number(this.total) || 0;
    const ps = Number(this.effectivePageSize || 10);
    return Math.max(1, Math.ceil(t / ps));
  }

  /** Columnas visibles (excluir `id`). */
  get visibleColumns(): ColumnDef[] {
    return (this.columns || []).filter((c) => !/^id$/i.test(String(c.key)));
  }

  onPage(p: number) {
    const np = Math.max(1, Math.min(this.lastPage, Number(p) || 1));
    if (np === this.page) return;
    try {
      console.debug('[ui-entity-table] onPage ->', {
        newPage: np,
        pageSize: this.effectivePageSize,
        total: this.total,
      });
    } catch {}
    this.page = np;
    this.pageChange.emit({ page: np, pageSize: this.effectivePageSize });
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
