import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://api.github.com/graphql' }), // Replace with your endpoint
  cache: new InMemoryCache(),
});

export default client; 