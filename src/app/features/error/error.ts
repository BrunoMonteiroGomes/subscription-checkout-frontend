import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CheckoutStateService } from '../../core/services/checkout-state.service';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [],
  templateUrl: './error.html'
})
export class ErrorComponent {
  private state = inject(CheckoutStateService);
  private router = inject(Router);

  error = this.state.error;

  executeAction(url: string): void {
    this.state.setError(null);
    this.router.navigate(['/pagamento']);
  }
}
