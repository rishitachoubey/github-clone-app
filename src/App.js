import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_REPOSITORIES_WITH_PRS } from './queries/getRepositories';

const App = () => {
  const { loading, error, data } = useQuery(GET_REPOSITORIES_WITH_PRS);
  const [openRepoId, setOpenRepoId] = useState(null);

  if (loading) return <p>Loading repositories...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const repos = data.viewer.repositories.nodes;

  return (
    <div>
      <h2>This is temp</h2>
      <ul>
        {repos.map((repo) => (
          <li key={repo.id}>
            <div onClick={() => setOpenRepoId(openRepoId === repo.id ? null : repo.id)}>
              <strong>{repo.name}</strong> — {repo.description || 'No description'}
            </div>
            {openRepoId === repo.id && (
              <ul>
                {repo.pullRequests.nodes.map((pr) => (
                  <li key={pr.id}>
                    <a href={pr.url} target="_blank" rel="noreferrer">
                      {pr.title} [{pr.state}]
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
