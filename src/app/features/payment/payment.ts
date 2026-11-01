import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CheckoutApiService } from '../../core/services/checkout-api.service';
import { CheckoutStateService } from '../../core/services/checkout-state.service';
import { CheckoutRequest, FrontendErrorResponse } from '../../core/models/checkout';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './payment.html'
})
export class PaymentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(CheckoutApiService);
  private state = inject(CheckoutStateService);
  private router = inject(Router);

  cart = this.state.cart;
  selectedMethod = signal('Cartão de Crédito');
  isProcessing = signal(false);
  pixCode = signal<string | null>(null);

  cardForm = this.fb.group({
    holderName: ['', [Validators.required, Validators.minLength(3)]],
    number: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
  });

  get isCard(): boolean {
    return this.selectedMethod() !== 'Pix';
  }

  get formValid(): boolean {
    return this.isCard ? this.cardForm.valid : true;
  }

  ngOnInit(): void {
    if (!this.cart()) {
      this.api.preCheckout('premium').subscribe({
        next: cart => this.state.setCart(cart),
        error: (err: FrontendErrorResponse) => {
          this.state.setError(err);
          this.router.navigate(['/erro']);
        }
      });
    }
  }

  selectMethod(method: string): void {
    this.selectedMethod.set(method);
    this.pixCode.set(null);
  }

  generatePixCode(): void {
    this.pixCode.set('PIX-' + Math.random().toString(36).substring(2, 14).toUpperCase());
  }

  submit(): void {
    if (!this.formValid || this.isProcessing()) return;

    const cart = this.cart();
    if (!cart) return;

    this.isProcessing.set(true);

    const request: CheckoutRequest = {
      cartId: cart.cartId,
      paymentMethod: {
        name: this.selectedMethod(),
        ...(this.isCard ? { card: this.cardForm.value as any } : {})
      }
    };

    this.api.checkout(request).subscribe({
      next: response => {
        this.state.setSuccess(response);
        this.isProcessing.set(false);
        this.router.navigate(['/sucesso']);
      },
      error: (err: FrontendErrorResponse) => {
        this.state.setError(err);
        this.isProcessing.set(false);
        this.router.navigate(['/erro']);
      }
    });
  }
}
