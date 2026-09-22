import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models/presentation';
import type {
  CreateOrderDto,
  CustomerAuthResponse,
  CustomerLoginDto,
  CustomerOrderDto,
  CustomerProfileDto,
  CustomerRegisterDto,
  OrderResultDto,
  PublicIssuerDto,
  PublicProductDto,
} from '../models/storefront.model';

@Injectable({ providedIn: 'root' })
export class StorefrontService {
  private readonly baseUrl = `${environment.apiUrl}/api/public`;

  constructor(private readonly http: HttpClient) {}

  getIssuer(slug: string): Observable<PublicIssuerDto> {
    return this.http
      .get<ApiResponse<PublicIssuerDto>>(`${this.baseUrl}/issuers/${slug}`)
      .pipe(map((res) => res.data));
  }

  getProducts(slug: string): Observable<PublicProductDto[]> {
    return this.http
      .get<ApiResponse<PublicProductDto[]>>(`${this.baseUrl}/issuers/${slug}/products`)
      .pipe(map((res) => res.data));
  }

  createOrder(slug: string, dto: CreateOrderDto): Observable<OrderResultDto> {
    return this.http
      .post<ApiResponse<OrderResultDto>>(`${this.baseUrl}/issuers/${slug}/orders`, dto)
      .pipe(map((res) => res.data));
  }

  register(slug: string, dto: CustomerRegisterDto): Observable<CustomerAuthResponse> {
    return this.http
      .post<ApiResponse<CustomerAuthResponse>>(`${this.baseUrl}/issuers/${slug}/register`, dto)
      .pipe(map((res) => res.data));
  }

  login(slug: string, dto: CustomerLoginDto): Observable<CustomerAuthResponse> {
    return this.http
      .post<ApiResponse<CustomerAuthResponse>>(`${this.baseUrl}/issuers/${slug}/login`, dto)
      .pipe(map((res) => res.data));
  }

  me(slug: string): Observable<CustomerProfileDto> {
    return this.http
      .get<ApiResponse<CustomerProfileDto>>(`${this.baseUrl}/issuers/${slug}/me`)
      .pipe(map((res) => res.data));
  }

  myOrders(slug: string): Observable<CustomerOrderDto[]> {
    return this.http
      .get<ApiResponse<CustomerOrderDto[]>>(`${this.baseUrl}/issuers/${slug}/me/orders`)
      .pipe(map((res) => res.data));
  }
}