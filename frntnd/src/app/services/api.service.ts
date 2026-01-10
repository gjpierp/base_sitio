import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  // Usa proxy en navegador (/api) y URL absoluta en SSR
  private baseUrl = isPlatformBrowser(this.platformId)
    ? '/api'
    : process.env['BACKEND_URL'] || 'http://localhost:3005/api';

  get<T>(path: string, params?: any) {
    let httpParams = undefined as any;
    if (params && typeof params === 'object') {
      httpParams = new HttpParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        httpParams = httpParams.append(k, String(v));
      });
    }
    try {
      if (isPlatformBrowser(this.platformId))
        console.debug('[ApiService] GET', `${this.baseUrl}/${path}`, params || {});
    } catch {}
    return this.http.get<T>(`${this.baseUrl}/${path}`, { params: httpParams }).pipe(
      catchError((err) => {
        // Si es error de red o backend caído
        if (err.status === 0 || err.name === 'HttpErrorResponse') {
          // Si es error HTTP (como 401, 403, 404, 500, etc.)
          if (err.status && err.status !== 0) {
            const msg = err.error?.msg || err.statusText || 'Error HTTP';
            return of({ error: true, msg, status: err.status, detail: err });
          }
          // Error de red puro
          return of({
            error: true,
            msg: 'No se pudo conectar con el backend',
            status: 0,
            detail: err,
          });
        }
        // Otros errores
        return of({ error: true, msg: 'Error desconocido', status: err.status, detail: err });
      })
    );
  }

  /**
   * Get a paginated response and normalize it to { data: any[], total: number }
   * Works with several backend shapes (data/items/rows/<entity> + total/count)
   */
  getPaginated<T = any>(path: string, params?: any): Observable<{ data: T[]; total: number }> {
    return this.get<any>(path, params).pipe(
      map((res: any) => {
        try {
          if (typeof window !== 'undefined')
            console.debug('[ApiService] raw paginated response', path, res);
        } catch {}
        const toArray = (v: any): T[] => {
          if (Array.isArray(v)) return v;
          if (v && typeof v === 'object') {
            if (Array.isArray(v.data)) return v.data;
            if (Array.isArray(v.items)) return v.items;
            if (Array.isArray(v.rows)) return v.rows;
            // try common plural keys
            const keys = Object.keys(v);
            for (const k of keys) {
              if (Array.isArray((v as any)[k])) return (v as any)[k];
            }
          }
          return [] as T[];
        };
        const candidates = [res?.data, res?.items, res?.rows, res, null];
        let rows: T[] = [];
        for (const c of candidates) {
          const arr = toArray(c);
          if (arr.length) {
            rows = arr;
            break;
          }
        }
        const total = Number(res?.total ?? res?.count ?? res?.totalItems ?? (rows.length || 0));
        return { data: rows, total };
      })
    );
  }

  post<T>(path: string, body: any) {
    // Si body es string, intentar parsear a objeto, si falla, enviar objeto vacío
    let safeBody = body;
    if (typeof body === 'string') {
      try {
        safeBody = JSON.parse(body);
      } catch {
        safeBody = {};
      }
    }
    return this.http.post<T>(`${this.baseUrl}/${path}`, safeBody);
  }

  put<T>(path: string, body: any) {
    let safeBody = body;
    if (typeof body === 'string') {
      try {
        safeBody = JSON.parse(body);
      } catch {
        safeBody = {};
      }
    }
    return this.http.put<T>(`${this.baseUrl}/${path}`, safeBody);
  }

  /**
   * Upload FormData to backend using specified method (PUT by default).
   * Example: api.upload('uploads/usuarios/123', formData)
   */
  upload<T>(path: string, formData: FormData, method: 'put' | 'post' = 'put') {
    const url = `${this.baseUrl}/${path}`;
    return this.http.request<T>(method.toUpperCase(), url, { body: formData });
  }

  delete<T>(path: string) {
    return this.http.delete<T>(`${this.baseUrl}/${path}`);
  }
}
