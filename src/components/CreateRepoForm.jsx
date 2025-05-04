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

/**
 * Form component for creating new GitHub repositories
 * @param {Object} props
 * @param {Function} props.onSuccess - Callback for successful repository creation
 * @param {Function} props.onError - Callback for error handling
 */
const CreateRepoForm = ({ onSuccess, onError }) => {
  // Form state
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  // GraphQL mutation for creating repository
  const [createRepo, { loading }] = useMutation(CREATE_REPOSITORY, {
    refetchQueries: [{
      query: GET_REPOSITORIES_WITH_PRS,
      variables: { first: 10 }
    }],
    onCompleted: (data) => {
      onSuccess?.('Repository created successfully!');
      resetForm();
    },
    onError: (error) => {
      handleError(error);
    },
  });

  // Helper functions
  const resetForm = () => {
    setName('');
    setDesc('');
  };

  const handleError = (error) => {
    const msg = error?.message || 'Unknown error';
    if (msg.includes('name already exists')) {
      onError?.('A repository with this name already exists.');
    } else {
      onError?.(msg);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      onError?.('Repository name is required.');
      return;
    }
    createRepo({ 
      variables: { 
        name: name.trim(), 
        description: desc.trim() 
      } 
    });
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
              helperText="Choose a unique name for your repository"
            />
            
            <TextField
              label="Description (Optional)"
              variant="outlined"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              fullWidth
              inputProps={{ 'aria-label': 'description' }}
              helperText="Add a description to help others understand your project"
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                'Create Repository'
              )}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateRepoForm;
