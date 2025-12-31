// Utilidad para convertir un Observable en una Promise con await
import { firstValueFrom } from 'rxjs';

export function toPromise<T>(obs: any): Promise<T> {
  return firstValueFrom(obs);
}
