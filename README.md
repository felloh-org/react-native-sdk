# React Native SDK

[![Release](https://github.com/felloh-org/react-native-sdk/actions/workflows/release.yml/badge.svg)](https://github.com/felloh-org/react-native-sdk/actions/workflows/release.yml)

React Native SDK for [Felloh](https://felloh.com) payments. Embed a secure payment form in your React Native app using a WebView-based component.

## Installation

```bash
npm install @felloh-org/react-native-sdk react-native-webview
```

or

```bash
yarn add @felloh-org/react-native-sdk react-native-webview
```

### iOS

```bash
cd ios && pod install
```

## Prerequisites

Before using this SDK, you need to:

1. Create a Felloh account at [felloh.com](https://felloh.com)
2. Obtain your publishable API key
3. Create a payment via the [Felloh API](https://docs.felloh.com)

## Quick Start

```tsx
import React, { useRef } from 'react';
import { View, Button } from 'react-native';
import { FellohPayment, FellohPaymentHandle } from '@felloh-org/react-native-sdk';

function PaymentScreen() {
  const paymentRef = useRef<FellohPaymentHandle>(null);

  return (
    <View style={{ flex: 1 }}>
      <FellohPayment
        ref={paymentRef}
        publicKey="your-publishable-key"
        paymentId="your-payment-uuid"
        onRender={() => console.log('Payment form loaded')}
        onSuccess={(data) => console.log('Payment succeeded', data.transactionID)}
        onDecline={(data) => console.log('Payment declined', data.transactionID)}
        onProcessing={(data) => console.log('Payment processing', data.transactionID)}
      />
      <Button
        title="Pay Now"
        onPress={() => paymentRef.current?.pay()}
      />
    </View>
  );
}
```

## API

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `publicKey` | `string` | Yes | Felloh publishable API key |
| `paymentId` | `string` | Yes | Payment UUID from the Felloh API |
| `options` | `FellohPaymentOptions` | No | Configuration options |
| `onRender` | `() => void` | No | Called when the payment form is ready |
| `onSuccess` | `(data: TransactionData) => void` | No | Called on successful payment |
| `onDecline` | `(data: TransactionData) => void` | No | Called when payment is declined |
| `onProcessing` | `(data: TransactionData) => void` | No | Called when payment is processing |

### Options

```ts
interface FellohPaymentOptions {
  dev?: boolean;       // Use local development environment
  sandbox?: boolean;   // Use sandbox environment
  moto?: boolean;      // Enable Mail Order/Telephone Order mode
  design?: {
    pay_button?: boolean;  // Show built-in pay button (default: true)
    store_card?: boolean;  // Show card storage option (default: true)
  };
}
```

### Ref Methods

Access via a ref (`useRef<FellohPaymentHandle>`):

| Method | Description |
|--------|-------------|
| `pay()` | Programmatically trigger payment |
| `getStatus()` | Get current status: `preload`, `rendered`, `processing`, `success`, or `declined` |

### Status Constants

```ts
import { PRELOAD, RENDERED, PROCESSING, SUCCESS, DECLINED } from '@felloh-org/react-native-sdk';
```

## Environments

| Option | URL |
|--------|-----|
| Production (default) | `https://pay.felloh.com` |
| Sandbox | `https://pay.sandbox.felloh.com` |
| Dev | `http://localhost:3010` |

## Example

```tsx
import React, { useRef } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { FellohPayment, FellohPaymentHandle } from '@felloh-org/react-native-sdk';

export default function CheckoutScreen() {
  const paymentRef = useRef<FellohPaymentHandle>(null);

  return (
    <View style={styles.container}>
      <FellohPayment
        ref={paymentRef}
        publicKey="pk_live_abc123"
        paymentId="550e8400-e29b-41d4-a716-446655440000"
        options={{
          sandbox: true,
          design: { pay_button: true, store_card: false },
        }}
        onSuccess={(data) => {
          Alert.alert('Payment Complete', `Transaction: ${data.transactionID}`);
        }}
        onDecline={() => {
          Alert.alert('Payment Declined', 'Please try again.');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
```

## License

MIT - see [LICENSE](LICENSE) for details.

## Support

- Documentation: [docs.felloh.com](https://docs.felloh.com)
- Issues: [GitHub Issues](https://github.com/felloh-org/react-native-sdk/issues)
- Security: See [SECURITY.md](SECURITY.md)
