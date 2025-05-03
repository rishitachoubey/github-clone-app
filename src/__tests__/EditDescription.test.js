import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import App from '../App';
import { GET_REPOSITORIES_WITH_PRS } from '../queries/getRepositories';
import { UPDATE_REPOSITORY } from '../mutations/updateRepo';

const fetchMock = {
  request: { query: GET_REPOSITORIES_WITH_PRS },
  result: {
    data: {
      viewer: {
        repositories: {
          nodes: [
            {
              id: 'repo1',
              name: 'editable-repo',
              description: 'Initial description',
              stargazerCount: 0,
              pullRequests: { nodes: [] }
            }
          ]
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

test('edits description with success', async () => {
  render(
    <MockedProvider mocks={[fetchMock, updateMock]} addTypename={false}>
      <App />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('editable-repo')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByLabelText(/edit description/i)[0]);

  const input = screen.getByDisplayValue(/initial description/i);
  fireEvent.change(input, { target: { value: 'Updated description' } });

  fireEvent.click(screen.getByLabelText(/save description/i));

  await waitFor(() => {
    expect(screen.getByText(/description updated/i)).toBeInTheDocument();
  });
});
