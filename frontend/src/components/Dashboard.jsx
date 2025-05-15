import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  Paper,
  Tooltip,
  useTheme,
  Avatar,
  Badge,
  Card,
  CardContent,
  Grid,
  alpha,
  Chip,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tab,
  Tabs,
  ListItemButton,
  ListItemAvatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  People as PeopleIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon,
  CalendarMonth as CalendarMonthIcon,
  Schedule as ScheduleIcon,
  AssignmentTurnedIn as AttendanceIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  CircleOutlined as CircleOutlinedIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import ManageUsers from './ManageUsers';

// Import role-specific dashboards
import StudentDashboard from './dashboard/StudentDashboard';
import TeacherDashboard from './dashboard/TeacherDashboard';
import AdminDashboard from './dashboard/AdminDashboard';

const Dashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();
  const { toggleColorMode, isDarkMode } = useThemeMode();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Add state for dashboard stats
  const [stats, setStats] = useState({
    classes: { count: 0, trend: '' },
    students: { count: 0, trend: '' },
    teachers: { count: 0, trend: '' },
    attendance: { percentage: 0, trend: '' }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [openAddStudentDialog, setOpenAddStudentDialog] = useState(false);
  const [allStudentsList, setAllStudentsList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableStudents, setAvailableStudents] = useState([]);

  // Use effect to fetch stats on component mount and user change
  useEffect(() => {
    // Create a cancel token for cleanup
    const cancelToken = axios.CancelToken.source();
    
    const fetchStatsWithToken = async () => {
      try {
        setLoading(true);
        
        let classesCount = 0;
        let studentsCount = 0;
        let teachersCount = 36; // Default value
        
        // Fetch classes count
        try {
          const classesResponse = await axios.get('/classes/count', {
            cancelToken: cancelToken.token
          });
          console.log(classesResponse.data);
          
          classesCount=classesResponse.data
        } catch (classErr) {
          if (!axios.isCancel(classErr)) {
            console.error('Error fetching classes:', classErr);
          }
        }
        
        // Fetch students count
        try {
          const studentsResponse = await axios.get('/students/count', {
            cancelToken: cancelToken.token
          });
          // Check if the response has a count property
          if (studentsResponse.data && typeof studentsResponse.data.count === 'number') {
            studentsCount = studentsResponse.data.count;
          } else if (studentsResponse.data && Array.isArray(studentsResponse.data)) {
            studentsCount = studentsResponse.data.length;
          } else if (typeof studentsResponse.data === 'number') {
            studentsCount = studentsResponse.data;
          }
        } catch (studentErr) {
          if (!axios.isCancel(studentErr)) {
            console.error('Error fetching students:', studentErr);
          }
        }
        
        // Fetch attendance data if the user is a student
        let attendanceData = {
          percentage: 0,
          trend: '-3% from last week' // Default trend text
        };
        
        if (user?.role === 'student') {
          try {
            const attendanceStatsResponse = await axios.get('/attendance/my');
            if (attendanceStatsResponse.data && attendanceStatsResponse.data.attendance) {
              const attendancePercentage = parseInt(attendanceStatsResponse.data.attendance);
              if (!isNaN(attendancePercentage)) {
                attendanceData.percentage = attendancePercentage;
              }
              
              if (attendanceStatsResponse.data.trend) {
                attendanceData.trend = attendanceStatsResponse.data.trend;
              }
            }
          } catch (attendanceErr) {
            console.error('Error fetching attendance:', attendanceErr);
          }
        }
        
        // Only update state if the component is still mounted
        setStats({
          classes: { 
            count: classesCount, 
            trend: '+2 new this week' 
          },
          students: { 
            count: studentsCount, 
            trend: '+12% this month' 
          },
          teachers: { 
            count: teachersCount, 
            trend: '2 new hiring' 
          },
          attendance: attendanceData
        });
        
        setError(null);
        
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('Error fetching dashboard stats:', err);
          setError('Failed to load dashboard statistics');
          // Keep previous stats if available or use defaults
          setStats(prevStats => prevStats || {
            classes: { count: 0, trend: '+2 new this week' },
            students: { count: 0, trend: '+12% this month' },
            teachers: { count: 0, trend: '2 new hiring' },
            attendance: { percentage: 0, trend: '-3% from last week' }
          });
        }
      } finally {
        if (!cancelToken.token.reason) {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchStatsWithToken();
    }
    
    // Cleanup function to cancel any pending requests
    return () => {
      cancelToken.cancel('Component unmounted');
    };
  }, [user]);

  // Fetch subjects taught by the teacher
  useEffect(() => {
    if (user?.role === 'teacher') {
      const fetchSubjects = async () => {
        try {
          console.log('Fetching subjects for teacher...');
          const response = await axios.get('/subjects/teacher');
          console.log('Subjects response:', response.data);
          
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            setSubjects(response.data);
            console.log(`Found ${response.data.length} subjects:`, response.data);
            
            // Auto-select the first subject if none is selected
            if (!selectedSubject && response.data[0]) {
              console.log('Auto-selecting first subject:', response.data[0]);
              setSelectedSubject(response.data[0].id.toString());
            }
          } else {
            console.log('No subjects found for teacher');
            setSubjects([]);
          }
        } catch (error) {
          console.error('Error fetching subjects:', error);
          setSnackbar({
            open: true,
            message: 'Failed to load subjects',
            severity: 'error'
          });
          setSubjects([]);
        }
      };
      
      fetchSubjects();
    }
  }, [user, selectedSubject]);

  // Fetch students when a subject is selected
  useEffect(() => {
    if (selectedSubject && user?.role === 'teacher') {
      console.log(`Fetching students for subject ID: ${selectedSubject}`);
      
      const fetchStudents = async () => {
        try {
          setLoading(true);
          
          // First, get the subject details to know which class it belongs to
          const subjectInfoResponse = await axios.get(`/subjects/${selectedSubject}`);
          const subjectInfo = subjectInfoResponse.data;
          
          if (!subjectInfo) {
            console.error('Subject information not found');
            setSnackbar({
              open: true,
              message: 'Failed to load subject information',
              severity: 'error'
            });
            setLoading(false);
            return;
          }
          
          console.log('Subject info:', subjectInfo);
          
          // Use the specific endpoint to get students for this subject
          const response = await axios.get(`/subjects/${selectedSubject}/students`);
          let fetchedStudents = response.data || [];
          
          // If that fails, try to get students by class and filter them
          if (fetchedStudents.length === 0 && subjectInfo.class) {
            console.log(`No students found directly for subject. Trying to fetch by class: ${subjectInfo.class}`);
            
            try {
              const classMembersResponse = await axios.get(`/students/by-class/${subjectInfo.class}`);
              const classMembers = classMembersResponse.data || [];
              
              if (classMembers.length > 0) {
                console.log(`Found ${classMembers.length} students in class ${subjectInfo.class}`);
                
                // For now, we'll consider these students as part of the subject
                // In a real implementation, you'd want to only show students who are enrolled in this subject
                fetchedStudents = classMembers;
              }
            } catch (classErr) {
              console.error('Error fetching students by class:', classErr);
            }
          }
          
          // If no students found for this subject, inform the user
          if (fetchedStudents.length === 0) {
            console.log('No students found for this subject or class.');
            setStudents([]);
            setAttendanceData([]);
            setLoading(false);
            return;
          }
          
          // Sort students by roll number for easier attendance marking
          const sortedStudents = [...fetchedStudents].sort((a, b) => {
            // Extract numeric part of roll number if possible
            const rollA = a.roll_no ? parseInt(a.roll_no.replace(/\D/g, '')) : 0;
            const rollB = b.roll_no ? parseInt(b.roll_no.replace(/\D/g, '')) : 0;
            
            if (!isNaN(rollA) && !isNaN(rollB)) {
              return rollA - rollB;
            }
            // Fallback to string comparison
            return (a.roll_no || '').localeCompare(b.roll_no || '');
          });
          
          setStudents(sortedStudents);
          console.log(`Set ${sortedStudents.length} students for attendance`);
          
          // Check if attendance was already marked for today
          const today = new Date().toISOString().split('T')[0];
          if (attendanceDate === today) {
            try {
              // Try to fetch today's attendance records for this subject
              const attendanceResponse = await axios.get(`/attendance/check/${selectedSubject}/${today}`);
              if (attendanceResponse.data && attendanceResponse.data.records && attendanceResponse.data.records.length > 0) {
                // Map existing attendance records to our format
                const existingAttendance = attendanceResponse.data.records.map(record => ({
                  student_id: record.student,
                  present: record.status.toLowerCase() === 'present'
                }));
                
                setAttendanceData(existingAttendance);
                
                // Show notification that attendance was already marked
                setSnackbar({
                  open: true,
                  message: 'Attendance for today has already been marked. You can edit it.',
                  severity: 'info'
                });
              } else {
                // Initialize attendance data with all students present by default
                setAttendanceData(sortedStudents.map(student => ({
                  student_id: student.id || student._id,
                  present: true
                })));
              }
            } catch (error) {
              console.log('No previous attendance records found');
              // Initialize attendance data with all students present by default
              setAttendanceData(sortedStudents.map(student => ({
                student_id: student.id || student._id,
                present: true
              })));
            }
          } else {
            // Initialize attendance data with all students present by default
            setAttendanceData(sortedStudents.map(student => ({
              student_id: student.id || student._id,
              present: true
            })));
          }
        } catch (error) {
          console.error('Error fetching students:', error);
          setSnackbar({
            open: true,
            message: 'Failed to load students for this subject',
            severity: 'error'
          });
          setStudents([]);
          setAttendanceData([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchStudents();
    }
  }, [selectedSubject, user, attendanceDate]);

  // Handle attendance checkbox change
  const handleAttendanceChange = (studentId) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.student_id === studentId 
          ? { ...item, present: !item.present } 
          : item
      )
    );
  };

  // Submit attendance
  const handleSubmitAttendance = async () => {
    try {
      setLoading(true);
      
      // Prepare data for API
      const submitData = {
        subject_id: selectedSubject,
        date: attendanceDate,
        attendance: attendanceData
      };
      
      // Make the API call to the bulk attendance endpoint
      await axios.post('/attendance/mark-bulk', submitData);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Attendance submitted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit attendance',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Separate function for refresh button
  const handleRefresh = () => {
    fetchStats();
  };

  // Main fetchStats function for the refresh button
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      let classesCount = 0;
      let studentsCount = 0;
      let teachersCount = 36; // Default value
      
      // Fetch classes count
      try {
        const classesResponse = await axios.get('/classes/count');
        if (classesResponse.data && Array.isArray(classesResponse.data)) {
          classesCount = classesResponse.data;
        }
      } catch (classErr) {
        console.error('Error fetching classes:', classErr);
      }
      
      // Fetch students count
      try {
        const studentsResponse = await axios.get('/students/count');
        // Check if the response has a count property
        if (studentsResponse.data && typeof studentsResponse.data.count === 'number') {
          studentsCount = studentsResponse.data.count;
        } else if (studentsResponse.data && Array.isArray(studentsResponse.data)) {
          studentsCount = studentsResponse.data.length;
        } else if (typeof studentsResponse.data === 'number') {
          studentsCount = studentsResponse.data;
        }
      } catch (studentErr) {
        console.error('Error fetching students:', studentErr);
      }
      
      // Fetch attendance data if the user is a student
      let attendanceData = {
        percentage: 0,
        trend: '-3% from last week' // Default trend text
      };
      
      if (user?.role === 'student') {
        try {
          const attendanceStatsResponse = await axios.get('/attendance/my');
          if (attendanceStatsResponse.data && attendanceStatsResponse.data.attendance) {
            const attendancePercentage = parseInt(attendanceStatsResponse.data.attendance);
            if (!isNaN(attendancePercentage)) {
              attendanceData.percentage = attendancePercentage;
            }
            
            if (attendanceStatsResponse.data.trend) {
              attendanceData.trend = attendanceStatsResponse.data.trend;
            }
          }
        } catch (attendanceErr) {
          console.error('Error fetching attendance:', attendanceErr);
        }
      }
      
      setStats({
        classes: { 
          count: classesCount, 
          trend: '+2 new this week' 
        },
        students: { 
          count: studentsCount, 
          trend: '+12% this month' 
        },
        teachers: { 
          count: teachersCount, 
          trend: '2 new hiring' 
        },
        attendance: attendanceData
      });
      
      setError(null);
      
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
      // Keep previous stats if available or use defaults
      setStats(prevStats => prevStats || {
        classes: { count: 0, trend: '+2 new this week' },
        students: { count: 0, trend: '+12% this month' },
        teachers: { count: 0, trend: '2 new hiring' },
        attendance: { percentage: 0, trend: '-3% from last week' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setDrawerOpen(false);
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  

  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { 
        text: 'Dashboard', 
        icon: <DashboardIcon />, 
        onClick: () => handleTabChange('dashboard'),
        id: 'dashboard'
      },
      { 
        text: 'Profile', 
        icon: <PersonIcon />, 
        onClick: () => handleTabChange('profile'),
        id: 'profile'
      },
    ];

    // Add role-specific items
    if (user?.role === 'admin') {
      baseItems.push({
        text: 'Manage Users',
        icon: <PeopleIcon />,
        onClick: () => handleTabChange('manageUsers'),
        id: 'manageUsers'
      });
    }
    
    // Add teacher-specific items
    if (user?.role === 'teacher') {
      baseItems.push({
        text: 'Mark Attendance',
        icon: <AttendanceIcon />,
        onClick: () => handleTabChange('attendance'),
        id: 'attendance'
      });
    }

    return baseItems;
  };

  // Dashboard welcome card
  const renderWelcomeCard = () => (
    <Card 
      elevation={2} 
      sx={{ 
        mb: 4, 
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.8)}, ${alpha(theme.palette.primary.main, 0.5)})`
          : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '150px',
          height: '150px',
          opacity: 0.1,
          transform: 'translate(30%, -30%)',
          borderRadius: '50%',
          background: theme.palette.common.white,
        }}
      />
      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" color="white" gutterBottom fontWeight="500">
              Welcome back, {user?.name || 'User'}!
            </Typography>
            <Typography variant="subtitle1" color="white" sx={{ opacity: 0.9, mb: 2 }}>
              You are logged in as a <Chip 
                label={user?.role || 'user'} 
                size="small" 
                sx={{ 
                  ml: 1, 
                  color: 'white', 
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                  borderColor: alpha(theme.palette.common.white, 0.3),
                  borderWidth: 1,
                  borderStyle: 'solid',
                }}
              />
            </Typography>
            <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
              {
                new Date().toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              }
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: alpha(theme.palette.common.white, 0.2),
                color: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '2px solid white',
              }}
            >
              {getInitials(user?.name)}
            </Avatar>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Profile content
  const renderProfileContent = () => (
    <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box 
        sx={{ 
          p: 3, 
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(60deg, ${alpha(theme.palette.primary.dark, 0.6)}, ${alpha(theme.palette.primary.main, 0.4)})`
            : `linear-gradient(60deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Avatar 
          sx={{ 
            width: 100, 
            height: 100, 
            bgcolor: alpha(theme.palette.common.white, 0.2),
            color: 'white',
            border: '3px solid white',
            fontSize: '2rem',
          }}
        >
          {getInitials(user?.name)}
        </Avatar>
        <Box>
          <Typography variant="h4" color="white" gutterBottom fontWeight="500">
            {user?.name || 'User Profile'}
          </Typography>
          <Chip 
            label={user?.role || 'user'} 
            size="small" 
            sx={{ 
              color: 'white', 
              bgcolor: alpha(theme.palette.common.white, 0.15),
              borderColor: alpha(theme.palette.common.white, 0.3),
              borderWidth: 1,
              borderStyle: 'solid',
              mb: 1,
            }}
          />
        </Box>
      </Box>
      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Full Name
            </Typography>
            <Typography variant="body1" gutterBottom fontWeight="medium">
              {user?.name || 'N/A'}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 3 }}>
              Role
            </Typography>
            <Typography variant="body1" gutterBottom fontWeight="medium">
              {user?.role || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Email
            </Typography>
            <Typography variant="body1" gutterBottom fontWeight="medium">
              {user?.email || 'N/A'}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 3 }}>
              Member Since
            </Typography>
            <Typography variant="body1" gutterBottom fontWeight="medium">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Render content based on active tab
  const renderContent = () => {
    // For profile tab, always render the profile content
    if (activeTab === 'profile') {
      return renderProfileContent();
    }
    
    // For dashboard tab, render the role-specific dashboard
    switch (user?.role) {
      case 'student':
        return (
          <Box sx={{ minHeight: '85vh' }}>
            {renderWelcomeCard()}
            <StudentDashboard user={user} />
          </Box>
        );
      case 'teacher':
        return (
          <Box sx={{ minHeight: '85vh' }}>
            {renderWelcomeCard()}
            <TeacherDashboard user={user} />
          </Box>
        );
      case 'admin':
        return (
          <Box sx={{ minHeight: '85vh' }}>
            {renderWelcomeCard()}
            <AdminDashboard user={user} />
          </Box>
        );
      default:
        return (
          <Typography variant="body1">
            Unknown user role. Please contact an administrator.
          </Typography>
        );
    }
  };

  const menuItems = getMenuItems();

  return (
    <Box sx={{ display: 'flex', minWidth: '100vw' }}>
      {/* Fixed AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: isDarkMode ? '0 4px 6px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.1)',
          background: isDarkMode ? 
            alpha(theme.palette.background.paper, 0.96) : 
            alpha(theme.palette.background.paper, 0.96),
          backdropFilter: 'blur(10px)',
        }}
        color="inherit"
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              ERP System
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton sx={{ mx: 1 }}>
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* Settings */}
            <Tooltip title="Settings">
              <IconButton sx={{ mx: 1 }}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            {/* Theme toggle button */}
            <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton color="inherit" onClick={toggleColorMode} sx={{ mx: 1 }}>
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            {/* User avatar */}
            <Avatar 
              sx={{ 
                ml: 1, 
                width: 40, 
                height: 40,
                bgcolor: theme.palette.primary.main,
                cursor: 'pointer',
              }}
              onClick={() => handleTabChange('profile')}
            >
              {getInitials(user?.name)}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer with proper spacing for fixed AppBar */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 260,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            mt: { xs: '56px', sm: '64px' }, // Adjusts for AppBar height
            background: isDarkMode ? 
              alpha(theme.palette.background.paper, 0.96) : 
              alpha(theme.palette.background.paper, 0.96),
            backdropFilter: 'blur(10px)',
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          },
        }}
        variant="temporary"
      >
        <Box
          sx={{ overflow: 'auto', p: 2 }}
          role="presentation"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, px: 1 }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: theme.palette.primary.main,
                mr: 2,
              }}
            >
              {getInitials(user?.name)}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight="medium">
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role || 'user'}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography 
            variant="overline" 
            color="text.secondary" 
            sx={{ 
              px: 1, 
              display: 'block', 
              mb: 1,
              fontWeight: 'medium',
            }}
          >
            MAIN MENU
          </Typography>
          
          <List component="nav" disablePadding>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.id} 
                onClick={item.onClick}
                selected={activeTab === item.id}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.primary.main, 0.15)
                      : alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.primary.main, 0.25)
                        : alpha(theme.palette.primary.main, 0.15),
                    },
                    color: theme.palette.primary.main,
                  },
                  borderRadius: '12px',
                  my: 0.5,
                  pl: 2,
                  pr: 1,
                  py: 1,
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 40,
                  color: activeTab === item.id ? theme.palette.primary.main : 'inherit',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: 15,
                    fontWeight: activeTab === item.id ? 'medium' : 'regular',
                  }}
                />
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography 
            variant="overline" 
            color="text.secondary" 
            sx={{ 
              px: 1, 
              display: 'block', 
              mb: 1,
              fontWeight: 'medium',
            }}
          >
            ACCOUNT
          </Typography>
          
          <List>
            <ListItem 
              button 
              onClick={handleLogout}
              sx={{
                borderRadius: '12px',
                my: 0.5,
                pl: 2,
                pr: 1,
                py: 1,
                color: theme.palette.error.main,
              }}
            >
              <ListItemIcon>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ 
                  fontSize: 15, 
                  fontWeight: 'medium',
                }}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main content with spacing for fixed AppBar */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          overflow: 'auto',
          pt: { xs: 7, sm: 8 }, // Top padding to account for AppBar height
          px: { xs: 2, sm: 3, md: 4 },
          pb: 3,
          backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.background.default 
            : '#f5f8fa',
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard; 