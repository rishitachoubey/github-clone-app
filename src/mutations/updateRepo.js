import { gql } from '@apollo/client';

export const UPDATE_REPOSITORY = gql`
  mutation($repositoryId: ID!, $description: String!) {
    updateRepository(input: {
      repositoryId: $repositoryId,
      description: $description
    }) {
      repository {
        id
        name
        description
      }
    }
  }
`; 