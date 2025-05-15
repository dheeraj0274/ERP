import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  alpha,
  Avatar,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Stack,
  LinearProgress,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  CalendarMonth as CalendarMonthIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material';

const StudentDashboard = ({ user }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    attendance: { percentage: 0, trend: '-3% from last week' }
  });
  const [subjects, setSubjects] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [error, setError] = useState(null);

  // Fetch student dashboard data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Fetch attendance statistics
        let attendanceData = {
          percentage: 0,
          trend: '-3% from last week' // Default trend text
        };
        
        try {
          const attendanceResponse = await axios.get('/my-percentage');
          if (attendanceResponse.data && attendanceResponse.data.attendance) {
            const attendancePercentage = parseInt(attendanceResponse.data.attendance);
            if (!isNaN(attendancePercentage)) {
              attendanceData.percentage = attendancePercentage;
            }
            
            if (attendanceResponse.data.trend) {
              attendanceData.trend = attendanceResponse.data.trend;
            }
          }
        } catch (attendanceErr) {
          console.error('Error fetching attendance:', attendanceErr);
        }
        
        // Fetch enrolled subjects
        let fetchedSubjects = [];
        try {
          const subjectsResponse = await axios.get('/subjects/my');
          if (subjectsResponse.data && Array.isArray(subjectsResponse.data)) {
            fetchedSubjects = subjectsResponse.data;
            setSubjects(fetchedSubjects);
          }
        } catch (subjectsErr) {
          console.error('Error fetching subjects:', subjectsErr);
          // Use dummy data for now
          fetchedSubjects = [
            { id: 1, name: 'Mathematics', teacher: 'Dr. Smith', time: '10:00 AM', day: 'Monday' },
            { id: 2, name: 'Science', teacher: 'Mrs. Johnson', time: '11:30 AM', day: 'Tuesday' },
            { id: 3, name: 'History', teacher: 'Mr. Davis', time: '09:15 AM', day: 'Wednesday' },
            { id: 4, name: 'English', teacher: 'Ms. Williams', time: '02:00 PM', day: 'Thursday' },
          ];
          setSubjects(fetchedSubjects);
        }
        
        // Fetch upcoming exams
        try {
          const examsResponse = await axios.get('/exams/upcoming');
          if (examsResponse.data && Array.isArray(examsResponse.data)) {
            setUpcomingExams(examsResponse.data);
          }
        } catch (examsErr) {
          console.error('Error fetching exams:', examsErr);
          // Use dummy data for now
          setUpcomingExams([
            { id: 1, subject: 'Mathematics', date: '2023-05-20', time: '10:00 AM' },
            { id: 2, subject: 'Science', date: '2023-05-25', time: '02:00 PM' },
          ]);
        }
        
        // Fetch today's classes
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        try {
          const classesResponse = await axios.get('/classes/today');
          if (classesResponse.data && Array.isArray(classesResponse.data)) {
            setTodayClasses(classesResponse.data);
          } else {
            // Filter fetched subjects to get today's classes as fallback
            const todaySubjects = fetchedSubjects.filter(s => s.day === today);
            setTodayClasses(todaySubjects.map(s => ({
              id: s.id,
              subject: s.name,
              time: s.time,
              teacher: s.teacher
            })));
          }
        } catch (classesErr) {
          console.error('Error fetching classes:', classesErr);
          // Filter fetched subjects to get today's classes as fallback
          const todaySubjects = fetchedSubjects.filter(s => s.day === today);
          setTodayClasses(todaySubjects.map(s => ({
            id: s.id,
            subject: s.name,
            time: s.time,
            teacher: s.teacher
          })));
        }
        
        // Update stats
        setStats({
          attendance: attendanceData
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
        setError('Failed to load dashboard information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, []); // Remove 'subjects' from dependencies to avoid infinite loop

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get next class from today's classes
  const getNextClass = () => {
    if (todayClasses.length === 0) return null;
    
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Sort classes by time
      const sortedClasses = [...todayClasses].sort((a, b) => {
        try {
          // Handle different time formats safely
          let timeA = a.time || '12:00 PM';
          let timeB = b.time || '12:00 PM';
          
          // Extract hours and minutes
          const timeAMatch = timeA.match(/(\d+):(\d+)\s*([AP]M)?/i);
          const timeBMatch = timeB.match(/(\d+):(\d+)\s*([AP]M)?/i);
          
          if (!timeAMatch || !timeBMatch) return 0;
          
          let hourA = parseInt(timeAMatch[1]);
          let hourB = parseInt(timeBMatch[1]);
          const minuteA = parseInt(timeAMatch[2]);
          const minuteB = parseInt(timeBMatch[2]);
          const isPMA = timeAMatch[3]?.toUpperCase() === 'PM' && hourA !== 12;
          const isPMB = timeBMatch[3]?.toUpperCase() === 'PM' && hourB !== 12;
          
          const totalMinutesA = (isPMA ? hourA + 12 : hourA) * 60 + minuteA;
          const totalMinutesB = (isPMB ? hourB + 12 : hourB) * 60 + minuteB;
          
          return totalMinutesA - totalMinutesB;
        } catch (err) {
          console.error('Error sorting class times:', err);
          return 0;
        }
      });
      
      // Find next class
      for (const cls of sortedClasses) {
        try {
          if (!cls.time) continue;
          
          // Parse time with regex to be more forgiving of format
          const timeMatch = cls.time.match(/(\d+):(\d+)\s*([AP]M)?/i);
          if (!timeMatch) continue;
          
          let hour = parseInt(timeMatch[1]);
          const minute = parseInt(timeMatch[2]);
          const isPM = timeMatch[3]?.toUpperCase() === 'PM' && hour !== 12;
          
          if (isPM) hour += 12;
          
          if (hour > currentHour || (hour === currentHour && minute > currentMinute)) {
            return cls;
          }
        } catch (err) {
          console.error('Error parsing class time:', err);
          continue;
        }
      }
      
      return sortedClasses[0]; // Return first class if no next class found
    } catch (err) {
      console.error('Error in getNextClass:', err);
      return todayClasses[0]; // Fallback to first class on error
    }
  };
  
  const nextClass = getNextClass();
  
  // Get attendance status color and label
  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return { color: 'success', label: 'Excellent' };
    if (percentage >= 75) return { color: 'info', label: 'Good' };
    if (percentage >= 60) return { color: 'warning', label: 'Needs Improvement' };
    return { color: 'error', label: 'Critical' };
  };
  
  const attendanceStatus = getAttendanceStatus(stats.attendance.percentage);

  // Render student dashboard
  return (
    <Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center" sx={{ my: 2 }}>
          {error}
        </Typography>
      ) : (
        <>
          {/* Welcome Banner */}
          <Card 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 3,
              background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
              color: 'white',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Welcome back, {user?.name || 'Student'}!
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                  {todayClasses.length > 0 
                    ? `You have ${todayClasses.length} classes scheduled for today.` 
                    : 'You have no classes scheduled for today.'}
                </Typography>
                
                {nextClass && (
                  <Alert 
                    severity="info" 
                    icon={<AccessTimeIcon />}
                    sx={{ 
                      mt: 2, 
                      backgroundColor: alpha('#fff', 0.2), 
                      color: 'white',
                      '& .MuiAlert-icon': { color: 'white' }
                    }}
                  >
                    <AlertTitle>Next Class</AlertTitle>
                    {nextClass.subject} at {nextClass.time} with {nextClass.teacher}
                  </Alert>
                )}
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    bgcolor: alpha('#fff', 0.2),
                    color: 'white',
                    fontSize: '2.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  {user?.name?.charAt(0) || 'S'}
                </Avatar>
              </Grid>
            </Grid>
          </Card>

          {/* Stats Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={1} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  ':hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px -10px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography color="text.secondary" variant="h6" fontWeight="medium">
                    Attendance
                  </Typography>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1), 
                      color: theme.palette.primary.main,
                      width: 48,
                      height: 48,
                    }}
                  >
                    <NotificationsIcon />
                  </Avatar>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.attendance.percentage}%
                    </Typography>
                    <Chip 
                      label={attendanceStatus.label} 
                      color={attendanceStatus.color} 
                      size="small"
                      sx={{ fontWeight: 'medium' }}
                    />
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.attendance.percentage} 
                    color={attendanceStatus.color}
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                  
                  <Typography variant="caption" color="text.secondary">
                    {stats.attendance.trend}
                  </Typography>
                </Box>
                
                {stats.attendance.percentage < 75 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Your attendance is below the required 75%
                  </Alert>
                )}
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={1} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  ':hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px -10px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography color="text.secondary" variant="h6" fontWeight="medium">
                    Upcoming Exams
                  </Typography>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                      color: theme.palette.secondary.main,
                      width: 48,
                      height: 48,
                    }}
                  >
                    <CalendarMonthIcon />
                  </Avatar>
                </Box>
                
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                  {upcomingExams.length}
                </Typography>
                
                {upcomingExams.length > 0 ? (
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {upcomingExams.slice(0, 2).map((exam) => (
                      <Alert 
                        key={exam.id}
                        severity="info" 
                        icon={<EventIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {exam.subject} - {formatDate(exam.date)}
                        </Typography>
                      </Alert>
                    ))}
                    
                    {upcomingExams.length > 2 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        +{upcomingExams.length - 2} more exams scheduled
                      </Typography>
                    )}
                  </Stack>
                ) : (
                  <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt: 1 }}>
                    No upcoming exams scheduled
                  </Alert>
                )}
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={1} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  ':hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px -10px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography color="text.secondary" variant="h6" fontWeight="medium">
                    Today's Classes
                  </Typography>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.info.main, 0.1), 
                      color: theme.palette.info.main,
                      width: 48,
                      height: 48,
                    }}
                  >
                    <ScheduleIcon />
                  </Avatar>
                </Box>
                
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                  {todayClasses.length}
                </Typography>
                
                {todayClasses.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    {nextClass && (
                      <Alert 
                        severity="info" 
                        sx={{ borderRadius: 2, mb: 1 }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          Next: {nextClass.subject} ({nextClass.time})
                        </Typography>
                      </Alert>
                    )}
                    
                    <Typography variant="body2" color="text.secondary">
                      {todayClasses.length > 1 
                        ? `${todayClasses.length - 1} other class${todayClasses.length > 2 ? 'es' : ''} today` 
                        : 'Only one class scheduled today'}
                    </Typography>
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    No classes scheduled for today
                  </Alert>
                )}
              </Card>
            </Grid>

            {/* Timeline for upcoming events */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Events Timeline
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  {upcomingExams.length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                      No upcoming events scheduled
                    </Typography>
                  ) : (
                    <Timeline position="alternate">
                      {upcomingExams.map((exam, index) => (
                        <TimelineItem key={exam.id}>
                          <TimelineOppositeContent color="text.secondary">
                            {formatDate(exam.date)}
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color={index === 0 ? "primary" : "secondary"} variant={index === 0 ? "filled" : "outlined"}>
                              <EventIcon />
                            </TimelineDot>
                            {index < upcomingExams.length - 1 && <TimelineConnector />}
                          </TimelineSeparator>
                          <TimelineContent>
                            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="h6" component="span">
                                {exam.subject} Exam
                              </Typography>
                              <Typography>{exam.time}</Typography>
                            </Paper>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Subject List */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    My Subjects
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <List sx={{ maxHeight: 350, overflow: 'auto' }}>
                    {subjects.length === 0 ? (
                      <ListItem>
                        <ListItemText 
                          primary="No subjects found" 
                          secondary="You are not enrolled in any subjects yet."
                        />
                      </ListItem>
                    ) : (
                      subjects.map(subject => (
                        <ListItem
                          key={subject.id}
                          sx={{ 
                            mb: 1,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.8) }}>
                              <BookIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={subject.name}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {subject.teacher}
                                </Typography>
                                {' — '}{subject.day} at {subject.time}
                              </>
                            }
                          />
                          <Chip 
                            size="small" 
                            label={subject.day} 
                            sx={{ 
                              backgroundColor: 
                                subject.day === 'Monday' ? alpha(theme.palette.primary.main, 0.2) : 
                                subject.day === 'Tuesday' ? alpha(theme.palette.secondary.main, 0.2) : 
                                subject.day === 'Wednesday' ? alpha(theme.palette.success.main, 0.2) :
                                subject.day === 'Thursday' ? alpha(theme.palette.info.main, 0.2) :
                                subject.day === 'Friday' ? alpha(theme.palette.warning.main, 0.2) :
                                alpha(theme.palette.grey[500], 0.2)
                            }}
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Upcoming Exams */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Exams
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <List sx={{ maxHeight: 350, overflow: 'auto' }}>
                    {upcomingExams.length === 0 ? (
                      <ListItem>
                        <ListItemText 
                          primary="No upcoming exams" 
                          secondary="You don't have any scheduled exams at the moment."
                        />
                      </ListItem>
                    ) : (
                      upcomingExams.map(exam => (
                        <ListItem
                          key={exam.id}
                          sx={{ 
                            mb: 1,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.secondary.main, 0.05),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.8) }}>
                              <AssignmentIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={exam.subject}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {formatDate(exam.date)}
                                </Typography>
                                {' — '}{exam.time}
                              </>
                            }
                          />
                          <Chip 
                            size="small" 
                            label={new Date(exam.date) < new Date() ? 'Past' : 'Upcoming'} 
                            color={new Date(exam.date) < new Date() ? 'default' : 'secondary'}
                            variant="outlined"
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default StudentDashboard; 