import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CheckoutStateService } from '../services/checkout-state.service';

export const paymentSuccessGuard: CanActivateFn = () => {
  const state = inject(CheckoutStateService);
  const router = inject(Router);

  if (state.success()) {
    return true;
  }

  router.navigate(['/pagamento']);
  return false;
};
