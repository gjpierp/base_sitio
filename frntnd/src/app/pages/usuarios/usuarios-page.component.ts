import {
  Component,
  inject,
  ChangeDetectorRef,
  OnInit,
  ViewChild,
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
import { User, USUARIO_SCHEMA } from '../../models/usuario';
import { TipoUsuario } from '../../models/tipo-usuario';
import { Estado } from '../../models/estado';
import { Roles } from '../../models/roles';
import { Jerarquias } from '../../models/jerarquias';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { onPageChangeGeneric, onModalConfirmGeneric, onModalClosedGeneric } from '../page-utils';

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
  changeDetection: ChangeDetectionStrategy.Default,
})
export class UsuariosPageComponent implements OnInit {
  /**
   * @description Inicio de Variables
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  title = 'Usuarios';
  subtitle = 'Usuarios';
  tiposUsuario: TipoUsuario[] = [];
  estados: Estado[] = [];
  roles: any[] = [];
  jerarquias: any[] = [];
  data: User[] = [];
  formattedData: any[] = [];
  loading = false;
  error?: string;
  datosListos = false;
  totalUsuarios = 0;
  total = 0;
  usuarioAEliminar: any = null;
  modalOpen = false;
  modalTitle = '';
  modalFields: any[] = [];
  modalValues: any = {};
  modalSaving = false;
  modalLoading = false;
  modalEditingId: any = null;
  modalDeleteMode = false;
  currentPage = 1;

  @ViewChild('modalRef') modalComp: any;

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
  ngOnInit(): void {
    // Verificar si el Resolver ya trajo los datos para evitar recarga y parpadeos
    const preloaded = this.route.snapshot.data['pre'];
    if (preloaded) {
      this.tiposUsuario = preloaded.tiposUsuario || [];
      this.estados = preloaded.estados || [];
      this.roles = preloaded.roles || [];
      this.jerarquias = preloaded.jerarquias || [];
      this.procesarDatosUsuarios(preloaded.usuarios || [], preloaded.total || 0);
      this.datosListos = true;
    } else {
      this.cargarDatosAsync();
    }
  }
  /**
   * @description Abrir modal de edición y precargar campos/valores.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  async openEditModal(usuario: any) {
    this.modalTitle = 'Editar usuario';
    this.modalFields = [];
    this.modalValues = {};
    this.modalDeleteMode = false;
    this.modalLoading = true;
    this.modalOpen = true;
    this.cdr.detectChanges();

    try {
      // Asignar el id del usuario para edición, usando el id del usuario actualizado desde la base de datos
      let u: any = usuario ? JSON.parse(JSON.stringify(usuario)) : {};
      const idToFetch = u?.id || u?.id_usuario || u?.ID || null;
      if (!idToFetch) {
        this.notify.warning('Error: No se pudo obtener el ID del usuario para editar.');
        this.modalOpen = false;
        this.cdr.detectChanges();
        return;
      }
      if (idToFetch) {
        const detailResp: any = await firstValueFrom(
          this.api.get(`usuarios/${idToFetch}`) as any
        ).catch(() => null);
        if (detailResp) {
          const payload = detailResp?.data ?? detailResp;
          if (payload && typeof payload === 'object') u = { ...u, ...payload };
          // Asignar el id desde la base de datos
          this.modalEditingId = u?.id_usuario || u?.id || u?.ID || null;
          // Si el id es un string y parece un correo, descartar y buscar el id numérico
          if (typeof this.modalEditingId === 'string' && this.modalEditingId.includes('@')) {
            this.modalEditingId = u?.id_usuario || null;
          }
        } else {
          this.modalEditingId = idToFetch;
          // Validación extra si no se pudo cargar detalle
          if (typeof this.modalEditingId === 'string' && this.modalEditingId.includes('@')) {
            this.modalEditingId = u?.id_usuario || null;
          }
        }
      } else {
        this.modalEditingId = null;
      }
      if (!this.datosListos) {
        await this.cargarDatosAsync();
      }

      this.ngZone.run(() => {
        const rolOptions = (Array.isArray(this.roles) ? this.roles : []).map((r: any) => ({
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
        const tipoOptions = (Array.isArray(this.tiposUsuario) ? this.tiposUsuario : []).map(
          (t: any) => ({
            value:
              t.id_tipo_usuario != null &&
              t.id_tipo_usuario !== '' &&
              !isNaN(Number(t.id_tipo_usuario))
                ? String(t.id_tipo_usuario)
                : t.id != null && t.id !== '' && !isNaN(Number(t.id))
                ? String(t.id)
                : '',
            label: t.nombre ?? t.title ?? String(t.id_tipo_usuario ?? t.id ?? ''),
          })
        );
        const estadoOptions = (Array.isArray(this.estados) ? this.estados : []).map((e: any) => ({
          value:
            e.id_estado != null && e.id_estado !== '' && !isNaN(Number(e.id_estado))
              ? String(e.id_estado)
              : e.id != null && e.id !== '' && !isNaN(Number(e.id))
              ? String(e.id)
              : '',
          label: e.nombre ?? e.title ?? String(e.id_estado ?? e.id ?? ''),
        }));
        const jerarquiaOptions = (Array.isArray(this.jerarquias) ? this.jerarquias : []).map(
          (j: any) => ({
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
          })
        );
        this.modalFields = this.buildUsuarioFields(
          { rolOptions, jerarquiaOptions, tipoOptions, estadoOptions },
          u,
          true
        );
        this.modalValues = {};
        for (const f of this.modalFields) {
          this.modalValues[f.key] = f.value;
        }
        this.modalLoading = false;
        this.modalOpen = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar la información del usuario');
      this.cdr.detectChanges();
    }
  }
  /**
   * @description Construye el array de campos del modal basándose en el modelo `usuario`.
   * Permite inyectar opciones (roles, jerarquías, tipos, estados) y valores por defecto.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  private buildUsuarioFields(opts: any = {}, defaults: any = {}, isEdit: boolean = false) {
    const rolOptions = opts.rolOptions ?? [];
    const jerarquiaOptions = opts.jerarquiaOptions ?? [];
    const tipoOptions = opts.tipoOptions ?? [];
    const estadoOptions = opts.estadoOptions ?? [];
    const schemaFields =
      USUARIO_SCHEMA && Array.isArray(USUARIO_SCHEMA.fields) ? USUARIO_SCHEMA.fields : [];
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
      // Opciones para campos select
      if (base.type === 'select') {
        if (key === 'id_rol') base.options = rolOptions;
        if (key === 'id_jerarquia') base.options = jerarquiaOptions;
        if (key === 'id_tipo_usuario') base.options = tipoOptions;
        if (key === 'id_estado') base.options = estadoOptions;
        if (key === 'activo') {
          base.options = [
            { value: 'true', label: 'Sí' },
            { value: 'false', label: 'No' },
          ];
        }
      }
      // value: try multiple candidate keys in defaults (key, alias, sensible fallbacks)
      const candidates: string[] = [];
      candidates.push(key);
      if (s.alias) candidates.push(s.alias);
      if (key.startsWith('id_')) {
        const baseKey = key.slice(3);
        // Priorizar claves que sugieran ID o el objeto completo
        candidates.push(baseKey, `${baseKey}_id`, `${baseKey}Id`);
        // Restaurar búsqueda por nombre específico para permitir el match por etiqueta (Label Match)
        candidates.push(`${baseKey}_nombre`, `nombre_${baseKey}`, `${baseKey}_name`);
      }
      if (key.endsWith('_usuario')) {
        const baseKey = key.replace(/_usuario$/, '');
        candidates.push(baseKey, 'nombre', 'name', 'username');
      }

      // Fallbacks genéricos solo si NO es un campo de ID (evita asignar nombre de usuario a id_rol)
      if (!key.startsWith('id_')) {
        if (key === 'id') {
          candidates.push('id_usuario', 'ID');
        } else {
          candidates.push(key.replace(/_/g, ''), 'nombre', 'name', 'correo', 'correo_electronico');
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

      // FIX: Si el valor es un objeto (ej: { id: 1, nombre: 'Admin' }), extraer el ID
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

      // Asegurar que el valor sea string para coincidir con las opciones del select (que son strings)
      let strVal = val == null ? '' : String(val);

      // Lógica de recuperación inteligente para Selects:
      // Si el valor no coincide con ninguna opción por 'value', intentar buscar por 'label'
      // (ej. si el backend devuelve "Administrador" en vez de "1")
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
   * @description Procesa los datos crudos de usuarios para la tabla.
   * Centraliza la lógica para usarla tanto en carga inicial como en refresco.
   */
  private procesarDatosUsuarios(rows: any[], total: number) {
    this.data = (Array.isArray(rows) ? rows : []).map((u: any) => ({
      ...u,
      nombre_usuario: u['nombre_usuario'] || u['nombre'] || u['name'] || '',
      correo_electronico: u['correo_electronico'] || u['correo'] || '',
      nombres: u['nombres'] || '',
      apellidos: u['apellidos'] || '',
      nombre_rol: u['nombre_rol'] || '',
      nombre_jerarquia: u['nombre_jerarquia'] || '',
      nombre_tipo_usuario: u['nombre_tipo_usuario'] || '',
      nombre_estado: u['nombre_estado'] || '',
    }));

    this.formattedData = this.data.map((u) => ({
      ...u,
      nombre_usuario: u['nombre_usuario'] || '',
      correo_electronico: u['correo_electronico'] || '',
      nombres: u['nombres'] || '',
      apellidos: u['apellidos'] || '',
      nombre_rol: u['nombre_rol'] || '',
      nombre_jerarquia: u['nombre_jerarquia'] || '',
      nombre_tipo_usuario: u['nombre_tipo_usuario'] || '',
      nombre_estado: u['nombre_estado'] || '',
    }));

    this.totalUsuarios = Number(total) || this.data.length || 0;
  }

  /**
   * @description Carga todos los datos requeridos de forma asíncrona y en orden.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  async cargarDatosAsync() {
    this.loading = true;
    this.error = undefined; // Limpiar errores previos al recargar

    try {
      const results = await firstValueFrom(
        forkJoin({
          tipos: this.api.get<any>('tipos_usuario'),
          estados: this.api.get<any>('estados'),
          roles: this.api.get<any>('roles', { desde: 0 }),
          jerarquias: this.api.get<any>('jerarquias', { desde: 0 }),
          usuariosRes: this.api.get<any>('usuarios', { desde: 0 }),
        })
      );

      this.ngZone.run(() => {
        const { tipos, estados, roles, jerarquias, usuariosRes } = results;

        // Procesar Tipos
        this.tiposUsuario = Array.isArray(tipos)
          ? tipos
          : (typeof tipos === 'object' &&
              tipos !== null &&
              (Array.isArray((tipos as any)['tipos'])
                ? (tipos as any)['tipos']
                : Array.isArray((tipos as any)['tipos_usuario'])
                ? (tipos as any)['tipos_usuario']
                : Array.isArray((tipos as any)['data'])
                ? (tipos as any)['data']
                : [])) ||
            [];

        // Procesar Estados
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

        // Procesar Roles
        this.roles = Array.isArray(roles)
          ? roles
          : (typeof roles === 'object' &&
              roles !== null &&
              (Array.isArray((roles as any)['roles'])
                ? (roles as any)['roles']
                : Array.isArray((roles as any)['data'])
                ? (roles as any)['data']
                : [])) ||
            [];

        // Procesar Jerarquias
        this.jerarquias = Array.isArray(jerarquias)
          ? jerarquias
          : (typeof jerarquias === 'object' &&
              jerarquias !== null &&
              (Array.isArray((jerarquias as any)['jerarquias'])
                ? (jerarquias as any)['jerarquias']
                : Array.isArray((jerarquias as any)['data'])
                ? (jerarquias as any)['data']
                : [])) ||
            [];

        // Procesar Usuarios
        const rows = usuariosRes?.usuarios || usuariosRes?.data || [];
        this.procesarDatosUsuarios(rows, usuariosRes?.total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.ngZone.run(() => {
        this.error = (err as any)?.error?.msg || 'No se pudo cargar usuarios';
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    }
  }

  /**
   * @description Carga inicial (alias) usado por otras páginas para refrescar la lista.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  // simple alias used by other pages/helpers
  async load() {
    this.currentPage = 1;
    await this.cargarDatosAsync();
    // keep generic `total` in sync
    try {
      this.total = this.totalUsuarios;
    } catch {}
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
    try {
      this.currentPage = Number(evt.page) || 1;
    } catch {}

    onPageChangeGeneric(this, evt, 'usuarios', (r: any) => ({
      id: r.id_usuario ?? r.id ?? r.ID ?? '',
      nombre: r.nombre_usuario ?? r.nombre ?? r.name ?? '',
      correo_electronico: r.correo ?? r.correo_electronico ?? '',
      id_tipo_usuario: r.id_tipo_usuario ?? '',
      id_estado: r.id_estado ?? '',
      activo:
        typeof r.activo !== 'undefined'
          ? r.activo === 1 || r.activo === '1' || r.activo === true
          : true,
    }));
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
    this.modalOpen = true; // Mostrar modal inmediatamente
    this.cdr.detectChanges();

    try {
      // Si los datos no están listos, espera a que se carguen
      if (!this.datosListos) {
        await this.cargarDatosAsync();
      }

      this.ngZone.run(() => {
        const rolOptions = (Array.isArray(this.roles) ? this.roles : []).map((r: any) => ({
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
        const tipoOptions = (Array.isArray(this.tiposUsuario) ? this.tiposUsuario : []).map(
          (t: any) => ({
            value:
              t.id_tipo_usuario != null &&
              t.id_tipo_usuario !== '' &&
              !isNaN(Number(t.id_tipo_usuario))
                ? String(t.id_tipo_usuario)
                : t.id != null && t.id !== '' && !isNaN(Number(t.id))
                ? String(t.id)
                : '',
            label: t.nombre ?? t.title ?? String(t.id_tipo_usuario ?? t.id ?? ''),
          })
        );
        const estadoOptions = (Array.isArray(this.estados) ? this.estados : []).map((e: any) => ({
          value:
            e.id_estado != null && e.id_estado !== '' && !isNaN(Number(e.id_estado))
              ? String(e.id_estado)
              : e.id != null && e.id !== '' && !isNaN(Number(e.id))
              ? String(e.id)
              : '',
          label: e.nombre ?? e.title ?? String(e.id_estado ?? e.id ?? ''),
        }));
        // Si necesitas jerarquía, agrégala igual que los otros
        const jerarquiaOptions = (Array.isArray(this.jerarquias) ? this.jerarquias : []).map(
          (j: any) => ({
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
          })
        );

        this.modalFields = this.buildUsuarioFields(
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
   * @description Muestra confirmación para eliminar un usuario (abre modal de confirmación).
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  onRemove(usuario: any) {
    try {
      this.modalFields = [];
      this.modalValues = { nombre: usuario?.nombre ?? '' };
      this.modalTitle = 'Eliminar usuario';
      this.modalEditingId = usuario?.id || usuario?.id_usuario || usuario?.ID || null;
      this.modalDeleteMode = true;
      this.modalOpen = true;
      this.cdr.detectChanges();
    } catch (err) {
      this.notify.warning('No se pudo iniciar la eliminación');
    }
  }
  /**
   * Confirma la acción del modal (crear/editar/borrar)
   */
  async onModalConfirm(): Promise<void> {
    try {
      await onModalConfirmGeneric(this, 'usuarios');
      await this.cargarDatosAsync();
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
   * Refresca los datos de la tabla de usuarios.
   */
  async refrescar(): Promise<void> {
    await this.cargarDatosAsync();
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
   * Método legacy para compatibilidad; no realiza acción (no-op).
   */
  openNewUser(): void {}

  /**
   * Devuelve las columnas visibles en la tabla de usuarios según USUARIO_SCHEMA.
   */
  get columns(): { key: string; label: string }[] {
    return [
      { key: 'correo_electronico', label: 'Usuarios' },
      { key: 'nombres', label: 'Nombres' },
      { key: 'apellidos', label: 'Apellidos' },
      { key: 'nombre_rol', label: 'Rol' },
      { key: 'nombre_jerarquia', label: 'Jerarquía' },
      { key: 'nombre_tipo_usuario', label: 'Tipo Usuario' },
      { key: 'nombre_estado', label: 'Estado' },
    ];
  }
}
