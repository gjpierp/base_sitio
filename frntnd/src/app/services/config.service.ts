import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private api = inject(ApiService);
  private cachedItemsPerPage: number | null = null;

  async getItemsPerPage(): Promise<number> {
    if (this.cachedItemsPerPage !== null) return this.cachedItemsPerPage;
    try {
      const res: any = await firstValueFrom(this.api.get<any>('configuraciones/items_per_page'));
      const val = Number(res?.config?.valor ?? res?.valor ?? res?.data?.valor);
      const n = !isNaN(val) && val > 0 ? val : 10;
      this.cachedItemsPerPage = n;
      return n;
    } catch (err) {
      this.cachedItemsPerPage = 10;
      return 10;
    }
  }
}
