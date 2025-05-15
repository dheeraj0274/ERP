import { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { deepPurple, amber, grey, blue } from '@mui/material/colors';
import CssBaseline from '@mui/material/CssBaseline';

// Create theme context
const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

// Color palette based on color theory for professional appearance
// Deep purple - conveys professionalism, creativity, wisdom
// Blue - trustworthiness, reliability, calm
// Amber - warmth, optimism, clarity for accents
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode palette
          primary: {
            main: deepPurple[700],
            light: deepPurple[500],
            dark: deepPurple[900],
            contrastText: '#fff',
          },
          secondary: {
            main: blue[600],
            light: blue[400],
            dark: blue[800],
          },
          accent: {
            main: amber[600],
            light: amber[400],
            dark: amber[800],
          },
          background: {
            default: '#f8f9fa',
            paper: '#fff',
          },
          text: {
            primary: grey[900],
            secondary: grey[700],
          },
        }
      : {
          // Dark mode palette
          primary: {
            main: deepPurple[400],
            light: deepPurple[300],
            dark: deepPurple[600],
            contrastText: '#fff',
          },
          secondary: {
            main: blue[400],
            light: blue[300],
            dark: blue[600],
          },
          accent: {
            main: amber[500],
            light: amber[300],
            dark: amber[700],
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#fff',
            secondary: grey[400],
          },
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' 
            ? '0px 3px 6px rgba(0, 0, 0, 0.1)' 
            : '0px 3px 6px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: mode === 'light' 
            ? deepPurple[50] 
            : deepPurple[900],
        },
      },
    },
  },
});

export const ThemeProvider = ({ children }) => {
  // Check if user has a theme preference in localStorage
  const storedTheme = localStorage.getItem('themeMode');
  const [mode, setMode] = useState(storedTheme || 'light');

  // Watch for system preference changes
  useEffect(() => {
    if (!storedTheme) {
      // If no stored preference, use system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
    
    // Listen for changes in system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [storedTheme]);

  // Toggle between light and dark mode
  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Create theme based on current mode
  const theme = createTheme(getDesignTokens(mode));

  const value = {
    mode,
    toggleColorMode,
    isDarkMode: mode === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 