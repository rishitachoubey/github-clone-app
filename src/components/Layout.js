import React from 'react';
import { AppBar, Toolbar, Typography, Switch } from '@material-ui/core';
import { useThemeToggle } from '../ThemeContext';

const Layout = ({ children }) => {
  const toggleTheme = useThemeToggle();

  return (
    <>
      <AppBar position="static" style={{ background: '#24292f' }}>
        <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">GitHub Clone</Typography>
          <Switch onChange={toggleTheme} />
        </Toolbar>
      </AppBar>
      <main style={{ padding: '2rem' }}>{children}</main>
    </>
  );
};

export default Layout;
