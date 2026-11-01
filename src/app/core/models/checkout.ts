export interface CardData {
  holderName: string;
  number: string;
  expiry: string;
  cvv: string;
}

export interface CheckoutRequest {
  cartId: string;
  paymentMethod: {
    name: string;
    card?: CardData;
  };
}

export interface CheckoutSuccessResponse {
  cartId: string;
  status: string;
  paidAt: string;
  payment: {
    method: string;
    lastDigits: string;
    amount: number;
    currency: string;
  };
  products: {
    slug: string;
    name: string;
    price: number;
  }[];
}

export interface FrontendErrorResponse {
  displayType: 'BLOCK' | 'INTERVENTION';
  errorCode: string;
  cartId: string | null;
  frontendError: {
    code: string;
    title: string;
    description: string;
    primaryButton: { label: string; url: string };
    secondaryButton?: { label: string; url: string };
  };
}
