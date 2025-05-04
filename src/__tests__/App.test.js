import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import App from '../App';
import { GET_REPOSITORIES_WITH_PRS } from '../queries/getRepositories';
import { UPDATE_REPOSITORY } from '../mutations/updateRepo';

const mockRepositories = {
  request: { query: GET_REPOSITORIES_WITH_PRS },
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
          ]
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
      <MockedProvider mocks={[mockRepositories, updateRepoSuccess]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => screen.getByText('test-repo'));
    fireEvent.click(screen.getByLabelText('edit description'));

    const input = screen.getByDisplayValue('test description');
    fireEvent.change(input, { target: { value: 'updated description' } });
    fireEvent.click(screen.getByLabelText('save description'));

    await waitFor(() => {
      expect(screen.getByText(/repository description updated/i)).toBeInTheDocument(); // Snackbar
    });
  });

  it('handles error when description update fails', async () => {
    render(
      <MockedProvider mocks={[mockRepositories, updateRepoError]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => screen.getByText('test-repo'));
    fireEvent.click(screen.getByLabelText('edit description'));

    const input = screen.getByDisplayValue('test description');
    fireEvent.change(input, { target: { value: 'bad desc' } });
    fireEvent.click(screen.getByLabelText('save description'));

    await waitFor(() => {
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
    });
  });

  it('dismisses snackbar notification', async () => {
    render(
      <MockedProvider mocks={[mockRepositories, updateRepoSuccess]} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => screen.getByText('test-repo'));
    fireEvent.click(screen.getByLabelText('edit description'));

    const input = screen.getByDisplayValue('test description');
    fireEvent.change(input, { target: { value: 'updated description' } });
    fireEvent.click(screen.getByLabelText('save description'));

    const snackbar = await screen.findByText(/repository description updated/i);
    expect(snackbar).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(snackbar).not.toBeInTheDocument();
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
    const multiRepoMock = {
      request: { query: GET_REPOSITORIES_WITH_PRS },
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
                  pullRequests: { nodes: [] }
                },
                {
                  id: '2',
                  name: 'test-repo-2',
                  description: 'second repo',
                  stargazerCount: 10,
                  pullRequests: { nodes: [] }
                }
              ]
            }
          }
        }
      }
    };
  
    render(
      <MockedProvider mocks={[multiRepoMock]} addTypename={false}>
        <App />
      </MockedProvider>
    );
  
    await waitFor(() => {
      expect(screen.getByText('test-repo-1')).toBeInTheDocument();
      expect(screen.getByText('test-repo-2')).toBeInTheDocument();
      
      // Test expanding/collapsing multiple repositories
      const firstRepoTitle = screen.getByText('test-repo-1');
      const secondRepoTitle = screen.getByText('test-repo-2');
      
      fireEvent.click(firstRepoTitle);
      fireEvent.click(secondRepoTitle);
    });
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
  
    // Ensure the repository name is rendered. Use a more general query if necessary.
    const repoTitle = await screen.findByText('test-repo');
    
    // Ensure the open URL button is rendered
    const openUrlButton = screen.getByRole('button', { name: /open repo/i });
  
    // Mock the window.open function to check if it's being called
    const mockOpen = jest.fn();
    window.open = mockOpen;
  
    // Click the open URL button
    fireEvent.click(openUrlButton);
  
    // Assert that window.open was called with the correct GitHub URL
    expect(mockOpen).toHaveBeenCalledWith('https://github.com/test/test-repo', '_blank');
  });
  

});
