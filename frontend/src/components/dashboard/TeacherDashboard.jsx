import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  DialogTitle,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Stack,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  CircleOutlined as CircleOutlinedIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  MenuBook as MenuBookIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material';

const TeacherDashboard = ({ user }) => {
  const theme = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [openAddStudentDialog, setOpenAddStudentDialog] = useState(false);
  const [allStudentsList, setAllStudentsList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableStudents, setAvailableStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('attendance');
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    averageAttendance: 0,
    upcomingClasses: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch subjects taught by the teacher
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        console.log('Fetching subjects for teacher...');
        const response = await axios.get('/subjects/teacher');
        console.log('Subjects response:', response.data);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setSubjects(response.data);
          console.log(`Found ${response.data.length} subjects:`, response.data);
          
          // Update dashboard stats
          setDashboardStats(prev => ({
            ...prev,
            totalSubjects: response.data.length
          }));
          
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
  }, [selectedSubject]);

  // Fetch students when a subject is selected
  useEffect(() => {
    if (selectedSubject) {
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
          
          // If still no students, try the subjects endpoint
          if (fetchedStudents.length === 0) {
            try {
              console.log('Trying to fetch students by teacher subjects');
              const subjectsResponse = await axios.get('/students/subjectstudents');
              const subjectStudents = subjectsResponse.data || [];
              
              if (subjectStudents.length > 0) {
                console.log(`Found ${subjectStudents.length} students via teacher subjects`);
                fetchedStudents = subjectStudents;
              }
            } catch (subjectErr) {
              console.error('Error fetching students by subject:', subjectErr);
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
          
          // Update dashboard stats
          setDashboardStats(prev => ({
            ...prev,
            totalStudents: sortedStudents.length
          }));
          
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
                
                // Calculate average attendance for dashboard stats
                const presentCount = existingAttendance.filter(record => record.present).length;
                const attendancePercentage = Math.round((presentCount / existingAttendance.length) * 100);
                
                setDashboardStats(prev => ({
                  ...prev,
                  averageAttendance: attendancePercentage
                }));
                
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
                
                // Set average attendance to 100% since all are present by default
                setDashboardStats(prev => ({
                  ...prev,
                  averageAttendance: 100
                }));
              }
            } catch (error) {
              console.log('No previous attendance records found');
              // Initialize attendance data with all students present by default
              setAttendanceData(sortedStudents.map(student => ({
                student_id: student.id || student._id,
                present: true
              })));
              
              // Set average attendance to 100% since all are present by default
              setDashboardStats(prev => ({
                ...prev,
                averageAttendance: 100
              }));
            }
          } else {
            // Initialize attendance data with all students present by default
            setAttendanceData(sortedStudents.map(student => ({
              student_id: student.id || student._id,
              present: true
            })));
            
            // Set average attendance to 100% since all are present by default
            setDashboardStats(prev => ({
              ...prev,
              averageAttendance: 100
            }));
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
  }, [selectedSubject, attendanceDate]);

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

  // Fetch all students not already in the selected subject
  const fetchAvailableStudents = async () => {
    if (!selectedSubject) return;
    
    try {
      setLoading(true);
      
      // Get the current students in this subject
      const currentStudents = new Set(students.map(s => s.id));
      
      // First, try to get students by the teacher's subjects
      const subjectStudentsResponse = await axios.get('/students/subjectstudents');
      let allStudents = subjectStudentsResponse.data || [];
      
      // If that fails or returns empty, try the generic endpoint
      if (allStudents.length === 0) {
        console.log('No students found via subjects, trying generic endpoint');
        const allStudentsResponse = await axios.get('/subjects/all-students');
        allStudents = allStudentsResponse.data || [];
      }
      
      console.log(`Found ${allStudents.length} total students`);
      setAllStudentsList(allStudents);
      
      // Filter out students who are already in this subject
      const available = allStudents.filter(student => !currentStudents.has(student.id));
      console.log(`${available.length} students available to add to this subject`);
      setAvailableStudents(available);
      
    } catch (error) {
      console.error('Error fetching available students:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load available students',
        severity: 'error'
      });
      setAllStudentsList([]);
      setAvailableStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter available students based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setAvailableStudents(allStudentsList);
    } else {
      const filtered = allStudentsList.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (student.roll_no && student.roll_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (student.email && student.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setAvailableStudents(filtered);
    }
  }, [searchQuery, allStudentsList]);

  // Handle opening the add student dialog
  const handleOpenAddStudentDialog = () => {
    fetchAvailableStudents();
    setOpenAddStudentDialog(true);
  };

  // Handle closing the add student dialog
  const handleCloseAddStudentDialog = () => {
    setOpenAddStudentDialog(false);
    setSelectedStudentId('');
    setSearchQuery('');
  };

  // Handle adding a student
  const handleAddStudent = async () => {
    if (!selectedSubject) {
      setSnackbar({
        open: true,
        message: 'Please select a subject first',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Add existing student to subject
      if (!selectedStudentId) {
        setSnackbar({
          open: true,
          message: 'Please select a student to add',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Just add the student directly without trying to get student details first
      await axios.post(`/subjects/${selectedSubject}/students`, {
        student_id: selectedStudentId
      });
      
      const studentName = allStudentsList.find(s => (s.id || s._id) === selectedStudentId)?.name || 'Student';
      
      setSnackbar({
        open: true,
        message: `Added ${studentName} to subject`,
        severity: 'success'
      });
      
      // Close dialog and refresh student list
      handleCloseAddStudentDialog();
      
      // Refetch students for this subject
      if (selectedSubject) {
        const response = await axios.get(`/subjects/${selectedSubject}/students`);
        const fetchedStudents = response.data || [];
        
        // Sort students by roll number
        const sortedStudents = [...fetchedStudents].sort((a, b) => {
          const rollA = a.roll_no ? parseInt(a.roll_no.replace(/\D/g, '')) : 0;
          const rollB = b.roll_no ? parseInt(b.roll_no.replace(/\D/g, '')) : 0;
          
          if (!isNaN(rollA) && !isNaN(rollB)) {
            return rollA - rollB;
          }
          return (a.roll_no || '').localeCompare(b.roll_no || '');
        });
        
        setStudents(sortedStudents);
        
        // Update attendance data
        setAttendanceData(sortedStudents.map(student => ({
          student_id: student.id || student._id,
          present: true
        })));
      }
      
    } catch (error) {
      console.error('Error adding student:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to add student',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function for getting initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Main component render
  return (
    <Box>
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
              Welcome back, {user?.name || 'Teacher'}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
              {subjects.length > 0 
                ? `You are teaching ${subjects.length} subject${subjects.length > 1 ? 's' : ''}.` 
                : 'You have no assigned subjects yet.'}
            </Typography>
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
              {user?.name?.charAt(0) || 'T'}
            </Avatar>
          </Grid>
        </Grid>
      </Card>

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={1} 
            sx={{ 
              p: 2, 
              borderRadius: 3,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              ':hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 20px -10px rgba(0,0,0,0.1)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight="medium">
                  Total Subjects
                </Typography>
                <Typography variant="h4" fontWeight="medium" sx={{ my: 1 }}>
                  {dashboardStats.totalSubjects}
                </Typography>
              </Box>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  color: theme.palette.primary.main,
                  width: 48,
                  height: 48,
                }}
              >
                <MenuBookIcon />
              </Avatar>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={1} 
            sx={{ 
              p: 2, 
              borderRadius: 3,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              ':hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 20px -10px rgba(0,0,0,0.1)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight="medium">
                  Total Students
                </Typography>
                <Typography variant="h4" fontWeight="medium" sx={{ my: 1 }}>
                  {dashboardStats.totalStudents}
                </Typography>
              </Box>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                  color: theme.palette.secondary.main,
                  width: 48,
                  height: 48,
                }}
              >
                <PeopleIcon />
              </Avatar>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={1} 
            sx={{ 
              p: 2, 
              borderRadius: 3,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              ':hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 20px -10px rgba(0,0,0,0.1)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight="medium">
                  Today's Attendance
                </Typography>
                <Typography variant="h4" fontWeight="medium" sx={{ my: 1 }}>
                  {dashboardStats.averageAttendance}%
                </Typography>
              </Box>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.success.main, 0.1), 
                  color: theme.palette.success.main,
                  width: 48,
                  height: 48,
                }}
              >
                <AssignmentIcon />
              </Avatar>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={1} 
            sx={{ 
              p: 2, 
              borderRadius: 3,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              ':hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 20px -10px rgba(0,0,0,0.1)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight="medium">
                  Today's Classes
                </Typography>
                <Typography variant="h4" fontWeight="medium" sx={{ my: 1 }}>
                  {subjects.length}
                </Typography>
              </Box>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.info.main, 0.1), 
                  color: theme.palette.info.main,
                  width: 48,
                  height: 48,
                }}
              >
                <EventNoteIcon />
              </Avatar>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Navigation */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
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
            },
          }}
        >
          <Tab 
            icon={<AssignmentIcon />} 
            label="Attendance" 
            value="attendance" 
            iconPosition="start"
          />
          <Tab 
            icon={<SchoolIcon />} 
            label="My Subjects" 
            value="subjects" 
            iconPosition="start" 
          />
          <Tab 
            icon={<PeopleIcon />} 
            label="Students" 
            value="students" 
            iconPosition="start" 
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 'attendance' && (
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2">
                Mark Attendance
              </Typography>
              <Chip 
                color="primary" 
                variant="outlined" 
                label={`${subjects.length} Subject${subjects.length > 1 ? 's' : ''} Available`} 
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Select a subject and date to mark attendance for your students.
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1, mb: 3 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="subject-select-label">Subject</InputLabel>
                  <Select
                    labelId="subject-select-label"
                    id="subject-select"
                    value={selectedSubject || ''}
                    onChange={(e) => {
                      console.log('Subject selected:', e.target.value);
                      setSelectedSubject(e.target.value);
                    }}
                    label="Subject"
                  >
                    {subjects.map((subject) => (
                      <MenuItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
            
            {loading && selectedSubject ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress color="primary" />
              </Box>
            ) : selectedSubject ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" component="h3">
                    Student List
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddStudentDialog}
                    size="small"
                  >
                    Add Student
                  </Button>
                </Box>
              
                {students.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No students found for this subject. Use the "Add Student" button to assign students to this subject.
                  </Alert>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" color="primary" fontWeight="medium">
                        {students.length} Student{students.length !== 1 ? 's' : ''} Found
                      </Typography>
                      
                      <Box>
                        <Button 
                          size="small" 
                          sx={{ mr: 1 }}
                          onClick={() => {
                            // Mark all present
                            setAttendanceData(prev => 
                              prev.map(item => ({ ...item, present: true }))
                            );
                          }}
                        >
                          Mark All Present
                        </Button>
                        <Button 
                          size="small"
                          onClick={() => {
                            // Mark all absent
                            setAttendanceData(prev => 
                              prev.map(item => ({ ...item, present: false }))
                            );
                          }}
                        >
                          Mark All Absent
                        </Button>
                      </Box>
                    </Box>
                    
                    <TableContainer component={Paper} elevation={0} sx={{ 
                      mt: 2,
                      maxHeight: '400px',
                      overflow: 'auto',
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider'
                    }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Roll No</TableCell>
                            <TableCell>Student Name</TableCell>
                            <TableCell>Class</TableCell>
                            <TableCell align="center">Present</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {students.map((student) => {
                            const attendance = attendanceData.find(a => a.student_id === (student.id || student._id));
                            return (
                              <TableRow 
                                key={student.id || student._id}
                                sx={{
                                  bgcolor: attendance?.present === false ? alpha('#f44336', 0.07) : 'inherit',
                                  '&:hover': {
                                    bgcolor: attendance?.present === false ? alpha('#f44336', 0.1) : alpha(theme.palette.primary.main, 0.07)
                                  }
                                }}
                              >
                                <TableCell>{student.roll_no || 'N/A'}</TableCell>
                                <TableCell sx={{ fontWeight: 'medium' }}>{student.name}</TableCell>
                                <TableCell>{student.class || 'N/A'}</TableCell>
                                <TableCell align="center">
                                  <Checkbox
                                    checked={attendance?.present || false}
                                    onChange={() => handleAttendanceChange(student.id || student._id)}
                                    color="primary"
                                    icon={<CircleOutlinedIcon />}
                                    checkedIcon={<CheckCircleIcon />}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleSubmitAttendance}
                        disabled={students.length === 0 || loading}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Attendance'}
                      </Button>
                    </Box>
                  </>
                )}
              </>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Please select a subject to view students.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'subjects' && (
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              My Teaching Subjects
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {subjects.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                You don't have any subjects assigned yet.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {subjects.map(subject => (
                  <Grid item xs={12} sm={6} md={4} key={subject.id}>
                    <Card 
                      elevation={2} 
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        ':hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 16px -10px rgba(0,0,0,0.2)',
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" fontWeight="medium">{subject.name}</Typography>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.8) }}>
                            {subject.name?.charAt(0) || 'S'}
                          </Avatar>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Typography color="text.secondary" gutterBottom>
                          Class: {subject.class || 'N/A'}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>
                          Schedule: {subject.day || 'N/A'} at {subject.time || 'N/A'}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip 
                            size="small" 
                            label={subject.day || 'Not scheduled'} 
                            color="primary" 
                            variant="outlined"
                          />
                          <Button 
                            size="small" 
                            variant="contained" 
                            onClick={() => {
                              setSelectedSubject(subject.id.toString());
                              setActiveTab('attendance');
                            }}
                          >
                            Mark Attendance
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'students' && (
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              My Students
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {subjects.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                You need to have subjects assigned to view students.
              </Alert>
            ) : selectedSubject ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                    <InputLabel id="student-subject-select-label">Select Subject</InputLabel>
                    <Select
                      labelId="student-subject-select-label"
                      value={selectedSubject || ''}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      label="Select Subject"
                    >
                      {subjects.map((subject) => (
                        <MenuItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddStudentDialog}
                    size="small"
                  >
                    Add Student
                  </Button>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : students.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No students found for this subject.
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    {students.map(student => (
                      <Grid item xs={12} sm={6} md={4} key={student.id || student._id}>
                        <Card 
                          elevation={1} 
                          sx={{ 
                            borderRadius: 2,
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            ':hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 8px 16px -10px rgba(0,0,0,0.2)',
                            }
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar 
                                sx={{ 
                                  mr: 2, 
                                  bgcolor: alpha(theme.palette.secondary.main, 0.8),
                                  width: 56,
                                  height: 56
                                }}
                              >
                                {getInitials(student.name)}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" fontWeight="medium">
                                  {student.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Roll No: {student.roll_no || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Class: {student.class || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Email: {student.email || 'N/A'}
                            </Typography>
                            
                            <Box sx={{ mt: 2 }}>
                              <Chip 
                                size="small" 
                                label={
                                  attendanceData.find(a => a.student_id === (student.id || student._id))?.present 
                                    ? 'Present Today' 
                                    : 'Absent Today'
                                } 
                                color={
                                  attendanceData.find(a => a.student_id === (student.id || student._id))?.present 
                                    ? 'success' 
                                    : 'error'
                                } 
                                variant="outlined"
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Please select a subject to view students.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Add Student Dialog */}
      <Dialog 
        open={openAddStudentDialog} 
        onClose={handleCloseAddStudentDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Add Student to Subject
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Select Existing Student
            </Typography>
            
            <TextField
              autoFocus
              margin="dense"
              label="Search Students"
              type="text"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              placeholder="Search by name, roll number, or email"
              sx={{ mb: 2 }}
            />
            
            <Paper 
              variant="outlined" 
              sx={{ 
                maxHeight: 300, 
                overflow: 'auto',
                mt: 2, 
                bgcolor: theme.palette.background.default 
              }}
            >
              <List>
                {availableStudents.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="No students available to add" 
                      secondary="All students are already assigned to this subject or no students match your search criteria."
                    />
                  </ListItem>
                ) : (
                  availableStudents.map((student) => (
                    <ListItemButton
                      key={student.id || student._id}
                      selected={selectedStudentId === (student.id || student._id)}
                      onClick={() => setSelectedStudentId(student.id || student._id)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.8) }}>
                          {getInitials(student.name)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={student.name}
                        secondary={
                          <>
                            {student.roll_no && <span>Roll No: {student.roll_no} | </span>}
                            {student.class && <span>Class: {student.class}</span>}
                          </>
                        }
                      />
                    </ListItemButton>
                  ))
                )}
              </List>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseAddStudentDialog}>Cancel</Button>
          <Button 
            onClick={handleAddStudent} 
            variant="contained" 
            color="primary"
            disabled={!selectedStudentId}
          >
            Add to Subject
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherDashboard; 