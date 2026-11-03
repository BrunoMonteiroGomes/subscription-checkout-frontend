import { Injectable, signal } from '@angular/core';
import { PreCheckoutResponse } from '../models/cart';
import { CheckoutSuccessResponse, FrontendErrorResponse } from '../models/checkout';

@Injectable({ providedIn: 'root' })
export class CheckoutStateService {
  private _cart = signal<PreCheckoutResponse | null>(null);
  private _success = signal<CheckoutSuccessResponse | null>(null);
  private _error = signal<FrontendErrorResponse | null>(null);
  private _customerName = signal<string | null>(null);

  readonly cart = this._cart.asReadonly();
  readonly success = this._success.asReadonly();
  readonly error = this._error.asReadonly();
  readonly customerName = this._customerName.asReadonly();

  setCart(cart: PreCheckoutResponse): void {
    this._cart.set(cart);
  }

  setSuccess(success: CheckoutSuccessResponse): void {
    this._success.set(success);
  }

  setCustomerName(name: string | null): void {
    this._customerName.set(name);
  }

  setError(error: FrontendErrorResponse | null): void {
    this._error.set(error);
  }

  clear(): void {
    this._cart.set(null);
    this._success.set(null);
    this._error.set(null);
    this._customerName.set(null);
  }
}
