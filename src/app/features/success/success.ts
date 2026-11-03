import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CheckoutStateService } from '../../core/services/checkout-state.service';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './success.html'
})
export class SuccessComponent {
  private state = inject(CheckoutStateService);
  private router = inject(Router);

  success = this.state.success;

  firstName = computed(() => {
    const name = this.state.customerName()?.trim();
    if (!name) return null;
    const first = name.split(/\s+/)[0].toLowerCase();
    return first.charAt(0).toUpperCase() + first.slice(1);
  });

  newCheckout(): void {
    this.state.clear();
    this.router.navigate(['/pagamento']);
  }
}
