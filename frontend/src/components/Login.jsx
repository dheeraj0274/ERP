import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  AppBar,
  Toolbar,
  useTheme,
  InputAdornment,
  Grid,
  Divider,
  Fade,
  Grow,
  alpha,
  Card,
  useMediaQuery,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LoginOutlined as LoginIcon,
} from '@mui/icons-material';
// Adjust based on actual location

const Login = () => {
  const navigate = useNavigate();
  const { login, error, loading } = useAuth();
  const { toggleColorMode, isDarkMode } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsLoaded(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      const response = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.token) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Update auth context
        await login(formData.email, formData.password);
        
        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setFormError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100vw',
      background: theme.palette.mode === 'dark' 
        ? `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.95)}, ${alpha(theme.palette.primary.dark, 0.15)})`
        : `linear-gradient(135deg, ${alpha('#f8fafc', 0.97)}, ${alpha(theme.palette.primary.light, 0.15)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <Fade in={isLoaded} timeout={800}>
        <AppBar 
          position="fixed" 
          color="inherit"
          elevation={0}
          sx={{ 
            backdropFilter: 'blur(8px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            height: { xs: 48, sm: 56 }
          }}
        >
          <Toolbar variant="dense" sx={{ minHeight: { xs: 48, sm: 56 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon color="primary" sx={{ mr: 1, fontSize: { xs: 20, sm: 22 } }} />
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                }}
              >
                ERP System
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title={isDarkMode ? "Light Mode" : "Dark Mode"}>
              <IconButton color="inherit" onClick={toggleColorMode} size="small">
                {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Button 
            

              component={RouterLink} 
              to="/usage" 
              color="inherit" 
              sx={{ ml: 2 }}
            >
              Usage
            </Button>
          </Toolbar>
        </AppBar>
      </Fade>

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pt: { xs: '48px', sm: '56px' }, // Space for fixed AppBar
          px: { xs: 1, sm: 2 },
          pb: { xs: 1, sm: 2 },
        }}
      >
        <Container 
          maxWidth={isTablet ? "xs" : "sm"} 
          sx={{ 
            py: { xs: 1.5, sm: 2 }, 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center'
          }}
        >
          <Grow in={isLoaded} timeout={600} style={{ transformOrigin: '0 0 0' }}>
            <Card 
              elevation={isDarkMode ? 3 : 1}
              sx={{
                overflow: 'hidden',
                borderRadius: { xs: 1.5, sm: 2 },
                width: '100%',
                maxWidth: { xs: 340, sm: 600, md: 700 },
                mx: 'auto',
                boxShadow: isDarkMode 
                  ? '0 4px 20px rgba(0,0,0,0.2)' 
                  : '0 1px 15px rgba(0,0,0,0.07)',
              }}
            >
              <Grid container>
                <Grid 
                  item 
                  xs={0} 
                  md={5} 
                  sx={{ 
                    background: theme.palette.mode === 'dark' 
                      ? `linear-gradient(315deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.main, 0.8)})`
                      : `linear-gradient(315deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'center',
                    color: '#fff',
                    position: 'relative',
                    p: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '-10%',
                      right: '-10%',
                      width: '140px',
                      height: '140px',
                      borderRadius: '50%',
                      background: alpha('#fff', 0.1),
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '-5%',
                      left: '-5%',
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: alpha('#fff', 0.1),
                    }}
                  />
                  
                  <Typography 
                    variant="h5" 
                    component="h1" 
                    gutterBottom 
                    
                    sx={{ 
                      fontWeight: 700, 
                      position: 'relative',
                      zIndex: 2,
                      fontSize: { md: '1.5rem', lg: '1.8rem' },
                      mb: 1,
                      width: '100%'
                    }}
                  >
                    Welcome Back
                  </Typography>
                  <Typography 
                    variant="body2" 
                    paragraph 
                    sx={{ 
                      opacity: 0.9, 
                      position: 'relative', 
                      zIndex: 2,
                      fontSize: '0.85rem',
                      mb: 1,
                      width: '100vw'
                    }}
                  >
                    Sign in to access your dashboard and manage your ERP system.
                  </Typography>
                </Grid>

                <Grid 
                  item 
                  xs={12} 
                  md={7} 
                  sx={{ 
                    bgcolor: theme.palette.background.paper,
                  }}
                >
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography 
                      component="h1" 
                      variant="h5" 
                      sx={{ 
                        mb: 0.5, 
                        fontWeight: 600,
                        textAlign: 'center',
                        color: theme.palette.text.primary,
                        fontSize: { xs: '1.1rem', sm: '1.2rem' },
                        width: '100vw'
                      }}
                    >
                      Sign In
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ 
                        mb: 2, 
                        textAlign: 'center', 
                        fontSize: '0.8rem' 
                      }}
                    >
                      Enter your credentials
                    </Typography>

                    {(error || formError) && (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          width: '100%', 
                          mb: 2, 
                          borderRadius: 1,
                          py: 0,
                          fontSize: '0.75rem',
                        }}
                      >
                        {error || formError}
                      </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                      <TextField
                        size="small"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={formData.email}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          mb: 1.5,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            fontSize: '0.85rem',
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '0.85rem',
                          }
                        }}
                      />
                      <TextField
                        size="small"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={togglePasswordVisibility}
                                edge="end"
                                size="small"
                              >
                                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        sx={{
                          mb: 0.5,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            fontSize: '0.85rem',
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '0.85rem',
                          }
                        }}
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5, mb: 1.5 }}>
                        <Link 
                          component={RouterLink} 
                          to="/forgot-password" 
                          variant="body2"
                          sx={{ fontSize: '0.75rem' }}
                        >
                          Forgot password?
                        </Link>
                      </Box>

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ 
                          py: 0.8,
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          borderRadius: 1,
                          boxShadow: '0 2px 8px rgba(55, 125, 255, 0.16)',
                          transition: 'all 0.2s ease',
                          textTransform: 'none',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(55, 125, 255, 0.24)',
                          }
                        }}
                        disabled={loading}
                        startIcon={loading ? null : <LoginIcon fontSize="small" />}
                      >
                        {loading ? <CircularProgress size={20} /> : 'Sign In'}
                      </Button>

                      <Divider sx={{ my: 1.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          OR
                        </Typography>
                      </Divider>

                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                          Don't have an account?
                        </Typography>
                        <Link 
                          component={RouterLink} 
                          to="/register" 
                          variant="body2"
                          sx={{ 
                            fontWeight: 'medium',
                            color: theme.palette.primary.main,
                            transition: 'all 0.2s',
                            fontSize: '0.8rem',
                            '&:hover': {
                              color: theme.palette.primary.dark,
                              textDecoration: 'none',
                            }
                          }}
                        >
                          Create an Account
                        </Link>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grow>
        </Container>
      </Box>
    </Box>
  );
};

export default Login; 