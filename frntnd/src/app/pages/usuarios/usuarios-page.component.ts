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
import { UsuarioEntity } from '../../models/entities/usuario.entity';
import { USUARIO_SCHEMA } from '../../models/schema/usuario.schema';
import { TipoUsuarioEntity } from '../../models/entities/tipo-usuario.entity';
import { EstadoEntity } from '../../models/entities/estado.entity';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { onModalConfirmGeneric, onModalClosedGeneric } from '../page-utils';

/**
 * Componente para la gestión y listado de usuarios en el sistema.
 * Fecha             Autor                   Versión           Descripción
 * @date 28-12-2025 @author Gerardo Paiva   @version 1.0.0    @description Listado, edición y eliminación de usuarios.
 */
@Component({
  selector: 'page-usuarios',
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
  templateUrl: './usuarios-page.component.html',
  styleUrls: ['./usuarios-page.component.css'],
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
export class UsuariosPageComponent implements OnInit {
  title = 'Usuarios';
  subtitle = 'Usuarios';
  atributos: any[] = [];
  filtroNombre: string = '';
  filtroCorreo: string = '';
  filtroTipoUsuario: string = '';
  filtroEstado: string = '';
  estadoActivoId: string = '';
  filtroRol: string = '';
  filtroJerarquia: string = '';
  tiposUsuario: TipoUsuarioEntity[] = [];
  estados: EstadoEntity[] = [];
  roles: any[] = [];
  jerarquias: any[] = [];
  data: UsuarioEntity[] = [];
  formattedData: any[] = [];
  loading = false;
  error?: string;
  datosListos = false;
  camposLista: string[] = [];
  camposCrear: string[] = [];
  camposEditar: string[] = [];
  camposDetalle: string[] = [];
  total = 0;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  totalPages = 1;
  modalOpen = false;
  modalTitle = '';
  modalFields: any[] = [];
  modalValues: any = {};
  modalSaving = false;
  modalLoading = false;
  modalEditingId: any = null;
  modalDeleteMode = false;
  usuarioAEliminar: any = null;
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  /**
   * @description Constructor de la clase UsuariosPageComponent.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  constructor() {}

  /**
   * @description Método de inicialización del componente.
   * Carga los datos precargados por el Resolver o los obtiene de forma asíncrona.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  async ngOnInit() {
    const preloaded = this.route.snapshot.data['pre'];
    if (preloaded) {
      this.tiposUsuario = preloaded.tiposUsuario || [];
      this.estados = preloaded.estados || [];
      const estadoActivo = this.estados.find((e) => e.nombre?.toLowerCase() === 'activo');
      let usuariosFiltrados = preloaded.usuarios || [];
      if (estadoActivo) {
        this.estadoActivoId = String(estadoActivo.id_estado);
        this.filtroEstado = this.estadoActivoId;
        usuariosFiltrados = usuariosFiltrados.filter(
          (u: any) => String(u.id_estado) === String(this.estadoActivoId)
        );
      }
      this.roles = preloaded.roles || [];
      this.jerarquias = preloaded.jerarquias || [];
      this.procesarDatos(usuariosFiltrados, preloaded.total || usuariosFiltrados.length);
      this.datosListos = true;
    } else {
      await this.cargarDatosAsync();
    }
  }

  /**
   * @description Aplica los filtros de búsqueda sobre la lista de usuarios y luego limpia los campos de filtro.
   * @author Gerardo Paiva
   * @date 07-01-2026
   */
  aplicarFiltros() {
    let filtrados = this.data;
    if (this.filtroNombre) {
      const nombre = this.filtroNombre.toLowerCase();
      filtrados = filtrados.filter((u) =>
        (u.nombre_usuario || u.nombres || '').toLowerCase().includes(nombre)
      );
    }
    if (this.filtroCorreo) {
      const correo = this.filtroCorreo.toLowerCase();
      filtrados = filtrados.filter((u) =>
        (u.correo_electronico || '').toLowerCase().includes(correo)
      );
    }
    if (this.filtroTipoUsuario) {
      filtrados = filtrados.filter(
        (u) => String(u.id_tipo_usuario) === String(this.filtroTipoUsuario)
      );
    }
    if (this.filtroEstado) {
      filtrados = filtrados.filter((u) => String(u.id_estado) === String(this.filtroEstado));
    }
    if (this.filtroRol) {
      filtrados = filtrados.filter((u) => u.id_rol && String(u.id_rol) === String(this.filtroRol));
    }
    if (this.filtroJerarquia) {
      filtrados = filtrados.filter(
        (u) => u.id_jerarquia && String(u.id_jerarquia) === String(this.filtroJerarquia)
      );
    }
    this.procesarDatos(filtrados, filtrados.length);
    this.filtroNombre = '';
    this.filtroCorreo = '';
    this.filtroTipoUsuario = '';
    this.filtroEstado = '';
    this.filtroRol = '';
    this.filtroJerarquia = '';
  }

  /**
   * @description Limpia los campos de filtro y restaura la lista completa de usuarios.
   * @author Gerardo Paiva
   * @date 07-01-2026
   */
  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroCorreo = '';
    this.filtroTipoUsuario = '';
    this.filtroEstado = '';
    this.filtroRol = '';
    this.procesarDatos(this.data, this.data.length);
  }

  /**
   * @description Carga inicial (alias) usado por otras páginas para refrescar la lista.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  async load() {
    this.currentPage = 1;
    await this.cargarDatosAsync();
  }

  /**
   * Refresca los datos de la tabla de usuarios.
   */
  async refrescar(): Promise<void> {
    await this.cargarDatosAsync();
  }

  /**
   * @description Carga todos los datos requeridos de forma asíncrona y en orden.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
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
          tipos: this.api.get<any>('tipos_usuario'),
          estados: this.api.get<any>('estados'),
          roles: this.api.get<any>('roles', { desde: offset, limite: this.pageSize }),
          jerarquias: this.api.get<any>('jerarquias', { desde: offset, limite: this.pageSize }),
          usuariosRes: this.api.get<any>('usuarios', { desde: offset, limite: this.pageSize }),
        })
      );
      pending = false;
      this.ngZone.run(() => {
        const { tipos, estados, roles, jerarquias, usuariosRes } = results;
        // Manejo global de errores
        if (tipos?.error) {
          this.error = tipos.msg || 'Error al cargar tipos de usuario';
          this.tiposUsuario = [];
        } else {
          this.tiposUsuario = Array.isArray(tipos)
            ? tipos
            : (typeof tipos === 'object' && tipos !== null && Array.isArray((tipos as any)['tipos'])
                ? (tipos as any)['tipos']
                : Array.isArray((tipos as any)['tipos_usuario'])
                ? (tipos as any)['tipos_usuario']
                : Array.isArray((tipos as any)['data'])
                ? (tipos as any)['data']
                : []) || [];
        }
        if (estados?.error) {
          this.error = estados.msg || 'Error al cargar estados';
          this.estados = [];
        } else {
          this.estados = Array.isArray(estados)
            ? estados
            : (typeof estados === 'object' &&
              estados !== null &&
              Array.isArray((estados as any)['estados'])
                ? (estados as any)['estados']
                : Array.isArray((estados as any)['data'])
                ? (estados as any)['data']
                : []) || [];
        }
        if (roles?.error) {
          this.error = roles.msg || 'Error al cargar roles';
          this.roles = [];
        } else {
          this.roles = Array.isArray(roles)
            ? roles
            : (typeof roles === 'object' && roles !== null && Array.isArray((roles as any)['roles'])
                ? (roles as any)['roles']
                : Array.isArray((roles as any)['data'])
                ? (roles as any)['data']
                : []) || [];
        }
        if (jerarquias?.error) {
          this.error = jerarquias.msg || 'Error al cargar jerarquías';
          this.jerarquias = [];
        } else {
          this.jerarquias = Array.isArray(jerarquias)
            ? jerarquias
            : (typeof jerarquias === 'object' &&
              jerarquias !== null &&
              Array.isArray((jerarquias as any)['jerarquias'])
                ? (jerarquias as any)['jerarquias']
                : Array.isArray((jerarquias as any)['data'])
                ? (jerarquias as any)['data']
                : []) || [];
        }
        if (usuariosRes?.error) {
          this.error = usuariosRes.msg || 'Error al cargar usuarios';
          this.data = [];
          this.formattedData = [];
          this.loading = false;
          this.datosListos = false;
          this.cdr.detectChanges();
          return;
        }
        const rows = Array.isArray(usuariosRes)
          ? usuariosRes
          : Array.isArray(usuariosRes?.usuarios)
          ? usuariosRes.usuarios
          : [];
        this.procesarDatos(rows, usuariosRes?.total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        this.error = 'No se pudo cargar usuarios';
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
  }

  /**
   * @description Procesa los datos crudos de usuarios para la tabla.
   * Centraliza la lógica para usarla tanto en carga inicial como en refresco.
   */
  private procesarDatos(rows: any[], total: number) {
    // Mapear los nombres de las FK para mostrar en la tabla
    this.data = (Array.isArray(rows) ? rows : []).map((u: any) => {
      const nombre_rol =
        this.roles.find((r) => String(r.id_rol) === String(u.id_rol))?.nombre || '';
      const nombre_tipo_usuario =
        this.tiposUsuario.find((t) => String(t.id_tipo_usuario) === String(u.id_tipo_usuario))
          ?.nombre || '';
      const nombre_estado =
        this.estados.find((e) => String(e.id_estado) === String(u.id_estado))?.nombre || '';
      const nombre_jerarquia =
        this.jerarquias.find((j) => String(j.id_jerarquia) === String(u.id_jerarquia))?.nombre ||
        '';
      return {
        ...u,
        nombre_rol,
        nombre_tipo_usuario,
        nombre_estado,
        nombre_jerarquia,
      };
    });
    let camposLista: string[] = [];
    let camposCrear: string[] = [];
    let camposEditar: string[] = [];
    let camposDetalle: string[] = [];
    if (this.atributos && this.atributos.length > 0) {
      camposLista = this.atributos
        .filter((a: any) => a.ver_en_lista !== false && !a.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((a: any) => a.key || a.nombre || a.campo);
      camposCrear = this.atributos
        .filter((a: any) => a.ver_en_crear !== false && !a.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((a: any) => a.key || a.nombre || a.campo);
      camposEditar = this.atributos
        .filter((a: any) => a.ver_en_editar !== false && !a.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((a: any) => a.key || a.nombre || a.campo);
      camposDetalle = this.atributos
        .filter((a: any) => a.ver_en_detalle !== false && !a.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((a: any) => a.key || a.nombre || a.campo);
    } else {
      camposLista = (Array.isArray(USUARIO_SCHEMA) ? USUARIO_SCHEMA : [])
        .filter((f: any) => f.ver_en_lista && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
      camposCrear = (Array.isArray(USUARIO_SCHEMA) ? USUARIO_SCHEMA : [])
        .filter((f: any) => f.ver_en_crear && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
      camposEditar = (Array.isArray(USUARIO_SCHEMA) ? USUARIO_SCHEMA : [])
        .filter((f: any) => f.ver_en_editar && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
      camposDetalle = (Array.isArray(USUARIO_SCHEMA) ? USUARIO_SCHEMA : [])
        .filter((f: any) => f.ver_en_detalle && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
    }
    this.camposLista = camposLista;
    this.camposCrear = camposCrear;
    this.camposEditar = camposEditar;
    this.camposDetalle = camposDetalle;
    if (this.data && this.data.length > 0) {
      const keys = Object.keys(this.data[0]);
      this.formattedData = this.data.map((u: any) => {
        const obj: any = {};
        for (const k of keys) {
          obj[k] = u[k];
        }
        return obj;
      });
    } else {
      this.formattedData = [];
    }
    this.total = Number(total) || this.data.length || 0;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  /**
   * @description Maneja cambios de paginación, búsqueda y orden en la tabla.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
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

  /**
   * @description Maneja el cambio de tamaño de página, actualizando la paginación.
   * @author Gerardo Paiva
   * @date 07-01-2026
   * @param size El nuevo tamaño de página seleccionado.
   */
  onPageSizeChange(size: any) {
    this.pageSize = Number(size);
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.currentPage = 1;
  }

  /**
   * @description Notifica que la tabla está lista para renderizar y dispara detección de cambios.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  /**
   * Cambia el tema visual del sitio según selección.
   */
  cambiarEstilo(evt: Event): void {
    const sel = (evt.target as HTMLSelectElement)?.value || 'base';
    const theme = sel === 'modern' ? 'modern' : 'base';
    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      this.notify.warning('No se pudo cambiar el tema');
    }
  }

  /**
   * @description Abre el modal de creación de usuario y carga opciones en background.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  async openCreateModal() {
    this.modalTitle = 'Crear usuario';
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
        const rolOptions = (Array.isArray(this.roles) ? this.roles : [])
          .filter((r) => r)
          .map((r: any) => ({
            value:
              r.id_rol != null && r.id_rol !== '' && !isNaN(Number(r.id_rol))
                ? String(r.id_rol)
                : r.id != null && r.id !== '' && !isNaN(Number(r.id))
                ? String(r.id)
                : '',
            label:
              r.nombre ??
              r.label ??
              r.title ??
              r.descripcion ??
              r.nombre_rol ??
              r.rol ??
              r.name ??
              String(r.id_rol ?? r.id ?? ''),
          }));
        const tipoOptions = (Array.isArray(this.tiposUsuario) ? this.tiposUsuario : [])
          .filter((t) => t)
          .map((t: any) => ({
            value:
              t.id_tipo_usuario != null &&
              t.id_tipo_usuario !== '' &&
              !isNaN(Number(t.id_tipo_usuario))
                ? String(t.id_tipo_usuario)
                : t.id != null && t.id !== '' && !isNaN(Number(t.id))
                ? String(t.id)
                : '',
            label: t.nombre ?? t.title ?? String(t.id_tipo_usuario ?? t.id ?? ''),
          }));
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
        const jerarquiaOptions = (Array.isArray(this.jerarquias) ? this.jerarquias : [])
          .filter((j) => j)
          .map((j: any) => ({
            value:
              j.id_jerarquia != null && j.id_jerarquia !== '' && !isNaN(Number(j.id_jerarquia))
                ? String(j.id_jerarquia)
                : j.id != null && j.id !== '' && !isNaN(Number(j.id))
                ? String(j.id)
                : '',
            label:
              j.nombre ??
              j.label ??
              j.title ??
              j.descripcion ??
              j.nombre_jerarquia ??
              j.jerarquia ??
              j.name ??
              String(j.id_jerarquia ?? j.id ?? ''),
          }));
        this.modalFields = this.buildFields(
          { rolOptions, jerarquiaOptions, tipoOptions, estadoOptions },
          {},
          false
        );
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

  /**
   * @description Inicia el flujo de edición para un usuario (abre modal).
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  async onEdit(usuario: any) {
    try {
      await this.openEditModal(usuario);
      return;
    } catch (err: any) {
      this.notify.warning('No se pudo iniciar la edición del usuario: ' + (err?.message || ''));
    }
  }

  /**
   * @description Abrir modal de edición y precargar campos/valores.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  openEditModal(usuario: any) {
    this.modalTitle = 'Editar usuario';
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
      const uRow = usuario ? { ...usuario } : {};
      const id = uRow.id || uRow.id_usuario || uRow.ID;
      if (!id) throw new Error('Usuario sin ID');
      let uDetail = uRow;
      try {
        const res: any = firstValueFrom(this.api.get(`usuarios/${id}`));
        const payload = res?.data ?? res;
        if (payload) uDetail = { ...uDetail, ...payload };
      } catch (e) {
        console.warn('Usando datos de fila por error en detalle:', e);
      }
      if (!this.datosListos || !this.roles?.length) {
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
        const rolOptions = mapOpts(this.roles, 'id_rol', 'nombre');
        const tipoOptions = mapOpts(this.tiposUsuario, 'id_tipo_usuario', 'nombre');
        const estadoOptions = mapOpts(this.estados, 'id_estado', 'nombre');
        const jerarquiaOptions = mapOpts(this.jerarquias, 'id_jerarquia', 'nombre');
        console.log('[UsuariosPageComponent] Opciones de select:', {
          rolOptions,
          tipoOptions,
          estadoOptions,
          jerarquiaOptions,
        });
        this.modalFields = this.buildFields(
          { rolOptions, jerarquiaOptions, tipoOptions, estadoOptions },
          uDetail,
          true
        );
        const values: any = {};
        this.modalFields.forEach((f) => (values[f.key] = f.value));
        this.modalValues = values;
        this.modalEditingId = uDetail.id_usuario || id;
        if (typeof this.modalEditingId === 'string' && this.modalEditingId.includes('@')) {
          this.modalEditingId = uDetail.id_usuario || null;
        }
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar el usuario para edición');
      this.cdr.detectChanges();
    }
  }

  /**
   * @description Muestra confirmación para eliminar un usuario (abre modal de confirmación).
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  onRemove(usuario: any) {
    try {
      this.modalFields = [];
      this.modalValues = { nombre: usuario?.nombre ?? '' };
      this.modalTitle = 'Eliminar usuario';
      this.modalEditingId = Number(usuario?.id || usuario?.id_usuario || usuario?.ID);
      this.modalDeleteMode = true;
      this.modalLoading = false;
      this.modalOpen = true;
      setTimeout(() => this.cdr.detectChanges(), 0);
    } catch (err) {
      this.notify.warning('No se pudo iniciar la eliminación');
    }
  }

  /**
   * Confirma la acción del modal (crear/editar/borrar)
   */
  async onModalConfirm(): Promise<void> {
    try {
      console.log(
        '[onModalConfirm] Modal confirmado. Estado delete:',
        this.modalDeleteMode,
        'ID:',
        this.modalEditingId
      );
      const success = await onModalConfirmGeneric(this, 'usuarios');
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

  /**
   * Se ejecuta al cerrar el modal; limpia estado y delega al helper genérico.
   */
  onModalClosed(): void {
    try {
      onModalClosedGeneric(this);
    } catch (e) {
      this.notify.warning('Error al cerrar el modal');
    }
  }

  /**
   * Método legacy para compatibilidad; no realiza acción (no-op).
   */
  openNewUser(): void {}

  /**
   * @description Construye el array de campos del modal basándose en el modelo `usuario`.
   * Permite inyectar opciones (roles, jerarquías, tipos, estados) y valores por defecto.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  private buildFields(opts: any = {}, defaults: any = {}, isEdit: boolean = false) {
    const rolOptions = opts.rolOptions ?? [];
    const jerarquiaOptions = opts.jerarquiaOptions ?? [];
    const tipoOptions = opts.tipoOptions ?? [];
    const estadoOptions = opts.estadoOptions ?? [];
    const schemaFields = USUARIO_SCHEMA && Array.isArray(USUARIO_SCHEMA) ? USUARIO_SCHEMA : [];
    const fields: any[] = schemaFields.map((s: any) => {
      const key = s.key;
      const base: any = {
        key,
        label: s.label ?? key,
        type: s.type ?? 'text',
        readonly: !!s.readonly || (isEdit && !!s.readonlyOnEdit),
        verEnCrear: !!s.verEnCrear,
        verEnEditar: !!s.verEnEditar,
        verEnLista: !!s.verEnLista,
        hidden: isEdit ? !s.verEnEditar : !s.verEnCrear,
      };
      if (base.type === 'select') {
        if (key === 'id_rol') base.options = rolOptions;
        else if (key === 'id_jerarquia') base.options = jerarquiaOptions;
        else if (key === 'id_tipo_usuario') base.options = tipoOptions;
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
      if (key.endsWith('_usuario')) {
        const baseKey = key.replace(/_usuario$/, '');
        candidates.push(baseKey, 'nombre', 'name', 'username');
      }
      if (!key.startsWith('id_')) {
        if (key === 'id') {
          candidates.push('id_usuario', 'ID');
        } else if (key === 'nombre' || key === 'nombres') {
          candidates.push('name', 'nombre_usuario');
        } else if (key === 'correo_electronico') {
          candidates.push('correo', 'email');
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
          val[key] ?? // ej: val.id_rol
          val.id_usuario ??
          val.id_rol ??
          val.id_jerarquia ??
          val.id_tipo_usuario ??
          val.id_estado ??
          val;
      }
      if (typeof val === 'undefined') {
        if (key === 'correo_electronico') val = defaults.correo ?? '';
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

  /**
   * @description Devuelve las columnas visibles en la tabla de usuarios.
   * @author Gerardo Paiva
   * @date 07-01-2026
   */
  get columns(): { key: string; label: string }[] {
    return (Array.isArray(USUARIO_SCHEMA) ? USUARIO_SCHEMA : [])
      .filter((f) => f.verEnLista && !f.hidden)
      .map((f) => ({ key: f.key, label: f.label ?? f.key }));
  }
}
