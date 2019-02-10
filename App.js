import React, { Component } from 'react';
import { ApolloProvider } from 'react-apollo';

import initApollo from './lib/init-apollo';
import App from './lib/drawing';

const apolloClient = initApollo({}, true);

// eslint-disable-next-line react/prefer-stateless-function
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
