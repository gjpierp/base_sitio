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
      // ensure options for tipoUsuario and estados are loaded
      let tipoOptions: { value: string; label: string }[] = [];
      let estadoOptions: { value: string; label: string }[] = [];
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

      const fields: any[] = [];
      fields.push({ key: 'nombre', label: 'Nombre', type: 'text', value: '' });
      fields.push({
        key: 'correo_electronico',
        label: 'Correo electrónico',
        type: 'text',
        value: '',
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

      this.modalTitle = 'Crear usuario';
      this.modalFields = fields;
      this.modalValues = {};
      for (const f of fields) this.modalValues[f.key] = f.value ?? '';
      this.modalEditingId = null;
      this.modalDeleteMode = false;
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
      const id = usuario?.id || usuario?.id_usuario || usuario?.ID;
      if (id) {
        // Navegar a la página de crear con query param id para editar
        this.router.navigate(['/usuarios/crear'], { queryParams: { id } });
        return;
      }
    } catch (err) {}
    this.notify.warning('No se pudo iniciar la edición del usuario');
  }

  onRemove(usuario: any) {
    this.usuarioAEliminar = usuario;
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.notify.info('Usuario eliminado (simulado)');
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
