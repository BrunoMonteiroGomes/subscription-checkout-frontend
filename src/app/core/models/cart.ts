export interface ProductView {
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}

export interface PaymentMethodView {
  name: string;
}

export interface PreCheckoutResponse {
  cartId: string;
  products: ProductView[];
  paymentMethods: PaymentMethodView[];
}
