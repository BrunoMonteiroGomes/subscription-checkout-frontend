import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { PreCheckoutResponse } from '../models/cart';
import {
  CheckoutRequest,
  CheckoutSuccessResponse,
  FrontendErrorResponse
} from '../models/checkout';

@Injectable({ providedIn: 'root' })
export class CheckoutApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/operations';

  preCheckout(productSlug: string): Observable<PreCheckoutResponse> {
    return this.http
      .post<PreCheckoutResponse>(`${this.baseUrl}/pre-checkout`, {
        products: [{ slug: productSlug }]
      })
      .pipe(catchError(err => throwError(() => err.error as FrontendErrorResponse)));
  }

  checkout(request: CheckoutRequest): Observable<CheckoutSuccessResponse> {
    return this.http
      .post<CheckoutSuccessResponse>(`${this.baseUrl}/checkout`, request)
      .pipe(catchError(err => throwError(() => err.error as FrontendErrorResponse)));
  }
}
