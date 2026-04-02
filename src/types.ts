export interface FellohDesignOptions {
  /** Show the built-in pay button. Defaults to true. */
  pay_button?: boolean;
  /** Show the card storage option. Defaults to true. */
  store_card?: boolean;
}

export interface FellohPaymentOptions {
  /** Use the local development environment. */
  dev?: boolean;
  /** Use the sandbox environment. */
  sandbox?: boolean;
  /** Enable Mail Order/Telephone Order mode. */
  moto?: boolean;
  /** Design customisation options. */
  design?: FellohDesignOptions;
}

export interface FellohPaymentProps {
  /** Felloh publishable API key. */
  publicKey: string;
  /** Payment ID (UUID) to render. */
  paymentId: string;
  /** SDK configuration options. */
  options?: FellohPaymentOptions;
  /** Called when the payment form has rendered. */
  onRender?: () => void;
  /** Called when the payment succeeds. */
  onSuccess?: (transactionData: TransactionData) => void;
  /** Called when the payment is declined. */
  onDecline?: (transactionData: TransactionData) => void;
  /** Called when the payment is processing. */
  onProcessing?: (transactionData: TransactionData) => void;
}

export interface TransactionData {
  transactionID: string;
}

export interface FellohPaymentHandle {
  /** Programmatically initiate payment. */
  pay: () => void;
  /** Get the current payment status. */
  getStatus: () => string;
}

export interface WebViewMessage {
  iframeRedirect?: string;
  transactionID?: string;
  stage?: string;
  iframe_height?: number;
}
