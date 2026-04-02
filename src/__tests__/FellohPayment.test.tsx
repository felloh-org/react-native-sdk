import React, { createRef } from 'react';
import renderer, { act } from 'react-test-renderer';

import { FellohPayment } from '../FellohPayment';
import type { FellohPaymentHandle } from '../types';
import {
  PRODUCTION_ENV,
  SANDBOX_ENV,
  DEV_ENV,
} from '../constants/environment';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const PUBLIC_KEY = 'pk_test_abc123';

function renderComponent(props: Partial<React.ComponentProps<typeof FellohPayment>> = {}) {
  const defaultProps = { publicKey: PUBLIC_KEY, paymentId: VALID_UUID };
  const component = renderer.create(
    <FellohPayment {...defaultProps} {...props} />,
  );
  return component;
}

function getWebViewProps(component: renderer.ReactTestRenderer) {
  return component.root.findByType('WebView' as any).props;
}

describe('FellohPayment', () => {
  describe('rendering', () => {
    it('renders a WebView with the correct production URL', () => {
      const component = renderComponent();
      const props = getWebViewProps(component);

      expect(props.source).toEqual({
        uri: `${PRODUCTION_ENV}${VALID_UUID}`,
      });
    });

    it('uses sandbox URL when sandbox option is set', () => {
      const component = renderComponent({ options: { sandbox: true } });
      const props = getWebViewProps(component);

      expect(props.source).toEqual({
        uri: `${SANDBOX_ENV}${VALID_UUID}`,
      });
    });

    it('uses dev URL when dev option is set', () => {
      const component = renderComponent({ options: { dev: true } });
      const props = getWebViewProps(component);

      expect(props.source).toEqual({
        uri: `${DEV_ENV}${VALID_UUID}`,
      });
    });

    it('appends MOTO query parameter when moto is enabled', () => {
      const component = renderComponent({ options: { moto: true } });
      const props = getWebViewProps(component);

      expect(props.source.uri).toContain('?method=MOTO_IN_PERSON');
    });

    it('appends hpb=1 when pay_button is disabled', () => {
      const component = renderComponent({
        options: { design: { pay_button: false } },
      });
      const props = getWebViewProps(component);

      expect(props.source.uri).toContain('hpb=1');
    });

    it('appends hsc=1 when store_card is disabled', () => {
      const component = renderComponent({
        options: { design: { store_card: false } },
      });
      const props = getWebViewProps(component);

      expect(props.source.uri).toContain('hsc=1');
    });

    it('combines multiple query parameters', () => {
      const component = renderComponent({
        options: {
          moto: true,
          design: { pay_button: false, store_card: false },
        },
      });
      const uri = getWebViewProps(component).source.uri;

      expect(uri).toContain('method=MOTO_IN_PERSON');
      expect(uri).toContain('hpb=1');
      expect(uri).toContain('hsc=1');
    });

    it('does not append query params when design options are true', () => {
      const component = renderComponent({
        options: { design: { pay_button: true, store_card: true } },
      });
      const uri = getWebViewProps(component).source.uri;

      expect(uri).not.toContain('?');
    });

    it('enables javascript and dom storage on the WebView', () => {
      const component = renderComponent();
      const props = getWebViewProps(component);

      expect(props.javaScriptEnabled).toBe(true);
      expect(props.domStorageEnabled).toBe(true);
    });

    it('sets testID on the WebView', () => {
      const component = renderComponent();
      const props = getWebViewProps(component);

      expect(props.testID).toBe('felloh-webview');
    });
  });

  describe('validation', () => {
    it('throws when paymentId is not a valid UUID', () => {
      expect(() => renderComponent({ paymentId: 'invalid-id' })).toThrow(
        'Invalid paymentId: "invalid-id" is not a valid UUID',
      );
    });

    it('throws for empty paymentId', () => {
      expect(() => renderComponent({ paymentId: '' })).toThrow(
        'Invalid paymentId',
      );
    });
  });

  describe('imperative handle', () => {
    it('exposes pay() method via ref', () => {
      const ref = createRef<FellohPaymentHandle>();

      renderer.create(
        <FellohPayment
          ref={ref}
          publicKey={PUBLIC_KEY}
          paymentId={VALID_UUID}
        />,
      );

      expect(ref.current).toBeTruthy();
      expect(typeof ref.current!.pay).toBe('function');
    });

    it('exposes getStatus() which defaults to preload', () => {
      const ref = createRef<FellohPaymentHandle>();

      renderer.create(
        <FellohPayment
          ref={ref}
          publicKey={PUBLIC_KEY}
          paymentId={VALID_UUID}
        />,
      );

      expect(ref.current!.getStatus()).toBe('preload');
    });
  });

  describe('message handling', () => {
    it('calls onRender when stage is rendered', () => {
      const onRender = jest.fn();
      const component = renderComponent({ onRender });

      act(() => {
        getWebViewProps(component).onMessage({
          nativeEvent: { data: JSON.stringify({ stage: 'rendered' }) },
        });
      });

      expect(onRender).toHaveBeenCalledTimes(1);
    });

    it('calls onSuccess with transaction data', () => {
      const onSuccess = jest.fn();
      const component = renderComponent({ onSuccess });

      act(() => {
        getWebViewProps(component).onMessage({
          nativeEvent: {
            data: JSON.stringify({ transactionID: 'txn-123' }),
          },
        });
      });

      act(() => {
        getWebViewProps(component).onMessage({
          nativeEvent: { data: JSON.stringify({ stage: 'success' }) },
        });
      });

      expect(onSuccess).toHaveBeenCalledWith({ transactionID: 'txn-123' });
    });

    it('calls onDecline with transaction data', () => {
      const onDecline = jest.fn();
      const component = renderComponent({ onDecline });

      act(() => {
        getWebViewProps(component).onMessage({
          nativeEvent: {
            data: JSON.stringify({ transactionID: 'txn-456' }),
          },
        });
      });

      act(() => {
        getWebViewProps(component).onMessage({
          nativeEvent: { data: JSON.stringify({ stage: 'declined' }) },
        });
      });

      expect(onDecline).toHaveBeenCalledWith({ transactionID: 'txn-456' });
    });

    it('calls onProcessing with transaction data', () => {
      const onProcessing = jest.fn();
      const component = renderComponent({ onProcessing });

      act(() => {
        getWebViewProps(component).onMessage({
          nativeEvent: {
            data: JSON.stringify({ transactionID: 'txn-789' }),
          },
        });
      });

      act(() => {
        getWebViewProps(component).onMessage({
          nativeEvent: { data: JSON.stringify({ stage: 'processing' }) },
        });
      });

      expect(onProcessing).toHaveBeenCalledWith({ transactionID: 'txn-789' });
    });

    it('silently ignores malformed messages', () => {
      const onRender = jest.fn();
      const component = renderComponent({ onRender });

      expect(() => {
        act(() => {
          getWebViewProps(component).onMessage({
            nativeEvent: { data: 'not valid json{{{' },
          });
        });
      }).not.toThrow();

      expect(onRender).not.toHaveBeenCalled();
    });

    it('updates status via ref after stage messages', () => {
      const ref = createRef<FellohPaymentHandle>();
      const component = renderer.create(
        <FellohPayment
          ref={ref}
          publicKey={PUBLIC_KEY}
          paymentId={VALID_UUID}
        />,
      );

      act(() => {
        component.root.findByType('WebView' as any).props.onMessage({
          nativeEvent: { data: JSON.stringify({ stage: 'rendered' }) },
        });
      });

      expect(ref.current!.getStatus()).toBe('rendered');
    });
  });
});
