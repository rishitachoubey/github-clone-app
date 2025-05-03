import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_REPOSITORY } from '../mutations/createRepo';
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Link as MuiLink,
} from '@material-ui/core';

const CreateRepoForm = () => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(null);

  const [createRepo, { loading }] = useMutation(CREATE_REPOSITORY, {
    onCompleted: (data) => {
      setSuccess(data.createRepository.repository);
      setErrorMsg('');
      setName('');
      setDesc('');
    },
    onError: (error) => {
      const msg = error?.message || 'Unknown error';
      if (msg.includes('name already exists')) {
        setErrorMsg('A repository with this name already exists.');
      } else {
        setErrorMsg(`${msg}`);
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Repository name is required.');
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

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Repository Name"
              placeholder="e.g. my-new-repo"
              variant="outlined"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Description (Optional)"
              variant="outlined"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              fullWidth
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

        {success && (
          <Box mt={2}>
            <Typography variant="body1" color="primary">
              ✅ Repository created:&nbsp;
              <MuiLink
                href={success.url}
                target="_blank"
                rel="noreferrer"
              >
                {success.name}
              </MuiLink>
            </Typography>
          </Box>
        )}

        {errorMsg && (
          <Box mt={2}>
            <Typography color="error">❌ {errorMsg}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateRepoForm;
