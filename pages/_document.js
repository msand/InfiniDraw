import React from 'react';
import { AppRegistry } from 'react-native-web';
import Document, { Head, Main, NextScript } from 'next/document';

if (process.browser) {
  // prevent pan and zoom on safari
  document.addEventListener('gesturestart',
    e => {
      e.preventDefault();
    },);
  document.documentElement.addEventListener(
    'touchstart',
    e => {
      e.preventDefault();
    },
    false,
  );
  document.addEventListener(
    'touchmove',
    e => {
      e.preventDefault();
    },
    false,
  );
  let lastTouchEnd = 0;
  document.documentElement.addEventListener(
    'touchend',
    e => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    },
    false,
  );
}

let index = 0;

// Force Next-generated DOM elements to fill their parent's height.
// Not required for using of react-native-web, but helps normalize
// layout for top-level wrapping elements.
const normalizeNextElements = `
  html, body {
    width: 100%;
    height: 100%;
    position: fixed;
    overflow: hidden;
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
  }
  body > div:first-child,
  #__next {
    height: 100%;
  }
`;

export default class MyDocument extends Document {
  static async getInitialProps({ renderPage }) {
    AppRegistry.registerComponent('Main', () => Main);
    const { getStyleElement } = AppRegistry.getApplication('Main');
    const page = renderPage();
    const styles = [
      <style
        key={index++}
        dangerouslySetInnerHTML={{ __html: normalizeNextElements }}
      />,
      getStyleElement(),
    ];
    return { ...page, styles };
  }

  render() {
    return (
      <html>
        <Head>
          <title>InfiniDraw</title>
          <meta
            name="viewport"
            content="user-scalable=no, width=device-width"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
