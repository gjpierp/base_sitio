// Basado en usuarios-page.component.ts, adaptado para Tipos de Usuario
import {
  Component,
  inject,
  ChangeDetectorRef,
  OnInit,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { TIPO_USUARIO_SCHEMA } from '../../models/schema/tipo-usuario.schema';
import { TipoUsuarioEntity } from '../../models/entities/tipo-usuario.entity';
import { EstadoEntity } from '../../models/entities/estado.entity';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { onPageChangeGeneric, onModalConfirmGeneric, onModalClosedGeneric } from '../page-utils';

/**
 * Componente para la gestión y listado de tipos de usuario en el sistema.
 * Fecha             Autor                   Versión           Descripción
 * @date 08-01-2026 @author Copilot         @version 1.0.0    @description Listado, edición y eliminación de tipos de usuario.
 */
@Component({
  selector: 'page-tipos-usuarios',
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
  templateUrl: './tipos-usuarios-page.component.html',
  styleUrls: ['./tipos-usuarios-page.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [
    `
      :host ::ng-deep th:last-child,
      :host ::ng-deep td:last-child {
        text-align: center !important;
      }
      :host ::ng-deep td:last-child > div {
        justify-content: center !important;
      }
    `,
  ],
})
export class TiposUsuariosPageComponent implements OnInit {
  // 1. Propiedades
  title = 'Tipos de Usuario';
  subtitle = 'Tipos de Usuario';

  // Filtros de búsqueda
  filtroNombre: string = '';
  filtroEstado: string = '';
  estadoActivoId: string = '';

  // Datos
  estados: EstadoEntity[] = [];
  data: TipoUsuarioEntity[] = [];
  formattedData: any[] = [];

  // Estado de carga
  loading = false;
  error?: string;
  datosListos = false;

  // Paginación
  total = 0;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  totalPages = 1;

  // Modal
  modalOpen = false;
  modalTitle = '';
  modalFields: any[] = [];
  modalValues: any = {};
  modalSaving = false;
  modalLoading = false;
  modalEditingId: any = null;
  modalDeleteMode = false;
  tipoUsuarioAEliminar: any = null;

  // Inyecciones
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  constructor() {}

  // 2. Ciclo de Vida
  ngOnInit(): void {
    const preloaded = this.route.snapshot.data['pre'];
    if (preloaded) {
      this.estados = preloaded.estados || [];
      const estadoActivo = this.estados.find((e) => e.nombre?.toLowerCase() === 'activo');
      let tiposFiltrados = preloaded.tiposUsuarios || [];
      if (estadoActivo) {
        this.estadoActivoId = String(estadoActivo.id_estado);
        this.filtroEstado = this.estadoActivoId;
        tiposFiltrados = tiposFiltrados.filter(
          (t: any) => String(t.id_estado) === String(this.estadoActivoId)
        );
      }
      this.procesarDatos(tiposFiltrados, preloaded.total || tiposFiltrados.length);
      this.datosListos = true;
    } else {
      this.cargarDatosAsync();
    }
  }

  // 3. Lógica de Filtros
  aplicarFiltros() {
    let filtrados = this.data;
    if (this.filtroNombre) {
      const nombre = this.filtroNombre.toLowerCase();
      filtrados = filtrados.filter((t) => (t.nombre || '').toLowerCase().includes(nombre));
    }
    if (this.filtroEstado) {
      filtrados = filtrados.filter((t) => String(t.id_estado) === String(this.filtroEstado));
    }
    this.formattedData = filtrados;
    this.total = filtrados.length;
    this.filtroNombre = '';
    this.filtroEstado = '';
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroEstado = '';
    this.formattedData = this.data;
    this.total = this.data.length;
  }

  // 4. Carga y Procesamiento de Datos
  async load() {
    this.currentPage = 1;
    await this.cargarDatosAsync();
  }

  async refrescar(): Promise<void> {
    await this.cargarDatosAsync();
  }

  async cargarDatosAsync() {
    let pending = true;
    setTimeout(() => {
      if (pending) {
        this.loading = true;
      }
    });
    this.error = undefined;
    try {
      const offset = (this.currentPage - 1) * this.pageSize;
      const results = await firstValueFrom(
        forkJoin({
          estados: this.api.get<any>('estados'),
          tiposUsuariosRes: this.api.get<any>('tipos_usuario', {
            desde: offset,
            limite: this.pageSize,
          }),
        })
      );
      pending = false;
      this.ngZone.run(() => {
        const { estados, tiposUsuariosRes } = results;
        // Manejo global de errores
        if (estados?.error) {
          this.error = estados.msg || 'Error al cargar estados';
          this.estados = [];
        } else {
          this.estados = Array.isArray(estados)
            ? estados
            : (typeof estados === 'object' &&
                estados !== null &&
                (Array.isArray((estados as any)['estados'])
                  ? (estados as any)['estados']
                  : Array.isArray((estados as any)['data'])
                  ? (estados as any)['data']
                  : [])) ||
              [];
        }
        if (tiposUsuariosRes?.error) {
          this.error = tiposUsuariosRes.msg || 'Error al cargar tipos de usuario';
          this.data = [];
          this.formattedData = [];
          this.loading = false;
          this.datosListos = false;
          this.cdr.detectChanges();
          return;
        }
        const rows = Array.isArray(tiposUsuariosRes)
          ? tiposUsuariosRes
          : tiposUsuariosRes?.tipos_usuario || tiposUsuariosRes?.data || [];
        this.procesarDatos(rows, tiposUsuariosRes?.total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        this.error = 'No se pudo cargar tipos de usuario';
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
  }

  private procesarDatos(rows: any[], total: number) {
    this.data = (Array.isArray(rows) ? rows : []).map((t: any) => ({
      ...t,
      nombre: t['nombre'] || '',
      descripcion: t['descripcion'] || '',
      nombre_estado: t['nombre_estado'] || '',
    }));
    this.formattedData = this.data.map((t) => ({
      ...t,
      nombre: t['nombre'] || '',
      descripcion: t['descripcion'] || '',
      nombre_estado: t['nombre_estado'] || '',
    }));
    this.total = Number(total) || this.data.length || 0;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  // 5. Eventos de Tabla
  onPageChange(evt: {
    page: number;
    pageSize: number;
    term?: string;
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    this.currentPage = Number(evt.page) || 1;
    this.pageSize = Number(evt.pageSize) || this.pageSize;
    if (typeof this.cargarDatosAsync === 'function') {
      this.cargarDatosAsync();
    } else if (typeof this.load === 'function') {
      this.load();
    } else if (typeof this.refrescar === 'function') {
      this.refrescar();
    }
  }

  onPageSizeChange(size: any) {
    this.pageSize = Number(size);
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.currentPage = 1;
  }

  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  // 6. Gestión del Modal (Apertura)
  async openCreateModal() {
    this.modalTitle = 'Crear tipo de usuario';
    this.modalFields = [];
    this.modalValues = {};
    this.modalEditingId = null;
    this.modalDeleteMode = false;
    this.modalLoading = true;
    this.modalOpen = false;
    this.cdr.detectChanges();
    this.modalOpen = true;
    this.cdr.detectChanges();
    try {
      if (!this.datosListos) {
        await this.cargarDatosAsync();
      }
      this.ngZone.run(() => {
        const estadoOptions = (Array.isArray(this.estados) ? this.estados : [])
          .filter((e) => e)
          .map((e: any) => ({
            value:
              e.id_estado != null && e.id_estado !== '' && !isNaN(Number(e.id_estado))
                ? String(e.id_estado)
                : e.id != null && e.id !== '' && !isNaN(Number(e.id))
                ? String(e.id)
                : '',
            label: e.nombre ?? e.title ?? String(e.id_estado ?? e.id ?? ''),
          }));
        this.modalFields = this.buildFields({ estadoOptions }, {}, false);
        this.modalValues = {};
        for (const f of this.modalFields) {
          if (f.type === 'select') {
            this.modalValues[f.key] = f.value != null && f.value !== '' ? f.value : null;
          } else {
            this.modalValues[f.key] = f.value ?? '';
          }
        }
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.cdr.detectChanges();
    }
  }

  async onEdit(tipoUsuario: any) {
    try {
      await this.openEditModal(tipoUsuario);
      return;
    } catch (err: any) {
      this.notify.warning(
        'No se pudo iniciar la edición del tipo de usuario: ' + (err?.message || '')
      );
    }
  }

  openEditModal(tipoUsuario: any) {
    this.modalTitle = 'Editar tipo de usuario';
    this.modalFields = [];
    this.modalValues = {};
    this.modalDeleteMode = false;
    this.modalEditingId = null;
    this.modalLoading = true;
    this.modalOpen = false;
    this.cdr.detectChanges();
    this.modalOpen = true;
    this.cdr.detectChanges();
    try {
      const tRow = tipoUsuario ? { ...tipoUsuario } : {};
      const id = tRow.id || tRow.id_tipo_usuario || tRow.ID;
      if (!id) throw new Error('Tipo de usuario sin ID');
      let tDetail = tRow;
      try {
        const res: any = firstValueFrom(this.api.get(`tipos_usuario/${id}`));
        const payload = res?.data ?? res;
        if (payload) tDetail = { ...tDetail, ...payload };
      } catch (e) {
        console.warn('Usando datos de fila por error en detalle:', e);
      }
      if (!this.datosListos) {
        this.cargarDatosAsync();
      }
      this.ngZone.run(() => {
        const mapOpts = (arr: any[], idKey: string, labelKey: string) =>
          (Array.isArray(arr) ? arr : [])
            .filter((x) => x)
            .map((x) => ({
              value: String(x[idKey] ?? x.id ?? ''),
              label: x[labelKey] ?? x.nombre ?? x.title ?? String(x[idKey] ?? ''),
            }));
        const estadoOptions = mapOpts(this.estados, 'id_estado', 'nombre');
        this.modalFields = this.buildFields({ estadoOptions }, tDetail, true);
        const values: any = {};
        this.modalFields.forEach((f) => (values[f.key] = f.value));
        this.modalValues = values;
        this.modalEditingId = tDetail.id_tipo_usuario || id;
        if (typeof this.modalEditingId === 'string' && this.modalEditingId.includes('@')) {
          this.modalEditingId = tDetail.id_tipo_usuario || null;
        }
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar el tipo de usuario para edición');
      this.cdr.detectChanges();
    }
  }

  onRemove(tipoUsuario: any) {
    try {
      this.modalFields = [];
      this.modalValues = { nombre: tipoUsuario?.nombre ?? '' };
      this.modalTitle = 'Eliminar tipo de usuario';
      this.modalEditingId = Number(
        tipoUsuario?.id || tipoUsuario?.id_tipo_usuario || tipoUsuario?.ID
      );
      this.modalDeleteMode = true;
      this.modalLoading = false;
      this.modalOpen = true;
      setTimeout(() => this.cdr.detectChanges(), 0);
    } catch (err) {
      this.notify.warning('No se pudo iniciar la eliminación');
    }
  }

  // 7. Gestión del Modal (Cierre y Confirmación)
  async onModalConfirm(): Promise<void> {
    try {
      const success = await onModalConfirmGeneric(this, 'tipos_usuario');
      this.modalOpen = false;
      this.modalDeleteMode = false;
      this.modalEditingId = null;
      this.cdr.detectChanges();
      if (!success) return;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.cargarDatosAsync();
      this.cdr.detectChanges();
    } catch (e) {
      this.notify.warning('Error al confirmar el modal');
    }
  }

  onModalClosed(): void {
    try {
      onModalClosedGeneric(this);
    } catch (e) {
      this.notify.warning('Error al cerrar el modal');
    }
  }

  openNewTipoUsuario(): void {}

  // 8. Helpers Privados
  private buildFields(opts: any = {}, defaults: any = {}, isEdit: boolean = false) {
    const estadoOptions = opts.estadoOptions ?? [];
    const schemaFields =
      TIPO_USUARIO_SCHEMA && Array.isArray(TIPO_USUARIO_SCHEMA) ? TIPO_USUARIO_SCHEMA : [];
    const fields: any[] = schemaFields.map((s: any) => {
      const key = s.key;
      const base: any = {
        key,
        label: s.label ?? key,
        type: s.type ?? 'text',
        readonly: !!s.readonly || (isEdit && !!s.readonlyOnEdit),
        hiddenOnCreate: !!s.hiddenOnCreate,
        hiddenOnEdit: !!s.hiddenOnEdit,
        hidden: !!s.hidden || (isEdit ? !!s.hiddenOnEdit : !!s.hiddenOnCreate),
      };
      if (base.type === 'select') {
        if (key === 'id_estado') base.options = estadoOptions;
        else if (
          key === 'activo' ||
          key === 'habilitado' ||
          key === 'visible' ||
          key === 'borrado'
        ) {
          base.options = [
            { value: 'true', label: 'Sí' },
            { value: 'false', label: 'No' },
          ];
        }
      }
      const candidates: string[] = [];
      candidates.push(key);
      if (s.alias) candidates.push(s.alias);
      if (key.startsWith('id_')) {
        const baseKey = key.slice(3);
        candidates.push(baseKey, `${baseKey}_id`, `${baseKey}Id`);
        candidates.push(`${baseKey}_nombre`, `nombre_${baseKey}`, `${baseKey}_name`);
      }
      if (key.endsWith('_tipo_usuario')) {
        const baseKey = key.replace(/_tipo_usuario$/, '');
        candidates.push(baseKey, 'nombre', 'name');
      }
      if (!key.startsWith('id_')) {
        if (key === 'id') {
          candidates.push('id_tipo_usuario', 'ID');
        } else if (key === 'nombre') {
          candidates.push('name');
        }
      }
      let val: any = undefined;
      for (const k of candidates) {
        if (!k) continue;
        if (
          Object.prototype.hasOwnProperty.call(defaults, k) &&
          typeof defaults[k] !== 'undefined'
        ) {
          val = defaults[k];
          break;
        }
      }
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        val = val.id ?? val[key] ?? val.id_tipo_usuario ?? val.id_estado ?? val;
      }
      if (typeof val === 'undefined') {
        val = '';
      }
      let strVal = val == null ? '' : String(val);
      if (base.type === 'select' && Array.isArray(base.options) && strVal !== '') {
        const matchValue = base.options.find((o: any) => String(o.value) === strVal);
        if (!matchValue) {
          const matchLabel = base.options.find(
            (o: any) => o.label && String(o.label).toLowerCase() === strVal.toLowerCase()
          );
          if (matchLabel) {
            strVal = String(matchLabel.value);
          }
        }
      }
      base.value = strVal;
      return base;
    });
    return fields;
  }

  /**
   * @description Devuelve las columnas visibles en la tabla de usuarios.
   * @author Gerardo Paiva
   * @date 07-01-2026
   */
  get columns(): { key: string; label: string }[] {
    return (Array.isArray(TIPO_USUARIO_SCHEMA) ? TIPO_USUARIO_SCHEMA : [])
      .filter((f) => f.verEnLista && !f.hidden)
      .map((f) => ({ key: f.key, label: f.label ?? f.key }));
  }
}
