import React from 'react';
import { AppBar, Toolbar, Typography, Switch } from '@mui/material'; // Updated from @material-ui/core to @mui/material
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
      {children}
    </>
  );
};

export default Layout;
