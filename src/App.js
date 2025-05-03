import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_REPOSITORIES_WITH_PRS } from './queries/getRepositories';
import { UPDATE_REPOSITORY } from './mutations/updateRepo';
import {
  Card,
  CardContent,
  Typography,
  Collapse,
  Link as MuiLink,
  Box,
  CircularProgress,
  IconButton,
  Divider,
  TextField,
  Snackbar
} from '@material-ui/core';
import { ExpandMore, ExpandLess, Edit, Check, Clear, Star } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import { useTheme } from '@material-ui/core/styles';
import CreateRepoForm from './components/CreateRepoForm';

const App = () => {
  const { loading, error, data } = useQuery(GET_REPOSITORIES_WITH_PRS);
  const [openRepoId, setOpenRepoId] = useState(null);
  const [editModeId, setEditModeId] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const theme = useTheme();

  const [updateRepo] = useMutation(UPDATE_REPOSITORY, {
    refetchQueries: [{ query: GET_REPOSITORIES_WITH_PRS }],
    onCompleted: () => {
      setSnackbarMessage('Repository description updated');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setEditModeId(null);
    },
    onError: (err) => {
      setSnackbarMessage(err.message || 'Error updating description');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  });

  if (loading) {
    return (
      <Box mt={4} textAlign="center">
        <CircularProgress />
        <Typography variant="body2">Loading repositories...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4} textAlign="center">
        <Typography color="error">Error: {error.message}</Typography>
      </Box>
    );
  }

  const repos = data?.viewer?.repositories?.nodes || [];

  return (
    <div>
      <CreateRepoForm />

      <Typography variant="h5" gutterBottom style={{ fontWeight: 600 }}>
        My GitHub Repositories
      </Typography>

      {repos.map((repo) => (
        <Card
          key={repo.id}
          style={{
            marginBottom: '1rem',
            backgroundColor: theme.palette.background.paper,
            transition: 'box-shadow 0.2s ease-in-out',
            boxShadow: openRepoId === repo.id
              ? '0px 4px 20px rgba(0,0,0,0.2)'
              : '0px 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          <CardContent
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setOpenRepoId(openRepoId === repo.id ? null : repo.id)}
          >
            <Box>
              <Typography
                variant="subtitle1"
                style={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  marginBottom: '0.3rem'
                }}
              >
                {repo.name}
              </Typography>

              <Box display="flex" alignItems="center" gap={1}>
                {editModeId === repo.id ? (
                  <>
                    <TextField
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      size="small"
                      variant="outlined"
                      fullWidth
                      style={{ marginRight: '0.5rem' }}
                    />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        updateRepo({
                          variables: {
                            repositoryId: repo.id,
                            description: editDesc
                          }
                        });
                      }}
                      size="small"
                      disabled={editDesc === (repo.description || '')}
                    >
                      <Check fontSize="small" style={{ color: theme.palette.success.main }} />
                    </IconButton>
                    {editDesc === (repo.description || '') && (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditModeId(null);
                        }}
                        size="small"
                      >
                        <Clear fontSize="small" style={{ color: theme.palette.text.secondary }} />
                      </IconButton>
                    )}
                  </>
                ) : (
                  <>
                    <Typography
                      variant="body2"
                      style={{
                        color: theme.palette.text.primary,
                        marginRight: '0.5rem'
                      }}
                    >
                      {repo.description || 'No description available'}
                    </Typography>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditModeId(repo.id);
                        setEditDesc(repo.description || '');
                      }}
                      size="small"
                    >
                      <Edit fontSize="small" style={{ color: theme.palette.text.secondary }} />
                    </IconButton>
                  </>
                )}
              </Box>

              <Box display="flex" alignItems="center" mt={1}>
                <Star fontSize="small" style={{ color: '#f1c40f', marginRight: 4 }} />
                <Typography variant="caption" style={{ color: theme.palette.text.secondary }}>
                  {repo.stargazerCount}
                </Typography>
              </Box>
            </Box>

            <IconButton>
              {openRepoId === repo.id ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </CardContent>

          <Collapse in={openRepoId === repo.id} timeout="auto" unmountOnExit>
            <Divider />
            <CardContent style={{ backgroundColor: theme.palette.background.default }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                style={{ color: theme.palette.text.primary, fontWeight: 600 }}
              >
                Pull Requests
              </Typography>
              {repo.pullRequests.nodes.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No pull requests found.
                </Typography>
              ) : (
                <ul style={{ paddingLeft: '1rem', marginTop: '0.5rem' }}>
                  {repo.pullRequests.nodes.map((pr) => (
                    <li key={pr.id} style={{ marginBottom: '0.5rem' }}>
                      <MuiLink
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: theme.palette.primary.main,
                          fontWeight: 500,
                          textDecoration: 'none'
                        }}
                      >
                        {pr.title}
                      </MuiLink>{' '}
                      <Typography
                        variant="caption"
                        style={{ color: theme.palette.text.secondary }}
                      >
                        [{pr.state}]
                      </Typography>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Collapse>
        </Card>
      ))}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default App;
