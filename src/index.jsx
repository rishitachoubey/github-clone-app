import React from 'react';
import ReactDOM from 'react-dom/client'; // For React 18's new root API
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from './ThemeContext'; 
import Layout from './components/Layout'; 
import App from './App'; 
import { client } from './apolloClient'; 

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement); // React 18 root API

root.render(
  <ApolloProvider client={client}>
    <ThemeProvider>
      <Layout>
        <App />
      </Layout>
    </ThemeProvider>
  </ApolloProvider>
);
