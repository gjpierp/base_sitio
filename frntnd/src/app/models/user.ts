export interface User {
  id: number | string;
  nombre: string;
  correo_electronico?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  [key: string]: any;
}
