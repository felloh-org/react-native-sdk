import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import {
  PRODUCTION_ENV,
  SANDBOX_ENV,
  DEV_ENV,
} from './constants/environment';
import {
  PRELOAD,
  RENDERED,
  PROCESSING,
  SUCCESS,
  DECLINED,
} from './constants/progress';
import { isUUID } from './utils/is-uuid';

import type {
  FellohPaymentProps,
  FellohPaymentHandle,
  TransactionData,
  WebViewMessage,
} from './types';

function getBaseURL(options?: FellohPaymentProps['options']): string {
  if (options?.dev) return DEV_ENV;
  if (options?.sandbox) return SANDBOX_ENV;
  return PRODUCTION_ENV;
}

function buildPaymentURL(
  baseURL: string,
  paymentId: string,
  options?: FellohPaymentProps['options'],
): string {
  let url = `${baseURL}${paymentId}`;
  const params: string[] = [];

  if (options?.moto) {
    params.push('method=MOTO_IN_PERSON');
  }

  if (options?.design?.pay_button === false) {
    params.push('hpb=1');
  }

  if (options?.design?.store_card === false) {
    params.push('hsc=1');
  }

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  return url;
}

export const FellohPayment = forwardRef<FellohPaymentHandle, FellohPaymentProps>(
  function FellohPayment(
    { publicKey, paymentId, options, onRender, onSuccess, onDecline, onProcessing },
    ref,
  ) {
    const webViewRef = useRef<WebView>(null);
    const [status, setStatus] = useState<string>(PRELOAD);
    const [height, setHeight] = useState<number>(500);
    const transactionDataRef = useRef<TransactionData>({ transactionID: '' });

    if (!isUUID(paymentId)) {
      throw new Error(
        `Invalid paymentId: "${paymentId}" is not a valid UUID`,
      );
    }

    useImperativeHandle(ref, () => ({
      pay() {
        webViewRef.current?.postMessage(
          JSON.stringify({ type: 'INITIATE_PAY', payload: publicKey }),
        );
      },
      getStatus() {
        return status;
      },
    }));

    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const data: WebViewMessage = JSON.parse(event.nativeEvent.data);

          if (data.transactionID) {
            transactionDataRef.current = {
              transactionID: data.transactionID,
            };
          }

          if (data.iframeRedirect) {
            webViewRef.current?.injectJavaScript(
              `window.location.href = "${data.iframeRedirect}"; true;`,
            );
          }

          if (data.iframe_height) {
            setHeight(data.iframe_height);
          }

          if (data.stage) {
            switch (data.stage) {
              case RENDERED:
                setStatus(RENDERED);
                onRender?.();
                break;
              case SUCCESS:
                setStatus(SUCCESS);
                onSuccess?.(transactionDataRef.current);
                break;
              case DECLINED:
                setStatus(DECLINED);
                onDecline?.(transactionDataRef.current);
                break;
              case PROCESSING:
                setStatus(PROCESSING);
                onProcessing?.(transactionDataRef.current);
                break;
            }
          }
        } catch {
          // Silently ignore malformed messages, matching web SDK behaviour
        }
      },
      [onRender, onSuccess, onDecline, onProcessing],
    );

    const baseURL = getBaseURL(options);
    const uri = buildPaymentURL(baseURL, paymentId, options);

    return (
      <WebView
        ref={webViewRef}
        source={{ uri }}
        style={[styles.webview, { height }]}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['https://*', 'http://*']}
        testID="felloh-webview"
      />
    );
  },
);

const styles = StyleSheet.create({
  webview: {
    width: '100%',
    backgroundColor: 'transparent',
  },
});
