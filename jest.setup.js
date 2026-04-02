global.__DEV__ = true;

// Mock react-native
jest.mock('react-native', () => {
  const React = require('react');
  return {
    StyleSheet: {
      create: (styles) => styles,
    },
    View: (props) => React.createElement('View', props),
    Text: (props) => React.createElement('Text', props),
    Platform: { OS: 'ios', select: (obj) => obj.ios },
  };
});

// Mock react-native-webview
jest.mock('react-native-webview', () => {
  const React = require('react');

  const WebView = React.forwardRef((props, ref) => {
    const postedMessages = [];

    React.useImperativeHandle(ref, () => ({
      postMessage: (msg) => postedMessages.push(msg),
      injectJavaScript: (js) => postedMessages.push(js),
    }));

    return React.createElement('WebView', {
      ...props,
      ref,
    });
  });

  WebView.displayName = 'WebView';

  return { WebView, default: WebView };
});
