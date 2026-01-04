import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  // Usa proxy en navegador (/api) y URL absoluta en SSR
  private baseUrl =
    typeof window !== 'undefined'
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
    return this.http.get<T>(`${this.baseUrl}/${path}`, { params: httpParams });
  }

  /**
   * Get a paginated response and normalize it to { data: any[], total: number }
   * Works with several backend shapes (data/items/rows/<entity> + total/count)
   */
  getPaginated<T = any>(path: string, params?: any): Observable<{ data: T[]; total: number }> {
    return this.get<any>(path, params).pipe(
      map((res: any) => {
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
    return this.http.post<T>(`${this.baseUrl}/${path}`, body);
  }

  put<T>(path: string, body: any) {
    return this.http.put<T>(`${this.baseUrl}/${path}`, body);
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
