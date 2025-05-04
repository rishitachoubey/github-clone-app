import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import App from '../App';
import { GET_REPOSITORIES_WITH_PRS } from '../queries/getRepositories';
import { UPDATE_REPOSITORY } from '../mutations/updateRepo';
import '@testing-library/jest-dom';

const mockRepositories = {
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
              id: '1',
              name: 'test-repo',
              description: 'test description',
              stargazerCount: 5,
              url: 'https://github.com/test/test-repo',
              pullRequests: {
                nodes: [
                  { id: 'pr1', title: 'Initial PR', url: '#', state: 'OPEN' }
                ]
              }
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

const updateRepoSuccess = {
  request: {
    query: UPDATE_REPOSITORY,
    variables: { repositoryId: '1', description: 'updated description' }
  },
  result: {
    data: {
      updateRepository: {
        repository: {
          id: '1',
          name: 'test-repo',
          description: 'updated description'
        }
      }
    }
  }
};

const updateRepoError = {
  request: {
    query: UPDATE_REPOSITORY,
    variables: { repositoryId: '1', description: 'bad desc' }
  },
  error: new Error('Update failed')
};

const multiRepoMock = {
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
              id: '1',
              name: 'test-repo-1',
              description: 'first repo',
              stargazerCount: 5,
              url: 'https://github.com/test/test-repo-1',
              pullRequests: { nodes: [] }
            },
            {
              id: '2',
              name: 'test-repo-2',
              description: 'second repo',
              stargazerCount: 10,
              url: 'https://github.com/test/test-repo-2',
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

describe('App.js tests', () => {
  it('renders repositories after loading', async () => {
    render(
      <MockedProvider mocks={[mockRepositories]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('test-repo')).toBeInTheDocument();
      expect(screen.getByText('test description')).toBeInTheDocument();
    });
  });

  it('enters edit mode and updates description successfully', async () => {
    render(
      <MockedProvider mocks={[mockRepositories, updateRepoSuccess, mockRepositories]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => screen.getByText('test description'));
    
    // Click the edit button
    const editButton = screen.getByLabelText('edit description');
    fireEvent.click(editButton);

    // Find the input field and update it
    const input = screen.getByLabelText('edit repository description');
    fireEvent.change(input, { target: { value: 'updated description' } });
    
    // Click the save button
    const saveButton = screen.getByLabelText('save description');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/repository description updated/i)).toBeInTheDocument();
    });
  });

  it('handles error when description update fails', async () => {
    render(
      <MockedProvider mocks={[mockRepositories, updateRepoError]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => screen.getByText('test description'));
    
    // Click the edit button
    const editButton = screen.getByLabelText('edit description');
    fireEvent.click(editButton);

    // Find the input field and update it
    const input = screen.getByLabelText('edit repository description');
    fireEvent.change(input, { target: { value: 'bad desc' } });
    
    // Click the save button
    const saveButton = screen.getByLabelText('save description');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
    });
  });

  it('dismisses snackbar notification', async () => {
    render(
      <MockedProvider mocks={[mockRepositories, updateRepoSuccess, mockRepositories]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => screen.getByText('test description'));
    
    // Click the edit button
    const editButton = screen.getByLabelText('edit description');
    fireEvent.click(editButton);

    // Find the input field and update it
    const input = screen.getByLabelText('edit repository description');
    fireEvent.change(input, { target: { value: 'updated description' } });
    
    // Click the save button
    const saveButton = screen.getByLabelText('save description');
    fireEvent.click(saveButton);

    const snackbar = await screen.findByText(/repository description updated/i);
    expect(snackbar).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByText(/repository description updated/i)).not.toBeInTheDocument();
    });
  });

  it('toggles repo collapse when clicking title', async () => {
    render(
      <MockedProvider mocks={[mockRepositories]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => screen.getByText('test-repo'));

    const title = screen.getByText('test-repo');
    fireEvent.click(title);
    expect(screen.getByText('Initial PR')).toBeInTheDocument();

    fireEvent.click(title);
    await waitFor(() => {
      expect(screen.queryByText('Initial PR')).not.toBeInTheDocument();
    });
  });

  it('shows pull request inside expanded repo', async () => {
    render(
      <MockedProvider mocks={[mockRepositories]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => screen.getByText('test-repo'));
    
    // Click on the title to expand
    fireEvent.click(screen.getByText('test-repo'));
    
    // Wait for the PR text to appear
    await waitFor(() => {
      expect(screen.getByText('Initial PR')).toBeInTheDocument();
    });
  });

  it('handles multiple repository interactions', async () => {
    render(
      <MockedProvider mocks={[multiRepoMock]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('test-repo-1')).toBeInTheDocument();
      expect(screen.getByText('test-repo-2')).toBeInTheDocument();
    });

    // Test expanding/collapsing multiple repositories
    const firstRepoTitle = screen.getByText('test-repo-1');
    const secondRepoTitle = screen.getByText('test-repo-2');
    
    fireEvent.click(firstRepoTitle);
    fireEvent.click(secondRepoTitle);
  });

  it('displays pull request state correctly after clicking repository', async () => {
    render(
      <MockedProvider mocks={[mockRepositories]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => expect(screen.getByText('test-repo')).toBeInTheDocument());

    // Expand repository details
    fireEvent.click(screen.getByText('test-repo'));
    
    // Confirm PR title appears
    expect(screen.getByText('Initial PR')).toBeInTheDocument();
    
    // Confirm 'OPEN' status inside the span
    expect(screen.getByText(/\[?\s*OPEN\s*\]?/)).toBeInTheDocument();
  });

  it('opens GitHub repo URL when clicking on open URL button', async () => {
    render(
      <MockedProvider mocks={[mockRepositories]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => expect(screen.getByText('test-repo')).toBeInTheDocument());
    
    // Mock window.open
    const mockOpen = jest.fn();
    window.open = mockOpen;

    // Click the open URL button
    const openUrlButton = screen.getByRole('button', { name: /open repo/i });
    fireEvent.click(openUrlButton);

    // Verify the URL was opened
    expect(mockOpen).toHaveBeenCalledWith('https://github.com/test/test-repo', '_blank');
  });

  it('handles pagination correctly', async () => {
    const paginatedMock = {
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
                  id: '1',
                  name: 'first-page',
                  description: 'first page repo',
                  stargazerCount: 5,
                  url: 'https://github.com/test/first-page',
                  pullRequests: { nodes: [] }
                }
              ],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor1'
              }
            }
          }
        }
      }
    };

    const secondPageMock = {
      request: {
        query: GET_REPOSITORIES_WITH_PRS,
        variables: { first: 10, after: 'cursor1' }
      },
      result: {
        data: {
          viewer: {
            repositories: {
              nodes: [
                {
                  id: '2',
                  name: 'second-page',
                  description: 'second page repo',
                  stargazerCount: 10,
                  url: 'https://github.com/test/second-page',
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

    render(
      <MockedProvider mocks={[paginatedMock, secondPageMock]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('first-page')).toBeInTheDocument();
    });

    const loadMoreButton = screen.getByText('Load More');
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(screen.getByText('second-page')).toBeInTheDocument();
    });
  });

  it('handles GraphQL error state', async () => {
    const errorMock = {
      request: {
        query: GET_REPOSITORIES_WITH_PRS,
        variables: { first: 10 }
      },
      error: new Error('Failed to fetch repositories')
    };

    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error: failed to fetch repositories/i)).toBeInTheDocument();
    });
  });

  it('handles empty repository list', async () => {
    const emptyMock = {
      request: {
        query: GET_REPOSITORIES_WITH_PRS,
        variables: { first: 10 }
      },
      result: {
        data: {
          viewer: {
            repositories: {
              nodes: [],
              pageInfo: {
                hasNextPage: false,
                endCursor: null
              }
            }
          }
        }
      }
    };

    render(
      <MockedProvider mocks={[emptyMock]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('My GitHub Repositories')).toBeInTheDocument();
    });
  });

  it('handles snackbar auto-hide', async () => {
    jest.useFakeTimers();
    
    render(
      <MockedProvider mocks={[mockRepositories, updateRepoSuccess, mockRepositories]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => screen.getByText('test description'));
    
    const editButton = screen.getByLabelText('edit description');
    fireEvent.click(editButton);

    const input = screen.getByLabelText('edit repository description');
    fireEvent.change(input, { target: { value: 'updated description' } });
    
    const saveButton = screen.getByLabelText('save description');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/repository description updated/i)).toBeInTheDocument();
    });

    // Fast-forward timers to trigger auto-hide
    jest.advanceTimersByTime(6000);

    await waitFor(() => {
      expect(screen.queryByText(/repository description updated/i)).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });
}); 