import { environment } from '../../../environments/environment';

export function imageUrl(path: string): string {
  return `${environment.apiUrl}${path}`;
}