import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import CreateRepoForm from '../components/CreateRepoForm';
import { CREATE_REPOSITORY } from '../mutations/createRepo';
import { GET_REPOSITORIES_WITH_PRS } from '../queries/getRepositories';
import '@testing-library/jest-dom';

const successMocks = [
  {
    request: {
      query: CREATE_REPOSITORY,
      variables: { name: 'new-repo', description: 'test description' },
    },
    result: {
      data: {
        createRepository: {
          repository: {
            name: 'new-repo',
            id: 'repo123',
            url: 'https://github.com/test/new-repo',
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_REPOSITORIES_WITH_PRS,
      variables: { first: 10 },
    },
    result: {
      data: {
        viewer: {
          repositories: {
            nodes: [
              {
                id: 'repo123',
                name: 'new-repo',
                description: 'test description',
                url: 'https://github.com/test/new-repo',
                stargazerCount: 0,
                pullRequests: {
                  nodes: [],
                },
              },
            ],
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
          },
        },
      },
    },
  },
];

const errorMocks = [
  {
    request: {
      query: CREATE_REPOSITORY,
      variables: { name: 'existing-repo', description: '' },
    },
    error: new Error('name already exists'),
  },
];

const unknownErrorMocks = [
  {
    request: {
      query: CREATE_REPOSITORY,
      variables: { name: 'error-repo', description: '' },
    },
    error: new Error('Unknown error occurred'),
  },
];

describe('CreateRepoForm', () => {
  it('renders the form with all required elements', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <CreateRepoForm />
      </MockedProvider>
    );

    expect(screen.getByText('Create a New Repository')).toBeInTheDocument();
    expect(screen.getByLabelText(/repository name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create repository/i })).toBeInTheDocument();
  });

  it('calls onSuccess after successful repo creation', async () => {
    const onSuccessMock = jest.fn();

    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <CreateRepoForm onSuccess={onSuccessMock} />
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/repository name/i), {
      target: { value: 'new-repo' },
    });

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'test description' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create repository/i }));

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledWith('Repository created successfully!');
    });

    // Verify form is cleared after successful submission
    expect(screen.getByLabelText(/repository name/i)).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
  });

  it('calls onError when repository name already exists', async () => {
    const onErrorMock = jest.fn();

    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <CreateRepoForm onError={onErrorMock} />
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/repository name/i), {
      target: { value: 'existing-repo' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create repository/i }));

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledWith('A repository with this name already exists.');
    });
  });

  it('calls onError with unknown error message', async () => {
    const onErrorMock = jest.fn();

    render(
      <MockedProvider mocks={unknownErrorMocks} addTypename={false}>
        <CreateRepoForm onError={onErrorMock} />
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/repository name/i), {
      target: { value: 'error-repo' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create repository/i }));

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledWith('Unknown error occurred');
    });
  });

  it('validates empty repository name', async () => {
    const onErrorMock = jest.fn();
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <CreateRepoForm onError={onErrorMock} onSuccess={() => {}} />
      </MockedProvider>
    );

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    expect(onErrorMock).toHaveBeenCalledWith('Repository name is required.');
  });

  it('trims whitespace from inputs', async () => {
    const onSuccessMock = jest.fn();

    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <CreateRepoForm onSuccess={onSuccessMock} />
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/repository name/i), {
      target: { value: '  new-repo  ' },
    });

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: '  test description  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create repository/i }));

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledWith('Repository created successfully!');
    });
  });

  it('disables button and shows loader while submitting', async () => {
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <CreateRepoForm />
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/repository name/i), {
      target: { value: 'new-repo' },
    });

    const button = screen.getByRole('button', { name: /create repository/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for the loading state to finish
    await waitFor(() => {
      expect(button).not.toBeDisabled();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('handles undefined callbacks gracefully', async () => {
    // This test specifically targets the optional chaining cases
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <CreateRepoForm />
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/repository name/i), {
      target: { value: 'new-repo' },
    });

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'test description' },
    });

    // Should not throw any errors when callbacks are undefined
    fireEvent.click(screen.getByRole('button', { name: /create repository/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/repository name/i)).toHaveValue('');
      expect(screen.getByLabelText(/description/i)).toHaveValue('');
    });
  });
});
