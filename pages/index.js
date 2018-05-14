import React, { PureComponent } from 'react';
import { Svg, G, Path, Rect, RadialGradient, Defs, Stop } from 'svgs';

import DrawingComponentFactory from '../lib/drawing';

const App = DrawingComponentFactory(
  Svg,
  G,
  Path,
  Rect,
  RadialGradient,
  Defs,
  Stop,
);

export default class Root extends PureComponent {
  state = { noSSR: true };
  componentDidMount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ noSSR: false });
  }
  render() {
    return this.state.noSSR ? null : <App />;
  }
}
