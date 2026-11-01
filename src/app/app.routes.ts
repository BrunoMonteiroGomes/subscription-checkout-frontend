import { Routes } from '@angular/router';
import { paymentSuccessGuard } from './core/guards/payment-success-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'pagamento', pathMatch: 'full' },
  {
    path: 'pagamento',
    loadComponent: () =>
      import('./features/payment/payment').then(m => m.PaymentComponent)
  },
  {
    path: 'sucesso',
    loadComponent: () =>
      import('./features/success/success').then(m => m.SuccessComponent),
    canActivate: [paymentSuccessGuard]
  },
  {
    path: 'erro',
    loadComponent: () =>
      import('./features/error/error').then(m => m.ErrorComponent)
  },
  { path: '**', redirectTo: 'pagamento' }
];
