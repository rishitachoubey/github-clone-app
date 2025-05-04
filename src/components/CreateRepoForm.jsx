import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_REPOSITORY } from '../mutations/createRepo';
import { GET_REPOSITORIES_WITH_PRS } from '../queries/getRepositories';
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';

const CreateRepoForm = ({ onSuccess, onError }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const [createRepo, { loading }] = useMutation(CREATE_REPOSITORY, {
    refetchQueries: [{
      query: GET_REPOSITORIES_WITH_PRS,
      variables: { first: 10 }  // Match the initial query variables
    }],
    onCompleted: (data) => {
      onSuccess?.('Repository created successfully!');
      setName('');
      setDesc('');
    },
    onError: (error) => {
      const msg = error?.message || 'Unknown error';
      if (msg.includes('name already exists')) {
        onError?.('A repository with this name already exists.');
      } else {
        onError?.(msg);
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      onError?.('Repository name is required.');
      return;
    }
    createRepo({ variables: { name: name.trim(), description: desc.trim() } });
  };

  return (
    <Card style={{ marginBottom: '2rem' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Create a New Repository
        </Typography>

        <form onSubmit={handleSubmit} role="form">
          <Box display="flex" flexDirection="column" gap={2}>
                <TextField
        label="Repository Name"
        placeholder="e.g. my-new-repo"
        variant="outlined"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        inputProps={{ 'aria-label': 'repository name' }}
        />
            <TextField
              label="Description (Optional)"
              variant="outlined"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              fullWidth
              inputProps={{ 'aria-label': 'description' }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} /> : 'Create Repository'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateRepoForm;
