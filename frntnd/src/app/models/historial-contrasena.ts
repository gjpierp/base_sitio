export interface HistorialContrasena {
  id_historial?: number | string;
  id_usuario?: number | string;
  hash_contrasena?: string;
  fecha_cambio?: string | null;
  [key: string]: any;
}
