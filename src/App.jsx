import React from 'react';
import { useQuery, gql } from '@apollo/client';

const TEST_QUERY = gql`
  query {
    __typename
  }
`;

const App = () => {
  const { loading, error, data } = useQuery(TEST_QUERY);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Hello Apollo! Typename: {data.__typename}</div>;
};

export default App;
