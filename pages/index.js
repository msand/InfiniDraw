import React, { PureComponent } from 'react';

import App from '../lib/drawing';

export default class Root extends PureComponent {
  state = { noSSR: true };

  componentDidMount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ noSSR: false });
  }

  render() {
    const { noSSR } = this.state;
    return noSSR ? null : <App />;
  }
}
