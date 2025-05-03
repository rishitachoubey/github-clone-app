import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import CreateRepoForm from '../components/CreateRepoForm';
import { CREATE_REPOSITORY } from '../mutations/createRepo';
import '@testing-library/jest-dom';

const successMocks = [
  {
    request: {
      query: CREATE_REPOSITORY,
      variables: { name: 'new-repo', description: '' },
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

describe('CreateRepoForm', () => {
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

    fireEvent.click(screen.getByRole('button', { name: /create repository/i }));

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledWith('Repository created successfully!');
    });
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
  });
});
