import { gql } from '@apollo/client';

/**
 * Mutation to update a repository's description
 * @param {String} repositoryId - The ID of the repository to update
 * @param {String} description - The new description for the repository
 */
export const UPDATE_REPOSITORY = gql`
  mutation($repositoryId: ID!, $description: String!) {
    updateRepository(
      input: {
        repositoryId: $repositoryId,
        description: $description
      }
    ) {
      repository {
        id
        name
        description
        url
        updatedAt
      }
    }
  }
`;
