import { gql } from '@apollo/client';

/**
 * Basic repository query without pagination
 * Used for simple repository listings
 */
export const GET_REPOSITORIES = gql`
  query {
    viewer {
      repositories(
        first: 10, 
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        nodes {
          id
          name
          description
          stargazerCount
          url
        }
      }
    }
  }
`;

/**
 * Extended repository query with pagination and pull requests
 * Includes:
 * - Pagination info (hasNextPage, endCursor)
 * - Repository details
 * - Associated pull requests
 */
export const GET_REPOSITORIES_WITH_PRS = gql`
  query($first: Int, $after: String) {
    viewer {
      repositories(
        first: $first, 
        after: $after, 
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          name
          description
          url  
          stargazerCount
          pullRequests(
            first: 10, 
            orderBy: { field: CREATED_AT, direction: DESC }
          ) {
            nodes {
              id
              title
              state
              url
              author {
                login
              }
            }
          }
        }
      }
    }
  }
`;


