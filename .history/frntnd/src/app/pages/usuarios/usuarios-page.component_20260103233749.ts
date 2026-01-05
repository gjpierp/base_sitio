import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user';
import { TipoUsuario } from '../../models/tipo-usuario';
import { Estado } from '../../models/estado';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { abrirCrearModalGeneric, onModalConfirmGeneric, onModalClosedGeneric } from '../page-utils';

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
    UiCardComponent,
    UiSpinnerComponent,
    UiEntityTableComponent,
    UiModalComponent,
  ],
  templateUrl: './usuarios-page.component.html',
  styleUrls: ['./usuarios-page.component.css'],
})
export class UsuariosPageComponent implements OnInit {
  /**
   * @description Inicio de Variables
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  title = 'Usuarios';
  subtitle = 'Usuarios';
  // Create-user UI removed: form fields and showForm flag omitted
  tiposUsuario: TipoUsuario[] = [];
  estados: Estado[] = [];
  data: User[] = [];
  loading = false;
  error?: string;
  datosListos = false;
  totalUsuarios = 0;

  usuarioAEliminar: any = null;

  // modal integrado para crear/editar/eliminar genérico
  modalOpen = false;
  modalTitle = '';
  modalFields: any[] = [];
  modalValues: any = {};
  modalSaving = false;
  modalEditingId: any = null;
  modalDeleteMode = false;
  currentPage = 1;

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private router = inject(Router);

  /**
   * @description Constructor de la clase UsuariosPageComponent.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  constructor() {}

  async openCreateModal() {
    try {
      this.modalTitle = 'Crear usuario';

      // ensure options for tipoUsuario and estados are loaded
      let tipoOptions: { value: string; label: string }[] = [];
      let estadoOptions: { value: string; label: string }[] = [];
      let rolOptions: { value: string; label: string }[] = [];
      let jerarquiaOptions: { value: string; label: string }[] = [];
      try {
        if (Array.isArray(this.tiposUsuario) && this.tiposUsuario.length > 0) {
          tipoOptions = this.tiposUsuario.map((t: any) => ({
            value: String(t.id_tipo_usuario ?? t.id ?? ''),
            label: t.nombre ?? t.title ?? t.titulo ?? String(t.id_tipo_usuario ?? t.id ?? ''),
          }));
        } else {
          const tresp: any = await firstValueFrom(
            this.api.getPaginated('tipos_usuario', { desde: 0 }) as any
          );
          const trows = tresp?.data || tresp || [];
          tipoOptions = (Array.isArray(trows) ? trows : []).map((t: any) => ({
            value: String(t.id_tipo_usuario ?? t.id ?? ''),
            label: t.nombre ?? t.title ?? t.titulo ?? String(t.id_tipo_usuario ?? t.id ?? ''),
          }));
          this.tiposUsuario = Array.isArray(trows) ? trows : [];
        }
      } catch {}

      try {
        if (Array.isArray(this.estados) && this.estados.length > 0) {
          estadoOptions = this.estados.map((e: any) => ({
            value: String(e.id_estado ?? e.id ?? ''),
            label: e.nombre ?? e.title ?? e.titulo ?? String(e.id_estado ?? e.id ?? ''),
          }));
        } else {
          const eres: any = await firstValueFrom(
            this.api.getPaginated('estados', { desde: 0 }) as any
          );
          const erows = eres?.data || eres || [];
          estadoOptions = (Array.isArray(erows) ? erows : []).map((e: any) => ({
            value: String(e.id_estado ?? e.id ?? ''),
            label: e.nombre ?? e.title ?? e.titulo ?? String(e.id_estado ?? e.id ?? ''),
          }));
          this.estados = Array.isArray(erows) ? erows : [];
        }
      } catch {}

      // load roles
      try {
        const rresp: any = await firstValueFrom(
          this.api.getPaginated('roles', { desde: 0 }) as any
        );
        const rrows = rresp?.data || rresp || [];
        rolOptions = (Array.isArray(rrows) ? rrows : []).map((r: any) => ({
          value: String(r.id_rol ?? r.id ?? ''),
          label: r.nombre ?? r.title ?? String(r.id_rol ?? r.id ?? ''),
        }));
      } catch {}

      // load jerarquias
      try {
        const jresp: any = await firstValueFrom(
          this.api.getPaginated('jerarquias', { desde: 0 }) as any
        );
        const jrows = jresp?.data || jresp || [];
        jerarquiaOptions = (Array.isArray(jrows) ? jrows : []).map((j: any) => ({
          value: String(j.id_jerarquia ?? j.id ?? ''),
          label: j.nombre ?? j.title ?? String(j.id_jerarquia ?? j.id ?? ''),
        }));
      } catch {}

      const fields: any[] = [];
      // Campos visibles en modal de creación (omitimos contraseña, nombres y apellidos)
      fields.push({ key: 'nombre_usuario', label: 'Nombre de usuario', type: 'text', value: '' });
      fields.push({
        key: 'correo_electronico',
        label: 'Correo electrónico',
        type: 'text',
        value: '',
      });
      fields.push({
        key: 'id_rol',
        label: 'Rol',
        type: 'select',
        options: rolOptions,
        value: rolOptions[0]?.value ?? '',
      });
      fields.push({
        key: 'id_jerarquia',
        label: 'Jerarquía',
        type: 'select',
        options: jerarquiaOptions,
        value: jerarquiaOptions[0]?.value ?? '',
      });
      fields.push({
        key: 'id_tipo_usuario',
        label: 'Tipo usuario',
        type: 'select',
        options: tipoOptions,
        value: tipoOptions[0]?.value ?? '',
      });
      fields.push({
        key: 'id_estado',
        label: 'Estado',
        type: 'select',
        options: estadoOptions,
        value: estadoOptions[0]?.value ?? '',
      });
      fields.push({
        key: 'activo',
        label: 'Activo',
        type: 'select',
        options: [
          { value: 'true', label: 'Sí' },
          { value: 'false', label: 'No' },
        ],
        value: 'true',
      });

      this.modalFields = fields;
      this.modalValues = {};
      for (const f of fields) this.modalValues[f.key] = f.value ?? '';
      this.modalEditingId = null;
      this.modalDeleteMode = false;
      // Abrir modal después de preparar campos y valores
      this.modalOpen = true;
      try {
        this.cdr.detectChanges();
      } catch {}
    } catch (err) {
      try {
        console.error(err);
      } catch {}
    }
  }

  async onModalConfirm() {
    try {
      await onModalConfirmGeneric(this, 'usuarios');
    } catch {}
  }

  onModalClosed() {
    try {
      onModalClosedGeneric(this);
    } catch {}
  }

  ngOnInit() {
    const pre = this.route.snapshot.data?.['pre'];
    if (pre) {
      // Consumir datos precargados del resolver y pintar inmediatamente
      this.tiposUsuario = Array.isArray(pre.tiposUsuario) ? pre.tiposUsuario : [];
      this.estados = Array.isArray(pre.estados) ? pre.estados : [];
      const rows = Array.isArray(pre.usuarios) ? pre.usuarios : [];
      this.data = rows.map((r: any) => ({
        id: r.id_usuario ?? r.id ?? r.ID ?? '',
        nombre: r.nombre_usuario ?? r.nombre ?? r.name ?? '',
        correo_electronico: r.correo ?? r.correo_electronico ?? '',
        id_tipo_usuario: r.id_tipo_usuario ?? '',
        id_estado: r.id_estado ?? '',
        activo:
          typeof r.activo !== 'undefined'
            ? r.activo === 1 || r.activo === '1' || r.activo === true
            : true,
        img: r.img ?? null,
        fecha_creacion: r.fecha_creacion ?? null,
        fecha_actualizacion: r.fecha_actualizacion ?? null,
      }));
      this.totalUsuarios = Number(pre.total) || this.data.length || 0;
      this.datosListos = true;
      this.cdr.detectChanges();
    } else {
      // Fallback: cargar normalmente si no hay datos del resolver
      this.cargarDatosAsync();
    }
  }

  openNewUser() {
    // Create-user functionality removed from users page.
    // Legacy method retained as no-op for backwards compatibility.
  }

  /**
   * @description Devuelve las columnas visibles en la tabla de usuarios.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  get columns() {
    return [
      { key: 'nombre', label: 'Nombre' },
      { key: 'correo_electronico', label: 'Correo' },
      { key: 'tipo_usuario_nombre', label: 'Tipo usuario' },
      { key: 'estado_nombre', label: 'Estado' },
    ];
  }

  /**
   * @description Devuelve los datos de usuarios con fechas y nombres formateados para la vista.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  get dataFormateada() {
    return this.data.map((u) => ({
      ...u,
      tipo_usuario_nombre:
        this.tiposUsuario.find(
          (t) => Number((t as any).id_tipo_usuario) === Number((u as any)['id_tipo_usuario'])
        )?.nombre || '',
      estado_nombre:
        this.estados.find((e) => Number((e as any).id_estado) === Number((u as any)['id_estado']))
          ?.nombre || '',
    }));
  }

  /**
   * @description Carga todos los datos requeridos de forma asíncrona y en orden.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  async cargarDatosAsync() {
    this.loading = true;
    try {
      const [tipos, estados] = await Promise.all([
        firstValueFrom(this.api.get<TipoUsuario[]>('tipos_usuario') as any),
        firstValueFrom(this.api.get<Estado[]>('estados') as any),
      ]);
      // Normaliza la respuesta del endpoint /api/tipos_usuario
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
      // Cargar primera página (server-side) con tamaño por defecto
      const res: any = await firstValueFrom(this.api.getPaginated('usuarios', { desde: 0 }) as any);
      const rows = res?.data || [];
      this.data = rows.map((r: any) => ({
        id: r.id_usuario ?? r.id ?? r.ID ?? '',
        nombre: r.nombre_usuario ?? r.nombre ?? r.name ?? '',
        correo_electronico: r.correo ?? r.correo_electronico ?? '',
        id_tipo_usuario: r.id_tipo_usuario ?? '',
        id_estado: r.id_estado ?? '',
        activo:
          typeof r.activo !== 'undefined'
            ? r.activo === 1 || r.activo === '1' || r.activo === true
            : true,
        img: r.img ?? null,
        fecha_creacion: r.fecha_creacion ?? null,
        fecha_actualizacion: r.fecha_actualizacion ?? null,
      }));
      this.totalUsuarios = Number(res?.total) || rows.length || 0;
      this.datosListos = true;
      this.cdr.detectChanges();
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudo cargar usuarios';
      this.data = [];
      this.datosListos = false;
    }
    this.loading = false;
  }

  onPageChange(evt: {
    page: number;
    pageSize: number;
    term?: string;
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    this.currentPage = evt.page;
    const desde = (evt.page - 1) * evt.pageSize;
    const limite = evt.pageSize;
    const term = (evt.term || '').trim();
    const sortKey = (evt.sortKey || '').trim();
    const sortDir = (evt.sortDir || 'asc').toLowerCase() as 'asc' | 'desc';
    const applySort = (list: any[]) => {
      if (!sortKey) return list;
      const sorted = [...list].sort((a, b) => {
        const va = a?.[sortKey];
        const vb = b?.[sortKey];
        const na = va === null || va === undefined;
        const nb = vb === null || vb === undefined;
        if (na && nb) return 0;
        if (na) return 1;
        if (nb) return -1;
        const ta = typeof va;
        const tb = typeof vb;
        if (ta === 'number' && tb === 'number') {
          return sortDir === 'asc' ? va - vb : vb - va;
        }
        const sa = String(va).toLowerCase();
        const sb = String(vb).toLowerCase();
        return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
      });
      return sorted;
    };
    this.loading = true;
    this.datosListos = false;
    try {
      this.cdr.detectChanges();
    } catch {}
    if (term) {
      // Filtro server-side vía endpoint de búsquedas, luego paginar por slice
      this.api.get<any>(`todo/coleccion/usuarios/${encodeURIComponent(term)}`).subscribe({
        next: (res) => {
          const list = Array.isArray((res as any)?.resultados)
            ? (res as any).resultados
            : Array.isArray((res as any)?.usuarios)
            ? (res as any).usuarios
            : Array.isArray(res)
            ? (res as any)
            : [];
          const mapped = list.map((r: any) => ({
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
          const ordered = applySort(mapped);
          this.totalUsuarios = ordered.length;
          // Slice para la página solicitada
          this.data = ordered.slice(desde, desde + limite);
          this.loading = false;
          try {
            this.datosListos = true;
            this.cdr.detectChanges();
          } catch {}
        },
        error: () => {
          this.error = 'No se pudo filtrar usuarios';
          this.loading = false;
          try {
            this.datosListos = false;
            this.cdr.detectChanges();
          } catch {}
        },
      });
    } else {
      // Paginación server-side estándar
      this.api.get<any>('usuarios', { desde, limite, sortKey, sortDir }).subscribe({
        next: (res) => {
          const users = Array.isArray(res?.usuarios)
            ? res.usuarios
            : Array.isArray(res)
            ? (res as any)
            : [];
          const mapped = users.map((r: any) => ({
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
          const ordered = applySort(mapped);
          this.data = ordered;
          this.totalUsuarios = Number((res as any)?.total) || ordered.length;
          this.loading = false;
          try {
            this.datosListos = true;
            this.cdr.detectChanges();
          } catch {}
        },
        error: () => {
          this.error = 'No se pudo cargar usuarios';
          this.loading = false;
          try {
            this.datosListos = false;
            this.cdr.detectChanges();
          } catch {}
        },
      });
    }
  }

  /**
   * @description Refresca los datos de la tabla de usuarios.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  refrescar() {
    this.cargarDatosAsync();
  }

  onEdit(usuario: any) {
    try {
      // Abrir modal de edición en lugar de navegar
      this.openEditModal(usuario);
      return;
    } catch (err) {
      console.error(err);
    }
    this.notify.warning('No se pudo iniciar la edición del usuario');
  }

  onRemove(usuario: any) {
    // Mostrar modal de confirmación de borrado
    try {
      this.modalFields = [];
      this.modalValues = { nombre: usuario?.nombre ?? '' };
      this.modalTitle = 'Eliminar usuario';
      this.modalEditingId = usuario?.id || usuario?.id_usuario || usuario?.ID || null;
      this.modalDeleteMode = true;
      this.modalOpen = true;
      try {
        this.cdr.detectChanges();
      } catch {}
    } catch (err) {
      console.error(err);
      this.notify.warning('No se pudo iniciar la eliminación');
    }
  }

  /**
   * Abrir modal de edición y precargar campos/valores.
   */
  async openEditModal(usuario: any) {
    try {
      this.modalTitle = 'Editar usuario';
      // Reset modal state to avoid stale values from previous opens
      this.modalOpen = false;
      this.modalFields = [];
      this.modalValues = {};
      this.modalEditingId = null;
      this.modalDeleteMode = false;
      // Clone usuario to avoid mutating list reference
      const u = usuario ? JSON.parse(JSON.stringify(usuario)) : {};
      // Si faltan id_rol o id_jerarquia, intentar obtenerlos desde endpoints específicos
      try {
        const uid = u?.id || u?.id_usuario || u?.ID || null;
        if (uid) {
          // Obtener roles asignados al usuario y usar el primero como valor por defecto
          try {
            const rolesResp: any = await firstValueFrom(
              this.api.get(`usuarios/roles/${uid}`) as any
            );
            const assignedRoles = rolesResp?.roles || [];
            if (
              (!u?.id_rol || String(u.id_rol) === '') &&
              Array.isArray(assignedRoles) &&
              assignedRoles.length
            ) {
              u.id_rol = assignedRoles[0].id_rol ?? assignedRoles[0].id ?? assignedRoles[0].id_rol;
            }
          } catch (e) {
            console.debug('[openEditModal] no se pudo obtener roles del usuario', e);
          }

          // Obtener las asociaciones usuario-jerarquias y buscar la que corresponda
          try {
            const ujResp: any = await firstValueFrom(
              this.api.getPaginated(`usuarios_jerarquias`, { desde: 0, id_usuario: uid }) as any
            );
            const asociaciones = ujResp?.data || ujResp?.usuarios_jerarquias || ujResp || [];
            if (
              (!u?.id_jerarquia || String(u.id_jerarquia) === '') &&
              Array.isArray(asociaciones) &&
              asociaciones.length
            ) {
              const asoci = asociaciones[0];
              if (asoci) {
                u.id_jerarquia = asoci.id_jerarquia ?? asoci.id;
              }
            }
          } catch (e) {
            console.debug('[openEditModal] no se pudo obtener usuarios_jerarquias', e);
          }
        }
      } catch (e) {
        try {
          console.error(e);
        } catch {}
      }
      // Cargar opciones si es necesario (roles, jerarquias, tipos, estados)
      let rolOptions: { value: string; label: string }[] = [];
      let jerarquiaOptions: { value: string; label: string }[] = [];
      let tipoOptions: { value: string; label: string }[] = [];
      let estadoOptions: { value: string; label: string }[] = [];

      try {
        const rresp: any = await firstValueFrom(
          this.api.getPaginated('roles', { desde: 0 }) as any
        );
        const rrows = rresp?.data || rresp || [];
        rolOptions = (Array.isArray(rrows) ? rrows : []).map((r: any) => ({
          value: String(r.id_rol ?? r.id ?? ''),
          label: r.nombre ?? String(r.id_rol ?? r.id ?? ''),
        }));
      } catch {}
      try {
        const jresp: any = await firstValueFrom(
          this.api.getPaginated('jerarquias', { desde: 0 }) as any
        );
        const jrows = jresp?.data || jresp || [];
        jerarquiaOptions = (Array.isArray(jrows) ? jrows : []).map((j: any) => ({
          value: String(j.id_jerarquia ?? j.id ?? ''),
          label: j.nombre ?? String(j.id_jerarquia ?? j.id ?? ''),
        }));
      } catch {}
      try {
        const tresp: any = await firstValueFrom(
          this.api.getPaginated('tipos_usuario', { desde: 0 }) as any
        );
        const trows = tresp?.data || tresp || [];
        tipoOptions = (Array.isArray(trows) ? trows : []).map((t: any) => ({
          value: String(t.id_tipo_usuario ?? t.id ?? ''),
          label: t.nombre ?? String(t.id_tipo_usuario ?? t.id ?? ''),
        }));
      } catch {}
      try {
        const eres: any = await firstValueFrom(
          this.api.getPaginated('estados', { desde: 0 }) as any
        );
        const erows = eres?.data || eres || [];
        estadoOptions = (Array.isArray(erows) ? erows : []).map((e: any) => ({
          value: String(e.id_estado ?? e.id ?? ''),
          label: e.nombre ?? String(e.id_estado ?? e.id ?? ''),
        }));
      } catch {}

      const fields: any[] = [];
      fields.push({
        key: 'nombre_usuario',
        label: 'Nombre de usuario',
        type: 'text',
        value: u?.nombre_usuario ?? u?.nombre ?? '',
      });
      // No mostrar contraseña, nombres ni apellidos en modal de edición
      fields.push({
        key: 'correo_electronico',
        label: 'Correo electrónico',
        type: 'text',
        value: u?.correo_electronico ?? u?.correo ?? '',
      });
      fields.push({
        key: 'id_rol',
        label: 'Rol',
        type: 'select',
        options: rolOptions,
        value: String(u?.id_rol ?? ''),
      });
      fields.push({
        key: 'id_jerarquia',
        label: 'Jerarquía',
        type: 'select',
        options: jerarquiaOptions,
        value: String(u?.id_jerarquia ?? ''),
      });
      fields.push({
        key: 'id_tipo_usuario',
        label: 'Tipo usuario',
        type: 'select',
        options: tipoOptions,
        value: String(u?.id_tipo_usuario ?? ''),
      });
      fields.push({
        key: 'id_estado',
        label: 'Estado',
        type: 'select',
        options: estadoOptions,
        value: String(u?.id_estado ?? ''),
      });
      fields.push({
        key: 'activo',
        label: 'Activo',
        type: 'select',
        options: [
          { value: 'true', label: 'Sí' },
          { value: 'false', label: 'No' },
        ],
        value: u?.activo ? 'true' : 'false',
      });

      this.modalFields = fields;
      this.modalValues = {};
      for (const f of fields) this.modalValues[f.key] = f.value ?? '';
      this.modalEditingId = u?.id || u?.id_usuario || u?.ID || null;
      this.modalTitle = 'Editar usuario';
      this.modalDeleteMode = false;
      // Abrir modal sólo después de preparar campos/valores
      this.modalOpen = true;
      try {
        this.cdr.detectChanges();
      } catch {}
    } catch (err) {
      console.error(err);
      this.notify.warning('No se pudo abrir modal de edición');
    }
  }

  /**
   * @description Cambia el tema visual del sitio según selección.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  cambiarEstilo(evt: Event) {
    const sel = (evt.target as HTMLSelectElement)?.value || 'base';
    const theme = sel === 'modern' ? 'modern' : 'base';
    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch {}
  }

  onTableReady() {
    // Marcar lista la tabla para asegurar que se pinte
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }
}
