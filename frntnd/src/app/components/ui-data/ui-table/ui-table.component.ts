import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiInputComponent } from '../../ui-form/ui-input/ui-input.component';
import { UiButtonComponent } from '../../ui-form/ui-button/ui-button.component';
import { UiTheadComponent } from './ui-thead/ui-thead.component';
import { UiTbodyComponent } from './ui-tbody/ui-tbody.component';
import { UiTrComponent } from './ui-tr/ui-tr.component';
import { UiThComponent } from './ui-th/ui-th.component';
import { UiTdComponent } from './ui-td/ui-td.component';

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [
    CommonModule,
    UiInputComponent,
    UiButtonComponent,
    UiTheadComponent,
    UiTbodyComponent,
    UiTrComponent,
    UiThComponent,
    UiTdComponent,
  ],
  templateUrl: './ui-table.component.html',
  styleUrl: './ui-table.component.css',
})
export class UiTableComponent implements OnInit, OnChanges {
  @Input() columns: { key: string; label: string; type?: string }[] = [];
  @Input() data: Record<string, any>[] = [];
  @Input() enableFilter = false;
  @Input() enablePagination = false;
  @Input() pageSize = 10;
  @Input() showActions = false;
  // Soporte de paginación server-side: total de registros en backend
  @Input() totalRecords?: number;
  // Compatibilidad con páginas antiguas que usan `total`
  @Input('total')
  set total(v: number | undefined) {
    this.totalRecords = v;
  }
  get total(): number | undefined {
    return this.totalRecords;
  }
  // Inputs opcionales para compatibilidad con páginas existentes
  @Input() persistPageSize = false;
  @Input() tableId?: string;
  @Input() enableColumnToggle = false;
  @Input() persistPage = false;
  @Input() enableSort = true;

  @Output() edit = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();
  // Evento que notifica cuando la tabla tiene datos listos para renderizar
  @Output() ready = new EventEmitter<void>();
  // Evento de cambio de página/tamaño para paginación server-side
  @Output() pageChange = new EventEmitter<{
    page: number;
    pageSize: number;
    term?: string;
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
  }>();

  pageSizeOptions = [5, 10, 20, 50];

  /** Columnas que se mostrarán en la UI (filtradas). Excluimos la columna 'id'. */
  get visibleColumns() {
    return (this.columns || []).filter((c) => !/^id$/i.test(String(c.key)));
  }

  filterText = '';
  page = 1;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  private filterDebounceTimer?: any;

  ngOnInit(): void {
    // Cargar pageSize persistido si corresponde
    if (this.persistPageSize && this.tableId) {
      const key = `ui-table:pageSize:${this.tableId}`;
      const saved = localStorage.getItem(key);
      const n = Number(saved);
      if (!isNaN(n) && n > 0) {
        this.pageSize = n;
      }
    }
    // Cargar página persistida si corresponde
    if (this.persistPage && this.tableId) {
      const key = `ui-table:page:${this.tableId}`;
      const savedNum = Number(localStorage.getItem(key));
      if (!isNaN(savedNum) && savedNum > 0) {
        this.page = savedNum;
        const total = this.totalPages;
        if (this.page > total) this.page = total;
        if (this.page < 1) this.page = 1;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const dataChanged = !!changes['data'];
    const colsChanged = !!changes['columns'];
    if (dataChanged || colsChanged) {
      // Mantener página actual y limitar al rango válido
      if (this.enablePagination) {
        const total = this.totalPages;
        if (this.page > total) this.page = total;
        if (this.page < 1) this.page = 1;
      }
      // Emitir evento de listo cuando haya datos para mostrar
      const count = this.enablePagination ? this.paged.length : this.sorted.length;
      if (count > 0) {
        // Emitir en el siguiente ciclo para asegurar que el template se actualice
        setTimeout(() => this.ready.emit());
      }
    }
  }

  get filtered(): any[] {
    if (!this.enableFilter || this.filterText.trim() === '') return this.data;
    const term = this.filterText.toLowerCase();
    return this.data.filter((row) =>
      this.columns.some((c) =>
        String(row[c.key] ?? '')
          .toLowerCase()
          .includes(term)
      )
    );
  }

  private compareValues(a: any, b: any): number {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;
    const na = Number(a);
    const nb = Number(b);
    const aIsNum = !isNaN(na) && typeof a !== 'object';
    const bIsNum = !isNaN(nb) && typeof b !== 'object';
    if (aIsNum && bIsNum) return na - nb;
    const sa = String(a).toLowerCase();
    const sb = String(b).toLowerCase();
    return sa.localeCompare(sb);
  }

  get sorted(): any[] {
    const arr = this.filtered;
    if (!this.enableSort || !this.sortKey || !this.sortDir) return arr;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return [...arr].sort((x, y) => dir * this.compareValues(x[this.sortKey!], y[this.sortKey!]));
  }

  get totalPages(): number {
    if (!this.enablePagination) return 1;
    const count = this.totalRecords ?? this.filtered.length;
    return Math.max(1, Math.ceil(count / this.pageSize));
  }

  /**
   * Indica si se debe mostrar la paginación.
   * Se oculta cuando el total de registros (server-side o client-side)
   * es menor o igual al tamaño de página configurado.
   */
  get shouldShowPagination(): boolean {
    if (!this.enablePagination) return false;
    const count = this.totalRecords ?? this.filtered.length;
    if (!count || count <= this.pageSize) return false;
    // Además requerimos que haya filas visibles para evitar UI vacía.
    return this.filtered.length > 0;
  }

  get paged(): any[] {
    if (!this.enablePagination) return this.sorted;
    const start = (this.page - 1) * this.pageSize;
    return this.sorted.slice(start, start + this.pageSize);
  }

  get pageStartIndex(): number {
    if (!this.enablePagination || this.filtered.length === 0) return 0;
    const count = this.totalRecords ?? this.filtered.length;
    if (count === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get pageEndIndex(): number {
    if (!this.enablePagination || this.filtered.length === 0) return 0;
    const start = this.pageStartIndex;
    if (start === 0) return 0;
    // Usar longitud de página actual para precisión tanto client-side como server-side
    return start + (this.paged.length > 0 ? this.paged.length - 1 : 0);
  }

  setFilter(v: string) {
    this.filterText = v;
    this.page = 1;
    // Debounce para emitir al padre (server-side)
    if (this.filterDebounceTimer) clearTimeout(this.filterDebounceTimer);
    this.filterDebounceTimer = setTimeout(() => {
      this.emitPageChange();
    }, 300);
    this.savePage();
  }

  changePageSize(size: number | string) {
    const n = Number(size);
    if (!isNaN(n) && n > 0) {
      this.pageSize = n;
      this.page = 1;
      this.emitPageChange();
      if (this.persistPageSize && this.tableId) {
        const key = `ui-table:pageSize:${this.tableId}`;
        try {
          localStorage.setItem(key, String(n));
        } catch {}
      }
      this.savePage();
    }
  }

  emitEdit(row: any) {
    this.edit.emit(row);
  }

  emitRemove(row: any) {
    this.remove.emit(row);
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.emitPageChange();
      this.savePage();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.emitPageChange();
      this.savePage();
    }
  }

  firstPage() {
    if (this.page !== 1) {
      this.page = 1;
      this.emitPageChange();
      this.savePage();
    }
  }

  lastPage() {
    const last = this.totalPages;
    if (this.page !== last) {
      this.page = last;
      this.emitPageChange();
      this.savePage();
    }
  }

  toggleSort(col: { key: string }) {
    if (!this.enableSort) return;
    if (this.sortKey !== col.key) {
      this.sortKey = col.key;
      this.sortDir = 'asc';
    } else {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : this.sortDir ? undefined : 'asc';
      if (!this.sortDir) this.sortKey = undefined;
    }
    this.page = 1;
    this.emitPageChange();
    this.savePage();
  }

  private emitPageChange() {
    this.pageChange.emit({
      page: this.page,
      pageSize: this.pageSize,
      term: this.filterText.trim() || undefined,
      sortKey: this.sortKey,
      sortDir: this.sortDir,
    });
  }

  private savePage() {
    if (this.persistPage && this.tableId) {
      try {
        localStorage.setItem(`ui-table:page:${this.tableId}`, String(this.page));
      } catch {}
    }
  }
}
