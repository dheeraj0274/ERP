import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  alpha,
  CircularProgress,
  Avatar,
  Button,
  Tabs,
  Tab,
  Divider,
  Stack,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Paper,
  Alert,
  AlertTitle,
  IconButton,
  Tooltip,
  TextField,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  EventNote as EventNoteIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Send as SendIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material';
import ManageUsers from '../ManageUsers';
import ExaminationSystem from '../admin/ExaminationSystem.jsx';
import CommunicationSystem from '../admin/CommunicationSystem.jsx';
import Announcements from '../Announcements.jsx';

const AdminDashboard = ({ user }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    classes: { count: 0, trend: '+2 new this week' },
    students: { count: 0, trend: '+12% this month' },
    teachers: { count: 0, trend: '2 new hiring' },
    attendance: { percentage: 85, trend: '+5% from last month' },
    subjects: { count: 24, trend: '3 new added' },
  });
  const [activeAdminTab, setActiveAdminTab] = useState('overview');
  const [error, setError] = useState(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');

  // Fetch admin dashboard statistics
  useEffect(() => {
    fetchStats();
  }, []);

  // Function to fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      let classesCount = 0;
      let studentsCount = 0;
      let teachersCount = 36; // Default value
      
      // Fetch classes count
      try {
        const classesResponse = await axios.get('/classes/count');
        if (classesResponse.data && typeof classesResponse.data === 'number') {
          classesCount = classesResponse.data;
        } else if (classesResponse.data && Array.isArray(classesResponse.data)) {
          classesCount = classesResponse.data.length;
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
      
      // Fetch teachers count
      try {
        const teachersResponse = await axios.get('/teachers/count');
        if (teachersResponse.data && typeof teachersResponse.data.count === 'number') {
          teachersCount = teachersResponse.data.count;
        } else if (teachersResponse.data && Array.isArray(teachersResponse.data)) {
          teachersCount = teachersResponse.data.length;
        } else if (typeof teachersResponse.data === 'number') {
          teachersCount = teachersResponse.data;
        }
      } catch (teacherErr) {
        console.error('Error fetching teachers:', teacherErr);
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
        attendance: { 
          percentage: 85, 
          trend: '+5% from last month' 
        },
        subjects: { 
          count: 24, 
          trend: '3 new added' 
        },
      });
      
      setError(null);
      
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveAdminTab(newValue);
  };

  const handleAnnouncementSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/announce', {
        title: announcementTitle,
        message: announcementMessage,
        userType: 'both', // or 'student' / 'teacher' based on your requirement
      });
      console.log('Announcement created:', response.data);
      // Optionally, reset the form fields
      setAnnouncementTitle('');
      setAnnouncementMessage('');
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  // Render stats cards
  const renderStatCards = () => (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={4}>
        <Card elevation={1} sx={{ p: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography color="text.secondary" variant="h6" fontWeight="medium">
              Classes
            </Typography>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 40, height: 40 }}>
              <SchoolIcon />
            </Avatar>
          </Box>
          <Typography variant="h4" fontWeight="bold">{stats.classes.count}</Typography>
          <LinearProgress variant="determinate" value={75} sx={{ height: 6, borderRadius: 4, mb: 1 }} />
          <Typography variant="body2" color="text.secondary">{stats.classes.trend}</Typography>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card elevation={1} sx={{ p: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography color="text.secondary" variant="h6" fontWeight="medium">
              Students
            </Typography>
            <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, width: 40, height: 40 }}>
              <PeopleIcon />
            </Avatar>
          </Box>
          <Typography variant="h4" fontWeight="bold">{stats.students.count}</Typography>
          <LinearProgress variant="determinate" value={65} sx={{ height: 6, borderRadius: 4, mb: 1 }} />
          <Typography variant="body2" color="text.secondary">{stats.students.trend}</Typography>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card elevation={1} sx={{ p: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography color="text.secondary" variant="h6" fontWeight="medium">
              Teachers
            </Typography>
            <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, width: 40, height: 40 }}>
              <PersonIcon />
            </Avatar>
          </Box>
          <Typography variant="h4" fontWeight="bold">{stats.teachers.count}</Typography>
          <LinearProgress variant="determinate" value={80} sx={{ height: 6, borderRadius: 4, mb: 1 }} />
          <Typography variant="body2" color="text.secondary">{stats.teachers.trend}</Typography>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={6}>
        <Card elevation={1} sx={{ p: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography color="text.secondary" variant="h6" fontWeight="medium">
              Overall Attendance
            </Typography>
            <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, width: 40, height: 40 }}>
              <AssessmentIcon />
            </Avatar>
          </Box>
          <Typography variant="h4" fontWeight="bold">{stats.attendance.percentage}%</Typography>
          <LinearProgress variant="determinate" value={stats.attendance.percentage} sx={{ height: 6, borderRadius: 4, mb: 1 }} />
          <Typography variant="body2" color="text.secondary">{stats.attendance.trend}</Typography>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={6}>
        <Card elevation={1} sx={{ p: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography color="text.secondary" variant="h6" fontWeight="medium">
              Total Subjects
            </Typography>
            <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, width: 40, height: 40 }}>
              <EventNoteIcon />
            </Avatar>
          </Box>
          <Typography variant="h4" fontWeight="bold">{stats.subjects.count}</Typography>
          <LinearProgress variant="determinate" value={70} sx={{ height: 6, borderRadius: 4, mb: 1 }} />
          <Typography variant="body2" color="text.secondary">{stats.subjects.trend}</Typography>
        </Card>
      </Grid>
    </Grid>
  );
  
  // Render the system overview section
  const renderSystemOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={7}>
        <Card sx={{ borderRadius: 3, height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <SchoolIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={`${stats.classes.count} active classes`} 
                  secondary="Manage class schedules, subjects, and assignments" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <PeopleIcon color="secondary" />
                </ListItemIcon>
                <ListItemText 
                  primary={`${stats.students.count} enrolled students`} 
                  secondary="View student profiles, attendance, and performance" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary={`${stats.teachers.count} faculty members`} 
                  secondary="Manage teacher assignments and schedules" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <AssessmentIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary={`${stats.attendance.percentage}% average attendance`} 
                  secondary="Overall student attendance across all classes" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <EventNoteIcon color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary={`${stats.subjects.count} subjects offered`} 
                  secondary="Curriculum coverage across all grade levels" 
                />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="contained" 
                startIcon={<DashboardIcon />}
                sx={{ mr: 2 }}
              >
                View Reports
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<SettingsIcon />}
              >
                System Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={5}>
        <Card sx={{ borderRadius: 3, height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Quick Actions
              </Typography>
              <Tooltip title="Get help with these actions">
                <IconButton size="small">
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={2}>
              <Alert 
                severity="info" 
                icon={<SchoolIcon />}
                action={
                  <Button size="small" variant="outlined" onClick={() => setActiveAdminTab('examinations')}>
                    Manage
                  </Button>
                }
              >
                <AlertTitle>Examination System</AlertTitle>
                Set up the new semester exam schedule
              </Alert>
              
              <Alert 
                severity="warning" 
                icon={<NotificationsIcon />}
                action={
                  <Button size="small" variant="outlined" onClick={() => setActiveAdminTab('communications')}>
                    Notify
                  </Button>
                }
              >
                <AlertTitle>Fee Reminder</AlertTitle>
                {Math.round(stats.students.count * 0.15)} students have pending fee payments
              </Alert>
              
              <Alert 
                severity="success" 
                icon={<PeopleIcon />}
                action={
                  <Button size="small" variant="outlined" onClick={() => setActiveAdminTab('manageUsers')}>
                    Review
                  </Button>
                }
              >
                <AlertTitle>New Admissions</AlertTitle>
                {Math.round(stats.students.count * 0.08)} new student applications to review
              </Alert>
            </Stack>
            
            <Box sx={{ mt: 3 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.05) 
                }}
              >
                <Typography variant="h6" gutterBottom color="primary">
                  System Health
                </Typography>
                <Typography variant="body2" paragraph>
                  All systems operational. Last backup: {new Date().toLocaleDateString()}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={95} 
                  color="primary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Paper>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, {user?.name || 'Administrator'}!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
            Here's your school management overview. You have access to all system resources.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" sx={{ mr: 2 }}>Generate Reports</Button>
            <Button variant="outlined">System Settings</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Announcements Section */}
      <Box component="form" onSubmit={handleAnnouncementSubmit} sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Create Announcement</Typography>
        <TextField label="Title" variant="outlined" fullWidth value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} required sx={{ mb: 2 }} />
        <TextField label="Message" variant="outlined" fullWidth multiline rows={4} value={announcementMessage} onChange={(e) => setAnnouncementMessage(e.target.value)} required sx={{ mb: 2 }} />
        <Button type="submit" variant="contained" color="primary">Announce</Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h2" fontWeight="medium">Admin Dashboard</Typography>
        <Button variant="outlined" color="primary" startIcon={<RefreshIcon />} onClick={fetchStats} disabled={loading} size="small">Refresh Stats</Button>
      </Box>

      <Tabs
        value={activeAdminTab}
        onChange={handleTabChange}
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          mb: 3,
          '& .MuiTab-root': {
            minWidth: 'auto',
            px: 3,
            py: 1.5,
            fontWeight: 'medium',
            borderRadius: '8px 8px 0 0',
            mr: 1,
            transition: 'all 0.2s',
          },
          '& .Mui-selected': {
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          }
        }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab 
          value="overview" 
          label="Overview" 
          icon={<DashboardIcon />}
          iconPosition="start"
        />
        <Tab 
          value="manageUsers" 
          label="Manage Users" 
          icon={<PeopleIcon />}
          iconPosition="start"
        />
        <Tab 
          value="examinations" 
          label="Examinations" 
          icon={<MenuBookIcon />}
          iconPosition="start"
        />
        <Tab 
          value="communications" 
          label="Communications" 
          icon={<SendIcon />}
          iconPosition="start"
        />
      </Tabs>

      {loading && activeAdminTab === 'overview' ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error && activeAdminTab === 'overview' ? (
        <Typography color="error" align="center" sx={{ my: 2 }}>
          {error}
        </Typography>
      ) : (
        <>
          {activeAdminTab === 'overview' && (
            <>
              {renderStatCards()}
              {renderSystemOverview()}
            </>
          )}
          {activeAdminTab === 'manageUsers' && <ManageUsers />}
          {activeAdminTab === 'examinations' && <ExaminationSystem />}
          {activeAdminTab === 'communications' && <CommunicationSystem />}
        </>
      )}
    </Box>
  );
};

export default AdminDashboard; 