import React, { createContext, useContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeToggleContext = createContext();

export const useThemeToggle = () => useContext(ThemeToggleContext);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',  // Corrected from 'type' to 'mode'
          primary: {
            main: '#2ea44f',
          },
          background: {
            default: darkMode ? '#0d1117' : '#f5f5f5',
            paper: darkMode ? '#161b22' : '#fff',
          },
        },
      }),
    [darkMode]
  );

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeToggleContext.Provider value={toggleTheme}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeToggleContext.Provider>
  );
};
