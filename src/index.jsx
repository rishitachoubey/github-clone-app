import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
