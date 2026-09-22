import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models/presentation';
import type { PagedResult } from '../models/paged-result.model';
import type {
  CreateInvoiceDto,
  CreatePaymentDto,
  CreatePaymentPlanDto,
  InvoiceDto,
  InvoiceSummaryDto,
} from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  private readonly baseUrl = `${environment.apiUrl}/api/Invoices`;

  constructor(private readonly http: HttpClient) {}

  getInvoices(
    page = 1,
    pageSize = 20,
    search?: string,
  ): Observable<PagedResult<InvoiceSummaryDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    if (search) params = params.set('search', search);
    return this.http
      .get<ApiResponse<PagedResult<InvoiceSummaryDto>>>(this.baseUrl, { params })
      .pipe(map((res) => res.data));
  }

  createInvoice(dto: CreateInvoiceDto): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  getInvoice(id: string): Observable<InvoiceDto> {
    return this.http
      .get<ApiResponse<InvoiceDto>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  registerPayment(id: string, dto: CreatePaymentDto): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(`${this.baseUrl}/${id}/payments`, dto)
      .pipe(map((res) => res.data));
  }

  createPaymentPlan(id: string, dto: CreatePaymentPlanDto): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(`${this.baseUrl}/${id}/plans`, dto)
      .pipe(map((res) => res.data));
  }

  getInvoicePdf(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, {
      responseType: 'blob',
    });
  }

  regenerateInvoicePdf(id: string): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/${id}/pdf/regenerate`, null, {
      responseType: 'blob',
    });
  }
}