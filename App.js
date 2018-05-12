import React, { Component } from 'react';
import { ApolloProvider } from 'react-apollo';
import { Svg, G, Path, Rect } from 'react-native-svg';

import initApollo from './lib/init-apollo';
import DrawingComponentFactory from './lib/drawing';

const App = DrawingComponentFactory(Svg, G, Path, Rect);

const apolloClient = initApollo({}, true);

class InfiniDraw extends Component {
  render() {
    return (
      <ApolloProvider client={apolloClient}>
        <App />
      </ApolloProvider>
    );
  }
}

export default InfiniDraw;
