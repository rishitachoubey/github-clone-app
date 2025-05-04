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
  Snackbar,
  Button,
  Grid
} from '@mui/material';
import { ExpandMore, ExpandLess, Edit, Check, Clear, Star, OpenInNew, NavigateNext, NavigateBefore } from '@mui/icons-material';
import { Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CreateRepoForm from './components/CreateRepoForm';

// Constants
const REPOS_PER_PAGE = 10;

// Main App Component
const App = () => {
  // State management
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [openRepoId, setOpenRepoId] = useState(null);
  const [editModeId, setEditModeId] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const theme = useTheme();

  // GraphQL Queries and Mutations
  const { loading, error, data, fetchMore } = useQuery(GET_REPOSITORIES_WITH_PRS, {
    variables: { first: REPOS_PER_PAGE },
    onCompleted: (data) => {
      setPageInfo(data.viewer.repositories.pageInfo);
    }
  });

  const [updateRepo] = useMutation(UPDATE_REPOSITORY, {
    refetchQueries: [{ query: GET_REPOSITORIES_WITH_PRS }],
    onCompleted: () => {
      showSnackbar('Repository description updated', 'success');
      setEditModeId(null);
    },
    onError: (err) => {
      showSnackbar(err.message || 'Error updating description', 'error');
    }
  });

  // Helper Functions
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleLoadMore = () => {
    fetchMore({
      variables: {
        first: REPOS_PER_PAGE,
        after: pageInfo.endCursor
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          viewer: {
            ...prev.viewer,
            repositories: {
              ...prev.viewer.repositories,
              nodes: [...prev.viewer.repositories.nodes, ...fetchMoreResult.viewer.repositories.nodes],
              pageInfo: fetchMoreResult.viewer.repositories.pageInfo
            }
          }
        };
      }
    }).then(({ data }) => {
      setPageInfo(data.viewer.repositories.pageInfo);
      setCurrentPage(currentPage + 1);
    });
  };

  const handleLoadPrevious = () => {
    showSnackbar('Previous page navigation is not supported by GitHub API', 'info');
  };

  // Loading and Error States
  if (loading && !data) {
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

  // Render Repository Card
  const renderRepoCard = (repo) => (
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
          flexDirection: 'column',
          justifyContent: 'flex-start',
          cursor: 'pointer',
          padding: '16px',
        }}
        onClick={(e) => {
          const targetTag = e.target.tagName.toLowerCase();
          if (['button', 'svg', 'path', 'input'].includes(targetTag)) return;
          setOpenRepoId(openRepoId === repo.id ? null : repo.id);
        }}
      >
        {/* Repository Header */}
        <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
          <Typography
            variant="subtitle1"
            data-testid={`repo-title-${repo.name}`}
            style={{
              color: theme.palette.primary.main,
              fontWeight: 600,
              marginBottom: '0.3rem',
            }}
          >
            {repo.name}
          </Typography>

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              window.open(repo.url, '_blank');
            }}
            size="small"
            aria-label="open repo"
          >
            <OpenInNew fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="caption" color="textSecondary" style={{ marginBottom: 8 }}>
          Click to view pull requests
        </Typography>

        {/* Repository Description */}
        {editModeId !== repo.id ? (
          <Box display="flex" alignItems="center" mt={1}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setEditModeId(repo.id);
                setEditDesc(repo.description || '');
              }}
              size="small"
              aria-label="edit description"
              style={{ marginRight: '0.5rem' }}
            >
              <Edit fontSize="small" style={{ color: theme.palette.text.secondary }} />
            </IconButton>
            <Typography
              variant="body2"
              style={{ color: theme.palette.text.primary }}
            >
              {repo.description || 'No description available'}
            </Typography>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" mt={1}>
            <TextField
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              size="small"
              fullWidth
              inputProps={{ 'aria-label': 'edit repository description' }}
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
              aria-label="save description"
            >
              <Check fontSize="small" style={{ color: theme.palette.success.main }} />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setEditModeId(null);
              }}
              size="small"
              aria-label="cancel edit"
            >
              <Clear fontSize="small" style={{ color: theme.palette.error.main }} />
            </IconButton>
          </Box>
        )}

        {/* Repository Stats */}
        <Box display="flex" alignItems="center" mt={1} justifyContent="flex-start">
          <Star fontSize="small" style={{ color: '#f1c40f', marginRight: 4 }} />
          <Typography variant="caption" style={{ color: theme.palette.text.secondary }}>
            {repo.stargazerCount}
          </Typography>
        </Box>

        {/* Pull Requests Section */}
        <Collapse in={openRepoId === repo.id}>
          <Divider style={{ margin: '1rem 0' }} />
          <Typography variant="subtitle2" gutterBottom>
            Pull Requests
          </Typography>
          {repo.pullRequests.nodes.length > 0 ? (
            repo.pullRequests.nodes.map((pr) => (
              <Box key={pr.id} mb={1}>
                <MuiLink
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: theme.palette.primary.main }}
                >
                  {pr.title}
                </MuiLink>
                <Typography variant="caption" display="block" color="textSecondary">
                  {pr.state} • {pr.author?.login || 'Unknown'}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No pull requests found
            </Typography>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <CreateRepoForm
        onSuccess={(msg) => showSnackbar(msg, 'success')}
        onError={(msg) => showSnackbar(msg, 'error')}
      />

      <Typography variant="h5" gutterBottom style={{ fontWeight: 600 }}>
        My GitHub Repositories
      </Typography>

      {/* Repository List */}
      {repos.map(renderRepoCard)}

      {/* Pagination Controls */}
      <Box display="flex" justifyContent="center" mt={2} mb={4}>
        <Button
          endIcon={<NavigateNext />}
          onClick={handleLoadMore}
          disabled={!pageInfo.hasNextPage}
          variant="contained"
          color="primary"
        >
          Load More
        </Button>
      </Box>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default App;
