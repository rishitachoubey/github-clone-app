import { gql } from '@apollo/client';

export const GET_REPOSITORIES_WITH_PRS = gql`
  query {
    viewer {
      repositories(first: 10, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          id
          name
          description
          url
          stargazerCount
          pullRequests(first: 10, orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes {
              id
              title
              state
              url
            }
          }
        }
      }
    }
  }
`; 