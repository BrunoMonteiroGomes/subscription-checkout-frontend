import { Component, inject } from '@angular/core';
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

  newCheckout(): void {
    this.state.clear();
    this.router.navigate(['/pagamento']);
  }
}
