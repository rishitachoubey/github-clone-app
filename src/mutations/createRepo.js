import { gql } from '@apollo/client';

/**
 * Mutation to create a new public repository
 * @param {String} name - The name of the new repository
 * @param {String} description - Optional description for the repository
 */
export const CREATE_REPOSITORY = gql`
  mutation($name: String!, $description: String) {
    createRepository(
      input: {
        name: $name,
        description: $description,
        visibility: PUBLIC
      }
    ) {
      repository {
        id
        name
        url
        description
        createdAt
        stargazerCount
      }
    }
  }
`;
