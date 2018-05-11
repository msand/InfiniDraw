import React, { PureComponent } from 'react';
import { Svg, G, Path, Rect } from 'svgs';
import NoSSR from 'react-no-ssr';

import DrawingComponentFactory from '../lib/drawing';

const App = DrawingComponentFactory(Svg, G, Path, Rect);

export default class Root extends PureComponent {
  render() {
    return (
      <NoSSR>
        <App />
      </NoSSR>
    );
  }
}
