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
  // Filtros de búsqueda
  filtroNombre: string = '';
  filtroCorreo: string = '';
  filtroTipoUsuario: string = '';
  filtroEstado: string = '';
  estadoActivoId: string = '';
  filtroRol: string = '';

  /**
   * Aplica los filtros de búsqueda sobre la lista de usuarios
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
    this.formattedData = filtrados;
    this.totalUsuarios = filtrados.length;

    // Limpiar filtros después de buscar
    this.filtroNombre = '';
    this.filtroCorreo = '';
    this.filtroTipoUsuario = '';
    this.filtroEstado = '';
    this.filtroRol = '';
  }

  /**
   * Limpia los filtros y restaura la lista completa
   */
  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroCorreo = '';
    this.filtroTipoUsuario = '';
    this.filtroEstado = '';
    this.filtroRol = '';
    this.formattedData = this.data;
    this.totalUsuarios = this.data.length;
  }
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
      // Buscar el id del estado "Activo" y filtrar por defecto
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
      console.log('[UsuariosPageComponent] Datos precargados:', {
        roles: this.roles,
        tiposUsuario: this.tiposUsuario,
        estados: this.estados,
        jerarquias: this.jerarquias,
      });
      this.procesarDatosUsuarios(usuariosFiltrados, usuariosFiltrados.length);
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
  openEditModal(usuario: any) {
    // 1. Configuración inicial limpia
    this.modalTitle = 'Editar usuario';
    this.modalFields = [];
    this.modalValues = {};
    this.modalDeleteMode = false;
    this.modalEditingId = null;
    this.modalLoading = true;

    // 2. Reinicio forzado del modal para evitar problemas de "primer click"
    this.modalOpen = false;
    this.cdr.detectChanges();

    this.modalOpen = true;
    this.cdr.detectChanges();

    // 3. Lógica de carga de datos
    try {
      // Identificar ID
      const uRow = usuario ? { ...usuario } : {};
      const id = uRow.id || uRow.id_usuario || uRow.ID;

      if (!id) throw new Error('Usuario sin ID');

      // Cargar detalle fresco (opcional, pero recomendado)
      let uDetail = uRow;
      try {
        const res: any = firstValueFrom(this.api.get(`usuarios/${id}`));
        const payload = res?.data ?? res;
        if (payload) uDetail = { ...uDetail, ...payload };
      } catch (e) {
        console.warn('Usando datos de fila por error en detalle:', e);
      }

      // Asegurar catálogos cargados
      if (!this.datosListos || !this.roles?.length) {
        this.cargarDatosAsync();
      }

      // 4. Construcción de UI dentro de la zona de Angular
      this.ngZone.run(() => {
        // Helper para mapear opciones
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

        // LOG para depuración de carga de select
        console.log('[UsuariosPageComponent] Opciones de select:', {
          rolOptions,
          tipoOptions,
          estadoOptions,
          jerarquiaOptions,
        });

        // Construir campos
        this.modalFields = this.buildUsuarioFields(
          { rolOptions, jerarquiaOptions, tipoOptions, estadoOptions },
          uDetail,
          true
        );

        // Asignar valores
        const values: any = {};
        this.modalFields.forEach((f) => (values[f.key] = f.value));
        this.modalValues = values;

        this.modalEditingId = uDetail.id_usuario || id;

        // Fix específico para IDs que parecen correos (legacy data)
        if (typeof this.modalEditingId === 'string' && this.modalEditingId.includes('@')) {
          this.modalEditingId = uDetail.id_usuario || null;
        }

        // Mostrar formulario
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
    // Fix NG0100: Defer loading state update to avoid ExpressionChangedAfterItHasBeenCheckedError
    let pending = true;
    setTimeout(() => {
      if (pending) {
        this.loading = true;
      }
    });
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

      pending = false;
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
      pending = false;
      this.ngZone.run(() => {
        this.error = (err as any)?.error?.msg || 'No se pudo cargar usuarios';
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = false; // Permitir reintento si falló
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

    // Reinicio forzado para asegurar apertura (igual que en edición)
    this.modalOpen = false;
    this.cdr.detectChanges();
    this.modalOpen = true;
    this.cdr.detectChanges();

    try {
      // Si los datos no están listos, espera a que se carguen
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
        // Si necesitas jerarquía, agrégala igual que los otros
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
      // Solo id numérico válido
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
      // Cerrar el modal siempre, incluso si hay error
      this.modalOpen = false;
      this.modalDeleteMode = false;
      this.modalEditingId = null;
      this.cdr.detectChanges();
      if (!success) return;
      // Esperar un momento para asegurar que la transacción en BD finalizó
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
