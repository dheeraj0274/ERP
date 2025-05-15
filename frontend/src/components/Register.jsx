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
  Grid,
  IconButton,
  Tooltip,
  AppBar,
  Toolbar,
  useTheme,
  InputAdornment,
  Divider,
  Fade,
  Grow,
  alpha,
  Stepper,
  Step, 
  StepLabel,
  FormControlLabel,
  Checkbox,
  Card,
  useMediaQuery,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  HowToReg as RegisterIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

const Register = () => {
  const navigate = useNavigate();
  const { register, error, loading } = useAuth();
  const { toggleColorMode, isDarkMode } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Personal Info', 'Password', 'Confirm'];

  useEffect(() => {
    // Trigger animation after component mounts
    setIsLoaded(true);
  }, []);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'agreeToTerms' ? checked : value,
    });
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (activeStep === 0) {
      if (!formData.name || !formData.email) {
        setFormError('Please fill in all fields');
        return;
      }
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setFormError('Please enter a valid email address');
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.password || !formData.confirmPassword) {
        setFormError('Please fill in all password fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setFormError('Password must be at least 6 characters long');
        return;
      }
    }

    setFormError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    if (!formData.agreeToTerms) {
      setFormError('You must agree to the terms and conditions');
      return;
    }

    try {
      const response = await axios.post('api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.data) {
        navigate('/login', { 
          state: { message: 'Registration successful! You can now log in.' } 
        });
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Registration failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              size="small"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" fontSize="small" />
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
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
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  fontSize: '0.85rem',
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.85rem',
                }
              }}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              size="small"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
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
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={formData.confirmPassword}
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
                      aria-label="toggle confirm password visibility"
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  fontSize: '0.85rem',
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.85rem',
                }
              }}
            />
          </>
        );
      case 2:
        return (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
              Review Your Information
            </Typography>
            
            <Grid container spacing={1} sx={{ mb: 2, mt: 0.5 }}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  Full Name:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{formData.name}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  Email:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{formData.email}</Typography>
              </Grid>
            </Grid>
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  name="agreeToTerms"
                  color="primary"
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  I agree to the{' '}
                  <Link component={RouterLink} to="/terms" sx={{ fontSize: '0.75rem' }}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link component={RouterLink} to="/privacy" sx={{ fontSize: '0.75rem' }}>
                    Privacy Policy
                  </Link>
                </Typography>
              }
            />
          </Box>
        );
      default:
        return 'Unknown step';
    }
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
                maxWidth: { xs: 340, sm: 480 },
                mx: 'auto',
                boxShadow: isDarkMode 
                  ? '0 4px 20px rgba(0,0,0,0.2)' 
                  : '0 1px 15px rgba(0,0,0,0.07)',
              }}
            >
              <Box 
                sx={{ 
                  p: 0.5, 
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? theme.palette.primary.dark 
                    : theme.palette.primary.main,
                }}
              />
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
                  }}
                >
                  Create Account
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
                  Fill in your details to register
                </Typography>

                <Stepper 
                  activeStep={activeStep} 
                  alternativeLabel 
                  sx={{ 
                    mb: 2,
                    '& .MuiStepLabel-label': {
                      fontSize: '0.75rem',
                    }
                  }}
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

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
                  {getStepContent(activeStep)}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      size="small"
                      startIcon={<ArrowBackIcon fontSize="small" />}
                      sx={{ 
                        textTransform: 'none',
                        fontSize: '0.8rem',
                      }}
                    >
                      Back
                    </Button>
                    <Box>
                      {activeStep === steps.length - 1 ? (
                        <Button
                          variant="contained"
                          onClick={handleSubmit}
                          disabled={loading}
                          startIcon={loading ? null : <RegisterIcon fontSize="small" />}
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            borderRadius: 1,
                            fontSize: '0.8rem',
                            px: 2,
                            py: 0.6,
                            boxShadow: '0 2px 8px rgba(55, 125, 255, 0.16)',
                            textTransform: 'none'
                          }}
                        >
                          {loading ? <CircularProgress size={18} /> : 'Complete'}
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          endIcon={<ArrowForwardIcon fontSize="small" />}
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            borderRadius: 1,
                            fontSize: '0.8rem',
                            textTransform: 'none'
                          }}
                        >
                          Next
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {activeStep === 0 && (
                    <>
                      <Divider sx={{ my: 1.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          OR
                        </Typography>
                      </Divider>

                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                          Already have an account?
                        </Typography>
                        <Link 
                          component={RouterLink} 
                          to="/login" 
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
                          Sign In
                        </Link>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            </Card>
          </Grow>
        </Container>
      </Box>
    </Box>
  );
};

export default Register; 