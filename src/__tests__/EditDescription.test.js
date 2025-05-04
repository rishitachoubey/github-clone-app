import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import App from '../App';
import { GET_REPOSITORIES_WITH_PRS } from '../queries/getRepositories';
import { UPDATE_REPOSITORY } from '../mutations/updateRepo';
import '@testing-library/jest-dom';

const fetchMock = {
  request: {
    query: GET_REPOSITORIES_WITH_PRS,
    variables: { first: 10 }
  },
  result: {
    data: {
      viewer: {
        repositories: {
          nodes: [
            {
              id: 'repo1',
              name: 'editable-repo',
              description: 'Initial description',
              url: 'https://github.com/test/editable-repo',
              stargazerCount: 0,
              pullRequests: { nodes: [] }
            }
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: null
          }
        }
      }
    }
  }
};

const updateMock = {
  request: {
    query: UPDATE_REPOSITORY,
    variables: {
      repositoryId: 'repo1',
      description: 'Updated description'
    }
  },
  result: {
    data: {
      updateRepository: {
        repository: {
          id: 'repo1',
          name: 'editable-repo',
          description: 'Updated description'
        }
      }
    }
  }
};

const refetchMock = {
  request: {
    query: GET_REPOSITORIES_WITH_PRS,
    variables: { first: 10 }
  },
  result: {
    data: {
      viewer: {
        repositories: {
          nodes: [
            {
              id: 'repo1',
              name: 'editable-repo',
              description: 'Updated description',
              url: 'https://github.com/test/editable-repo',
              stargazerCount: 0,
              pullRequests: { nodes: [] }
            }
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: null
          }
        }
      }
    }
  }
};

describe('EditDescription', () => {
  it('edits description with success', async () => {
    render(
      <MockedProvider mocks={[fetchMock, updateMock, refetchMock]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('editable-repo')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('edit description'));

    const input = screen.getByLabelText('edit repository description');
    fireEvent.change(input, { target: { value: 'Updated description' } });

    fireEvent.click(screen.getByLabelText('save description'));

    await waitFor(() => {
      expect(screen.getByText(/repository description updated/i)).toBeInTheDocument();
    });
  });

  it('handles error when updating description', async () => {
    const errorMock = {
      request: {
        query: UPDATE_REPOSITORY,
        variables: {
          repositoryId: 'repo1',
          description: 'Error description'
        }
      },
      error: new Error('Failed to update')
    };

    render(
      <MockedProvider mocks={[fetchMock, errorMock]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('editable-repo')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('edit description'));

    const input = screen.getByLabelText('edit repository description');
    fireEvent.change(input, { target: { value: 'Error description' } });

    fireEvent.click(screen.getByLabelText('save description'));

    await waitFor(() => {
      expect(screen.getByText(/failed to update/i)).toBeInTheDocument();
    });
  });

  it('cancels editing description', async () => {
    render(
      <MockedProvider mocks={[fetchMock]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('editable-repo')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('edit description'));

    const input = screen.getByLabelText('edit repository description');
    fireEvent.change(input, { target: { value: 'Changed description' } });

    fireEvent.click(screen.getByLabelText('cancel edit'));

    await waitFor(() => {
      expect(screen.getByText('Initial description')).toBeInTheDocument();
    });
  });
});
