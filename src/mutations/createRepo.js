import { gql } from '@apollo/client';

export const CREATE_REPOSITORY = gql`
  mutation($name: String!, $description: String) {
    createRepository(input: {
      name: $name,
      description: $description,
      visibility: PUBLIC
    }) {
      repository {
        id
        name
        url
      }
    }
  }
`; 