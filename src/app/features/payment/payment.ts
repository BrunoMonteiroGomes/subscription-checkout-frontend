import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CheckoutApiService } from '../../core/services/checkout-api.service';
import { CheckoutStateService } from '../../core/services/checkout-state.service';
import { CheckoutRequest, FrontendErrorResponse } from '../../core/models/checkout';

function cardNumberValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value ?? '') as string;
  if (!value) return null;
  return /^\d{4}( \d{1,4}){2,4}$/.test(value) && /^\d{13,19}$/.test(value.replace(/ /g, ''))
    ? null
    : { pattern: true };
}

const QR_SIZE = 25;

function buildSimulatedQrPath(code: string): string {
  let seed = 0;
  for (let i = 0; i < code.length; i++) {
    seed = (Math.imul(seed, 31) + code.charCodeAt(i)) | 0;
  }
  const random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const finderOrigins = [
    [0, 0],
    [QR_SIZE - 7, 0],
    [0, QR_SIZE - 7]
  ];
  const inFinderZone = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= QR_SIZE - 8 && y < 8) || (x < 8 && y >= QR_SIZE - 8);

  let path = '';
  const cell = (x: number, y: number) => {
    path += `M${x} ${y}h1v1h-1z`;
  };

  for (const [ox, oy] of finderOrigins) {
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        const ring = dx === 0 || dx === 6 || dy === 0 || dy === 6;
        const center = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        if (ring || center) cell(ox + dx, oy + dy);
      }
    }
  }

  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      if (!inFinderZone(x, y) && random() < 0.5) cell(x, y);
    }
  }
  return path;
}

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
  pixCopied = signal(false);
  readonly qrSize = QR_SIZE;
  pixQrPath = computed(() => {
    const code = this.pixCode();
    return code ? buildSimulatedQrPath(code) : '';
  });
  private copyTimeout?: ReturnType<typeof setTimeout>;

  cardForm = this.fb.group({
    holderName: ['', [Validators.required, Validators.minLength(3)]],
    number: ['', [Validators.required, cardNumberValidator]],
    expiry: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
  });

  get isCard(): boolean {
    return this.selectedMethod() !== 'Pix';
  }

  get showNumberError(): boolean {
    const control = this.cardForm.controls.number;
    return control.invalid && (control.touched || control.dirty);
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

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 19);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = formatted;
    const control = this.cardForm.controls.number;
    control.setValue(formatted);
    control.markAsDirty();
  }

  selectMethod(method: string): void {
    this.selectedMethod.set(method);
    this.pixCode.set(null);
    this.pixCopied.set(false);
  }

  generatePixCode(): void {
    this.pixCode.set('PIX-' + Math.random().toString(36).substring(2, 14).toUpperCase());
    this.pixCopied.set(false);
  }

  async copyPixCode(): Promise<void> {
    const code = this.pixCode();
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    this.pixCopied.set(true);
    clearTimeout(this.copyTimeout);
    this.copyTimeout = setTimeout(() => this.pixCopied.set(false), 2000);
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
        ...(this.isCard
          ? {
              card: {
                ...this.cardForm.value,
                number: (this.cardForm.value.number ?? '').replace(/\s/g, '')
              } as any
            }
          : {})
      }
    };

    this.api.checkout(request).subscribe({
      next: response => {
        this.state.setCustomerName(
          this.isCard ? (this.cardForm.value.holderName ?? '').trim() || null : null
        );
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
