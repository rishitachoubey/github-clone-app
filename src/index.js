import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/client';
import App from './App';
import client from './apolloClient';
import { ThemeProvider } from './ThemeContext';
import Layout from './components/Layout';

ReactDOM.render(
  <ApolloProvider client={client}>
    <ThemeProvider>
      <Layout>
        <App />
      </Layout>
    </ThemeProvider>
  </ApolloProvider>,
  document.getElementById('root')
);
