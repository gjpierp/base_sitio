import {
  Component,
  inject,
  ChangeDetectorRef,
  OnInit,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { MENU_SCHEMA } from '../../models/schema/menu.schema';
import { MenuEntity } from '../../models/entities/menu.entity';
import { EstadoEntity } from '../../models/entities/estado.entity';
import { AplicacionSitioEntity } from '../../models/entities/aplicacion-sitio.entity';
import { NotificationService } from '../../services/notification.service';
import { onModalConfirmGeneric, onModalClosedGeneric } from '../page-utils';
/**
 * Componente para la gestión y listado de menús en el sistema.
 * Fecha             Autor                   Versión           Descripción
 * @date 28-12-2025 @author Gerardo Paiva   @version 1.0.0    @description Listado, edición y eliminación de usuarios.
 */
@Component({
  selector: 'page-menus',
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
  templateUrl: './menus-page.component.html',
  styleUrls: ['./menus-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class MenusPageComponent implements OnInit {
  // 1. Propiedades
  title = 'Menús';
  subtitle = 'Menús registrados en el Sistema';

  // Filtros de búsqueda
  filtroNombre: string = '';
  filtroEstado: string = '';
  filtroAplicacion: string = '';
  estadoActivoId: string = '';

  // Datos
  estados: EstadoEntity[] = [];
  aplicaciones: AplicacionSitioEntity[] = [];
  data: MenuEntity[] = [];
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
  menuAEliminar: any = null;

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
      this.aplicaciones = preloaded.aplicaciones || [];
      const estadoActivo = this.estados.find(
        (e: EstadoEntity) => e.nombre?.toLowerCase() === 'activo'
      );
      let menusFiltrados = preloaded.menus || [];
      if (estadoActivo) {
        this.estadoActivoId = String(estadoActivo.id_estado);
        this.filtroEstado = this.estadoActivoId;
        menusFiltrados = menusFiltrados.filter(
          (m: any) => String(m.id_estado) === String(this.estadoActivoId)
        );
      }
      this.procesarDatos(menusFiltrados, preloaded.total || menusFiltrados.length);
      this.datosListos = true;
    } else {
      this.cargarDatosAsync();
    }
  }

  // 3. Lógica de Filtros (ahora reactiva y consulta al backend)
  async aplicarFiltros() {
    this.currentPage = 1;
    await this.cargarDatosAsync();
  }

  async limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroEstado = '';
    this.filtroAplicacion = '';
    this.currentPage = 1;
    await this.cargarDatosAsync();
  }

  /**
   * Alias para recargar datos y sincronizar totales.
   */
  async load() {
    this.currentPage = 1;
    await this.cargarDatosAsync();
  }

  /**
   * Refresca los datos de la tabla de menús.
   */
  async refrescar(): Promise<void> {
    await this.cargarDatosAsync();
  }

  async cargarDatosAsync() {
    this.loading = true;
    this.error = undefined;
    try {
      const offset = (this.currentPage - 1) * this.pageSize;
      const params: any = {
        desde: offset,
        limite: this.pageSize,
      };
      // Filtrar por estado activo en la consulta
      if (this.estados?.length && !this.filtroEstado) {
        const estadoActivo = this.estados.find(
          (e: EstadoEntity) => e.nombre?.toLowerCase() === 'activo'
        );
        if (estadoActivo) {
          params.id_estado = estadoActivo.id_estado;
          this.filtroEstado = String(estadoActivo.id_estado);
        }
      } else if (this.filtroEstado) {
        params.id_estado = this.filtroEstado;
      }
      if (this.filtroNombre) params.nombre = this.filtroNombre;
      if (this.filtroAplicacion) params.id_aplicacion = this.filtroAplicacion;
      const results = await firstValueFrom(
        forkJoin({
          estados: this.api.get<any>('estados'),
          aplicaciones: this.api.get<any>('aplicaciones_sitio'),
          menusRes: this.api.get<any>('menus', params),
        })
      );
      this.ngZone.run(() => {
        // Manejo global de errores
        const estadosRaw = results.estados;
        if (estadosRaw?.error) {
          this.error = estadosRaw.msg || 'Error al cargar estados';
          this.estados = [];
        } else {
          this.estados = Array.isArray(estadosRaw?.estados)
            ? estadosRaw.estados
            : Array.isArray(estadosRaw)
            ? estadosRaw
            : Array.isArray(estadosRaw?.data)
            ? estadosRaw.data
            : [];
        }
        const appsRaw = results.aplicaciones;
        if (appsRaw?.error) {
          this.error = appsRaw.msg || 'Error al cargar aplicaciones';
          this.aplicaciones = [];
        } else {
          this.aplicaciones = Array.isArray(appsRaw?.aplicaciones)
            ? appsRaw.aplicaciones
            : Array.isArray(appsRaw)
            ? appsRaw
            : Array.isArray(appsRaw?.data)
            ? appsRaw.data
            : [];
        }
        const menusRaw = results.menusRes;
        if (menusRaw?.error) {
          this.error = menusRaw.msg || 'Error al cargar menús';
          this.data = [];
          this.formattedData = [];
          this.loading = false;
          this.datosListos = false;
          this.cdr.detectChanges();
          return;
        }
        const rows = Array.isArray(menusRaw?.menus)
          ? menusRaw.menus
          : Array.isArray(menusRaw)
          ? menusRaw
          : Array.isArray(menusRaw?.data)
          ? menusRaw.data
          : [];
        // Filtrar por estado "Activo" si existe
        const estadoActivo = this.estados.find(
          (e: EstadoEntity) => e.nombre?.toLowerCase() === 'activo'
        );
        let menusFiltrados = rows;
        if (estadoActivo) {
          this.estadoActivoId = String(estadoActivo.id_estado);
          this.filtroEstado = this.estadoActivoId;
          menusFiltrados = rows.filter(
            (m: any) => String(m.id_estado) === String(this.estadoActivoId)
          );
        }
        this.procesarDatos(menusFiltrados, menusRaw?.total || rows.length);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.error = 'No se pudo cargar menús';
      this.data = [];
      this.formattedData = [];
      this.loading = false;
      this.datosListos = false;
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // 4. Carga y Procesamiento de Datos
  private procesarDatos(rows: any[], total: number) {
    this.data = (Array.isArray(rows) ? rows : []).map((m: any) => ({
      ...m,
      id_menu: m['id_menu'] || m['id'] || '',
      nombre: m['nombre'] || '',
      url: m['url'] || m['ruta'] || '',
      icono: m['icono'] || '',
      id_menu_padre: m['id_menu_padre'] || '',
      id_aplicacion: m['id_aplicacion'] || '',
      id_estado: m['id_estado'] || '',
      orden: m['orden'] || '',
      visible: m['visible'] || '',
      nivel: m['nivel'] || '',
    }));
    this.formattedData = this.data.map((m) => ({
      ...m,
      id_menu: m['id_menu'] || '',
      nombre: m['nombre'] || '',
      url: m['url'] || '',
      icono: m['icono'] || '',
      id_menu_padre: m['id_menu_padre'] || '',
      id_aplicacion: m['id_aplicacion'] || '',
      id_estado: m['id_estado'] || '',
      orden: m['orden'] || '',
      visible: m['visible'] || '',
      nivel: m['nivel'] || '',
    }));
    this.total = Number(total) || this.data.length || 0;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  // 5. Eventos de Tabla (paginación reactiva)
  async onPageChange(evt: { page: number; pageSize: number }) {
    this.currentPage = Number(evt.page) || 1;
    this.pageSize = Number(evt.pageSize) || this.pageSize;
    await this.cargarDatosAsync();
  }

  async onPageSizeChange(size: any) {
    this.pageSize = Number(size);
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.currentPage = 1;
    await this.cargarDatosAsync();
  }

  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  cambiarEstilo(evt: Event): void {
    const sel = (evt.target as HTMLSelectElement)?.value || 'base';
    const theme = sel === 'modern' ? 'modern' : 'base';
    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      if (this.notify) this.notify.warning('No se pudo cambiar el tema');
    }
  }

  // 6. Gestión del Modal (Apertura, sin recarga innecesaria)
  async openCreateModal() {
    this.modalTitle = 'Crear menú';
    this.modalFields = [];
    this.modalValues = {};
    this.modalEditingId = null;
    this.modalDeleteMode = false;
    this.modalLoading = true;
    this.modalOpen = true;
    this.cdr.detectChanges();
    try {
      if (!this.datosListos || !this.estados?.length) {
        await this.cargarDatosAsync();
      }
      const opts = this.buildFieldOptions();
      this.modalFields = this.buildFields(opts, {}, false).map((f) =>
        f.key === 'id_menu_padre' ? { ...f, required: false } : f
      );
      const values: any = {};
      this.modalFields.forEach((f) => (values[f.key] = f.value));
      this.modalValues = values;
      this.modalLoading = false;
      this.cdr.detectChanges();
    } catch (err) {
      this.modalOpen = false;
      this.error = 'No se pudo preparar el formulario de menú';
      this.cdr.detectChanges();
    }
  }

  async onEdit(menu: any) {
    try {
      await this.openEditModal(menu);
      return;
    } catch (err: any) {
      this.error = 'No se pudo iniciar la edición del menú: ' + (err?.message || '');
    }
  }

  async openEditModal(menu: any) {
    this.modalTitle = 'Editar menú';
    this.modalFields = [];
    this.modalValues = {};
    this.modalDeleteMode = false;
    this.modalEditingId = null;
    this.modalLoading = true;
    this.modalOpen = true;
    this.cdr.detectChanges();
    try {
      const mRow = menu ? { ...menu } : {};
      const id = mRow.id_menu || mRow.id || mRow.ID;
      if (!id) throw new Error('Menú sin ID');
      let mDetail = mRow;
      try {
        const res: any = await firstValueFrom(this.api.get(`menus/${id}`));
        const payload = res?.data ?? res;
        if (payload) mDetail = { ...mDetail, ...payload };
      } catch (e) {
        console.warn('Usando datos de fila por error en detalle:', e);
      }
      if (!this.datosListos || !this.estados?.length) {
        await this.cargarDatosAsync();
      }
      const opts = this.buildFieldOptions();
      this.modalFields = this.buildFields(opts, mDetail, true).map((f) =>
        f.key === 'id_menu_padre' ? { ...f, required: false } : f
      );
      const values: any = {};
      this.modalFields.forEach((f) => (values[f.key] = f.value));
      this.modalValues = values;
      this.modalEditingId = mDetail.id_menu || id;
      this.modalLoading = false;
      this.cdr.detectChanges();
    } catch (err) {
      this.modalOpen = false;
      this.error = 'No se pudo cargar el menú para edición';
      this.cdr.detectChanges();
    }
  }

  /**
   * Muestra confirmación para eliminar un menú (abre modal de confirmación).
   */
  onRemove(menu: any) {
    try {
      this.modalFields = [];
      this.modalValues = { nombre: menu?.nombre ?? '' };
      this.modalTitle = 'Eliminar menú';
      this.modalEditingId = Number(menu?.id_menu || menu?.id || menu?.ID);
      this.modalDeleteMode = true;
      this.modalLoading = false;
      this.modalOpen = true;
      setTimeout(() => this.cdr.detectChanges(), 0);
    } catch (err) {
      this.error = 'No se pudo iniciar la eliminación';
    }
  }

  // 7. Gestión del Modal (Cierre y Confirmación)
  /**
   * Confirma la acción del modal (crear/editar/borrar)
   */
  async onModalConfirm(): Promise<void> {
    try {
      const success = await onModalConfirmGeneric(this, 'menus');
      this.modalOpen = false;
      this.modalDeleteMode = false;
      this.modalEditingId = null;
      this.cdr.detectChanges();
      if (!success) return;
      // Refrescar datos y tabla tras guardar
      await this.cargarDatosAsync();
      this.aplicarFiltros();
      // Actualizar localStorage con los menús actuales
      try {
        const menusActualizados = this.data ? JSON.stringify(this.data) : '[]';
        localStorage.setItem('menus', menusActualizados);
      } catch (e) {
        console.warn('No se pudo actualizar el localStorage de menús', e);
      }
      this.cdr.detectChanges();
    } catch (e) {
      this.error = 'Error al confirmar el modal';
    }
  }

  /**
   * Se ejecuta al cerrar el modal; limpia estado y delega al helper genérico si existe.
   */
  onModalClosed(): void {
    try {
      onModalClosedGeneric(this);
    } catch (e) {
      if (this.notify) this.notify.warning('Error al cerrar el modal');
    }
  }

  openNewMenu(): void {}

  private buildFields(opts: any = {}, defaults: any = {}, isEdit: boolean = false) {
    const estadoOptions = opts.estadoOptions ?? [];
    const aplicacionOptions = opts.aplicacionOptions ?? [];
    const padreOptions = opts.padreOptions ?? [];
    const schemaFields = MENU_SCHEMA && Array.isArray(MENU_SCHEMA) ? MENU_SCHEMA : [];
    const fields: any[] = schemaFields.map((s: any) => {
      const key = s.key;
      // Forzar que 'id_menu_padre' nunca sea requerido
      const isMenuPadre = key === 'id_menu_padre';
      const base: any = {
        key,
        label: s.label ?? key,
        type: s.type ?? 'text',
        readonly: !!s.readonly || (isEdit && !!s.readonlyOnEdit),
        verEnCrear: !!s.verEnCrear,
        verEnEditar: !!s.verEnEditar,
        verEnLista: !!s.verEnLista,
        hidden: isEdit ? !s.verEnEditar : !s.verEnCrear,
        required: isMenuPadre ? false : !!s.required,
      };
      if (base.type === 'select') {
        if (key === 'id_menu_padre') base.options = padreOptions;
        else if (key === 'id_aplicacion') base.options = aplicacionOptions;
        else if (key === 'id_estado') base.options = estadoOptions;
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
      if (!key.startsWith('id_')) {
        if (key === 'id') {
          candidates.push('id_menu', 'ID');
        } else if (key === 'nombre') {
          candidates.push('name', 'nombre_menu');
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
        val =
          val.id ??
          val[key] ??
          val.id_menu ??
          val.id_menu_padre ??
          val.id_aplicacion ??
          val.id_estado ??
          val;
      }
      if (typeof val === 'undefined') {
        if (key === 'nombre') val = defaults.name ?? '';
        else val = '';
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

  // 9. Helpers Privados y Utilidades
  private buildFieldOptions() {
    const mapOpts = (arr: any[], idKey: string, labelKey: string) =>
      (Array.isArray(arr) ? arr : [])
        .filter((x) => x)
        .map((x) => ({
          value: String(x[idKey] ?? x.id ?? ''),
          label: x[labelKey] ?? x.nombre ?? x.title ?? String(x[idKey] ?? ''),
        }));
    // Opciones para menú padre: solo menús activos (id_estado === estadoActivoId), excluye el propio si está en edición
    let padreOptions = mapOpts(
      this.data.filter((m) => String(m.id_estado) === String(this.estadoActivoId)),
      'id_menu',
      'nombre'
    );
    if (this.modalEditingId) {
      padreOptions = padreOptions.filter(
        (opt) => String(opt.value) !== String(this.modalEditingId)
      );
    }
    return {
      estadoOptions: mapOpts(this.estados, 'id_estado', 'nombre'),
      aplicacionOptions: mapOpts(this.aplicaciones, 'id_aplicacion', 'nombre'),
      padreOptions,
    };
  }

  /**
   * @description Devuelve las columnas visibles en la tabla de usuarios.
   * @author Gerardo Paiva
   * @date 07-01-2026
   */
  get columns(): { key: string; label: string }[] {
    return (Array.isArray(MENU_SCHEMA) ? MENU_SCHEMA : [])
      .filter((f) => f.verEnLista && !f.hidden)
      .map((f) => ({ key: f.key, label: f.label ?? f.key }));
  }
}
