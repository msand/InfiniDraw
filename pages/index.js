import React, { PureComponent } from 'react';
import { Svg, G, Path, Rect, RadialGradient, Defs, Stop } from 'svgs';
import NoSSR from 'react-no-ssr';

import DrawingComponentFactory from '../lib/drawing';

const App = DrawingComponentFactory(Svg, G, Path, Rect, RadialGradient, Defs, Stop);

export default class Root extends PureComponent {
  render() {
    return (
      <NoSSR>
        <App />
      </NoSSR>
    );
  }
}
