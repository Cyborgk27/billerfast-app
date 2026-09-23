import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models/presentation';
import type {
  CreateOrUpdateProductDto,
  ImportResultDto,
  ProductDto,
} from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly baseUrl = `${environment.apiUrl}/api/Products`;

  constructor(private readonly http: HttpClient) {}

  getProducts(): Observable<ProductDto[]> {
    return this.http
      .get<ApiResponse<ProductDto[]>>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  getProduct(id: string): Observable<ProductDto> {
    return this.http
      .get<ApiResponse<ProductDto>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  createProduct(dto: CreateOrUpdateProductDto): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  updateProduct(id: string, dto: CreateOrUpdateProductDto): Observable<void> {
    return this.http.put(`${this.baseUrl}/${id}`, dto).pipe(map(() => undefined));
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }

  updateStock(id: string, stock: number): Observable<void> {
    return this.http
      .put(`${this.baseUrl}/${id}/stock`, { stock })
      .pipe(map(() => undefined));
  }

  updateImage(id: string, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http
      .put(`${this.baseUrl}/${id}/image`, formData)
      .pipe(map(() => undefined));
  }

  importProducts(file: File): Observable<ImportResultDto> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http
      .post<ApiResponse<ImportResultDto>>(`${this.baseUrl}/import`, formData)
      .pipe(map((res) => res.data));
  }

  exportProducts(formato: 'excel' | 'json'): Observable<Blob> {
    const params = new HttpParams().set('formato', formato);
    return this.http.get(`${this.baseUrl}/export`, { params, responseType: 'blob' });
  }
}