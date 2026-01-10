import { Component, inject, ChangeDetectorRef, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { ApiService } from '../../services/api.service';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';

@Component({
  selector: 'page-auditoria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiButtonComponent,
    UiCardComponent,
    UiSpinnerComponent,
    UiEntityTableComponent,
    UiModalComponent,
  ],
  templateUrl: './auditoria-page.component.html',
  styleUrls: ['./auditoria-page.component.css'],
})
export class AuditoriaPageComponent implements OnInit {
  // 1. Propiedades
  title = 'Auditoría';
  subtitle = 'Registro de actividades del sistema';

  // Filtros
  filtroUsuario: string = '';
  filtroAccion: string = '';
  filtroEntidad: string = '';

  // Datos
  usuariosLista: any[] = []; // Para el select de filtros
  data: any[] = [];
  formattedData: any[] = [];

  // Estado de carga
  loading = false;
  error?: string;
  datosListos = false;

  // Paginación
  totalRegistros = 0;
  total = 0;
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;
  sortKey = 'fecha';
  sortDir = 'desc';

  // Modal (Solo lectura para ver detalles)
  modalOpen = false;
  modalTitle = '';
  modalFields: any[] = [];
  modalValues: any = {};
  modalLoading = false;

  // Inyecciones
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private ngZone = inject(NgZone);

  // 2. Ciclo de Vida
  ngOnInit(): void {
    const preloaded = this.route.snapshot.data['pre'];
    if (preloaded) {
      this.usuariosLista = preloaded.usuarios || [];
      const auditoria = preloaded.auditoria || [];
      this.procesarDatos(auditoria, preloaded.total || auditoria.length);
      this.datosListos = true;
    } else {
      this.cargarDatosAsync();
    }
  }

  // 3. Lógica de Filtros
  aplicarFiltros() {
    let filtrados = this.data;
    if (this.filtroUsuario) {
      filtrados = filtrados.filter((r) => String(r.id_usuario) === String(this.filtroUsuario));
    }
    if (this.filtroAccion) {
      const term = this.filtroAccion.toLowerCase();
      filtrados = filtrados.filter((r) => (r.accion || '').toLowerCase().includes(term));
    }
    if (this.filtroEntidad) {
      const term = this.filtroEntidad.toLowerCase();
      filtrados = filtrados.filter((r) => (r.entidad || '').toLowerCase().includes(term));
    }
    this.formattedData = filtrados;
    this.total = filtrados.length;
    // Nota: En producción con paginación real, aquí se llamaría a cargarDatosAsync() con params
  }

  limpiarFiltros() {
    this.filtroUsuario = '';
    this.filtroAccion = '';
    this.filtroEntidad = '';
    this.formattedData = this.data;
    this.total = this.data.length;
  }

  // 4. Carga y Procesamiento
  async load() {
    await this.cargarDatosAsync();
  }

  async cargarDatosAsync() {
    let pending = true;
    setTimeout(() => {
      if (pending) this.loading = true;
    });
    this.error = undefined;

    try {
      const offset = (this.currentPage - 1) * this.pageSize;
      const results = await firstValueFrom(
        forkJoin({
          auditoriaRes: this.api.get<any>('auditoria', { desde: offset, limite: this.pageSize }),
          usuariosRes: this.api.get<any>('usuarios', { limite: 1000 }),
        })
      );
      pending = false;
      this.ngZone.run(() => {
        // Usuarios para el filtro
        let usuariosLista: any[] = [];
        try {
          const usuariosRes = results.usuariosRes;
          if (usuariosRes && !usuariosRes.error) {
            usuariosLista = usuariosRes?.usuarios || usuariosRes?.data || usuariosRes?.items || [];
          }
        } catch {}
        this.usuariosLista = Array.isArray(usuariosLista) ? usuariosLista : [];

        // Auditoría
        let rows: any[] = [];
        let total = 0;
        try {
          const audRes = results.auditoriaRes;
          if (audRes && !audRes.error) {
            rows = audRes?.auditorias || audRes?.data || audRes?.items || [];
            total = audRes?.total ?? rows.length;
          }
        } catch {}
        this.procesarDatos(Array.isArray(rows) ? rows : [], total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        // Manejo robusto de errores de red y autenticación
        const status = (err as any)?.status;
        if (status === 401) {
          this.error = 'No autorizado. Por favor, inicia sesión.';
        } else if ((err as any)?.msg) {
          this.error = (err as any).msg;
        } else {
          this.error = 'No se pudo cargar auditoría';
        }
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
  }

  private procesarDatos(rows: any[], total: number) {
    this.data = (Array.isArray(rows) ? rows : []).map((r: any) => ({
      ...r,
      id: r.id_auditoria ?? r.id,
      usuario_nombre: r.usuario?.nombre_usuario ?? r.nombre_usuario ?? r.usuario ?? 'Sistema',
      fecha_fmt: r.fecha ? new Date(r.fecha).toLocaleString() : '',
      detalles_str: typeof r.detalles === 'object' ? JSON.stringify(r.detalles) : r.detalles,
    }));
    this.formattedData = [...this.data];
    this.totalRegistros = Number(total) || this.data.length || 0;
    this.total = this.totalRegistros;
    this.totalPages = Math.max(1, Math.ceil(this.totalRegistros / this.pageSize));
  }

  // 5. Eventos de Tabla
  onPageChange(evt: {
    page: number;
    pageSize: number;
    term?: string;
    sortKey?: string;
    sortDir?: string;
  }) {
    this.currentPage = Number(evt.page) || 1;
    this.pageSize = Number(evt.pageSize) || 20;
    this.sortKey = evt.sortKey || 'fecha';
    this.sortDir = evt.sortDir || 'desc';
    this.cargarDatosAsync();
  }

  // 6. Modal de Detalle (Read-only)
  onView(item: any) {
    this.modalTitle = 'Detalle de Auditoría';
    this.modalFields = [];
    this.modalValues = {};
    this.modalLoading = true;
    this.modalOpen = true;
    this.cdr.detectChanges();

    this.ngZone.run(() => {
      this.modalFields = [
        { key: 'fecha_fmt', label: 'Fecha', type: 'text', readonly: true },
        { key: 'usuario_nombre', label: 'Usuario', type: 'text', readonly: true },
        { key: 'accion', label: 'Acción', type: 'text', readonly: true },
        { key: 'entidad', label: 'Entidad', type: 'text', readonly: true },
        { key: 'ip', label: 'IP', type: 'text', readonly: true },
        { key: 'detalles_str', label: 'Detalles', type: 'textarea', readonly: true },
      ];

      this.modalValues = { ...item };
      this.modalLoading = false;
      this.cdr.detectChanges();
    });
  }

  // Acciones no soportadas en auditoría (pero requeridas por la interfaz de tabla si se usan botones genéricos)
  onEdit(item: any) {
    this.onView(item);
  }
  onRemove(item: any) {
    /* No-op */
  }

  onModalClosed() {
    this.modalOpen = false;
    this.modalFields = [];
    this.modalValues = {};
  }

  onModalConfirm() {
    this.modalOpen = false;
  }

  // 7. Getters
  get columns() {
    return [
      { key: 'fecha_fmt', label: 'Fecha' },
      { key: 'usuario_nombre', label: 'Usuario' },
      { key: 'accion', label: 'Acción' },
      { key: 'entidad', label: 'Entidad' },
      { key: 'ip', label: 'IP' },
    ];
  }
}
