import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost';
import { getMainDefinition } from 'apollo-utilities';
import { WebSocketLink } from 'apollo-link-ws';
import fetch from 'isomorphic-unfetch';
import { split } from 'apollo-link';

let apolloClient = null;

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch;
}
/*
  Deploy backend to get uris

  cd server
  graphcool deploy

  Simple API:        https://api.graph.cool/simple/v1/cjh2g1fxn6gsw0108o6ud01ms
  Relay API:         https://api.graph.cool/relay/v1/cjh2g1fxn6gsw0108o6ud01ms
  Subscriptions API: wss://subscriptions.graph.cool/v1/cjh2g1fxn6gsw0108o6ud01ms
*/
function create(initialState, native) {
  const httpLink = new HttpLink({
    uri: 'https://api.graph.cool/simple/v1/cjh2g1fxn6gsw0108o6ud01ms', // Server URL (must be absolute)
    credentials: 'same-origin', // Additional fetch() options like `credentials` or `headers`
  });
  const wsLink =
    (process.browser || native) &&
    new WebSocketLink({
      uri: 'wss://subscriptions.graph.cool/v1/cjh2g1fxn6gsw0108o6ud01ms',
      options: {
        reconnect: true,
      },
    });
  const link =
    !process.browser && !native
      ? httpLink
      : split(
          ({ query }) => {
            const { kind, operation } = getMainDefinition(query);
            return (
              kind === 'OperationDefinition' && operation === 'subscription'
            );
          },
          wsLink,
          httpLink,
        );
  return new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser && !native, // Disables forceFetch on the server (so queries are only run once)
    link,
    cache: new InMemoryCache().restore(initialState || {}),
  });
}

export default function initApollo(initialState, native) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser && !native) {
    return create(initialState, false);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState, native);
  }

  return apolloClient;
}
