import { useState, useEffect } from 'react';
import { useThemeMode } from '../context/ThemeContext';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControl,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  alpha,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  InputLabel,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import axios from 'axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [userType, setUserType] = useState('teacher');
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    password: '',
    subjects: []
  });
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    className: '',
    branch: '',
    section: '',
    subjects: []
  });
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  // Theme hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { isDarkMode } = useThemeMode();

  // Add state for teacher listing by subject
  const [subjectFilter, setSubjectFilter] = useState('');
  const [teachersBySubject, setTeachersBySubject] = useState([]);
  const [teacherListLoading, setTeacherListLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchSubjects();
  }, []);

  // Function to handle API errors
  const handleApiError = (err) => {
    console.error('API Error:', err);
    const errorMessage = err.response?.data?.message || 'An error occurred';
    setError(errorMessage);
    setSnackbar({
      open: true,
      message: errorMessage,
      severity: 'error'
    });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Use correct API endpoint
      const response = await axios.get('/auth/users');
      setUsers(response.data || []);
      setError(null);
    } catch (err) {
      handleApiError(err);
      // Use mock data if API fails for development
      
    } finally {
      setLoading(false);
    }
  };

  // Fetch available subjects
  const fetchSubjects = async () => {
    try {
      // For teacher creation
      const response = await axios.get('/subjects');
      setAvailableSubjects(response.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Use mock data if API fails for development
      setAvailableSubjects([
        { id: 1, name: 'Mathematics' },
        { id: 2, name: 'Physics' },
        { id: 3, name: 'Chemistry' },
        { id: 4, name: 'Biology' },
        { id: 5, name: 'English' },
        { id: 6, name: 'History' },
        { id: 7, name: 'Geography' },
      ]);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setLoading(true);
      // Use correct API endpoint
      const response = await axios.patch(`/auth/users/${userId}/role`, { role: newRole });
      console.log(response);
      
      // Update the local users state with the updated user
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      
      setSnackbar({
        open: true,
        message: 'User role updated successfully',
        severity: 'success'
      });
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getRoleColor = (role) => {
    // Return theme-appropriate colors for roles
    switch(role) {
      case 'admin':
        return 'error';
      case 'teacher':
        return 'success';
      case 'student':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Mobile card view for each user
  const renderMobileUserCard = (user) => (
    <Card 
      key={user._id} 
      sx={{ 
        mb: 2, 
        width: '100%',
        borderLeft: `4px solid ${theme.palette[getRoleColor(user.role)].main}`,
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Name</Typography>
            <Typography variant="body1" fontWeight="medium">{user.name}</Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Email</Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{user.email}</Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Current Role</Typography>
            <Chip 
              label={user.role} 
              color={getRoleColor(user.role)}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Change Role</Typography>
            <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
              <Select
                value={user.role}
                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                disabled={loading}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
                <MenuItem value="student">Student</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {user.subjects && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Subjects</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {user.subjects.map((subject, idx) => (
                  <Chip 
                    key={idx} 
                    label={subject} 
                    size="small" 
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Tooltip title="Delete User">
              <IconButton 
                color="error" 
                size="small"
                onClick={() => handleDeleteUser(user._id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Open dialog to add new teacher
  const handleOpenDialog = (type = 'teacher') => {
    setOpenDialog(true);
    setUserType(type);
    setFormErrors({});
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTeacher({
      name: '',
      email: '',
      password: '',
      subjects: []
    });
    setNewStudent({
      name: '',
      email: '',
      password: '',
      rollNumber: '',
      className: '',
      branch: '',
      section: '',
      subjects: []
    });
  };

  // Handle input change for new teacher form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeacher(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle subject selection change
  const handleSubjectChange = (e) => {
    const { value } = e.target;
    setNewTeacher(prev => ({
      ...prev,
      subjects: value
    }));
  };

  // Handle input change for student form
  const handleStudentInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle subject selection change for student
  const handleStudentSubjectChange = (e) => {
    const { value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      subjects: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors.subjects) {
      setFormErrors(prev => ({
        ...prev,
        subjects: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!newTeacher.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!newTeacher.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(newTeacher.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!newTeacher.password.trim()) {
      errors.password = 'Password is required';
    } else if (newTeacher.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (newTeacher.subjects.length === 0) {
      errors.subjects = 'At least one subject must be selected';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit new teacher
  const handleSubmitTeacher = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // Map the selected subject IDs to subject names for the API
      const selectedSubjectNames = newTeacher.subjects.map(
        subjectId => availableSubjects.find(s => s.id === subjectId)?.name || subjectId
      );
      
      // Prepare the data to send to the API
      const teacherData = {
        name: newTeacher.name,
        email: newTeacher.email,
        password: newTeacher.password,
        subjects: selectedSubjectNames
      };
      
      // Make the API call
      const response = await axios.post('/auth/users/teacher', teacherData);
      
      // Get the created teacher from the response
      const createdTeacher = response.data.teacher;
      
      // Update local state with new teacher
      setUsers(prev => [
        ...prev,
        {
          _id: createdTeacher.id,
          name: createdTeacher.name,
          email: createdTeacher.email,
          role: 'teacher',
          subjects: createdTeacher.subjects
        }
      ]);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Teacher created successfully!',
        severity: 'success'
      });
      
      // Close dialog
      handleCloseDialog();
      
    } catch (error) {
      console.error('Error creating teacher:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create teacher',
        severity: 'error'
      });
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId) => {
    try {
      // Use correct API endpoint
      await axios.delete(`/auth/users/${userId}`);
      
      // Update local state
      setUsers(prev => prev.filter(user => user._id !== userId));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'User deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete user',
        severity: 'error'
      });
    }
  };

  // Filter users based on active tab
  const filteredUsers = () => {
    switch (tabValue) {
      case 0: // All Users
        return users;
      case 1: // Teachers
        return users.filter(user => user.role === 'teacher');
      case 2: // Students
        return users.filter(user => user.role === 'student');
      case 3: // Admins
        return users.filter(user => user.role === 'admin');
      default:
        return users;
    }
  };

  // Table view for tablet and desktop
  const renderTableView = () => (
    <TableContainer 
      component={Paper} 
      sx={{ 
        mb: 3, 
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <Table size={isTablet ? "small" : "medium"}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell align="center">Role</TableCell>
            <TableCell>Subjects</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers().map((user) => (
            <TableRow 
              key={user._id}
              sx={{ 
                '&:hover': { 
                  bgcolor: alpha(theme.palette.primary.main, 0.04)
                },
                transition: 'background-color 0.2s ease'
              }}
            >
              <TableCell sx={{ fontWeight: 'medium' }}>{user.name}</TableCell>
              <TableCell sx={{ maxWidth: isTablet ? 100 : 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</TableCell>
              <TableCell align="center">
                <FormControl size="small" sx={{ minWidth: isTablet ? 100 : 120 }}>
                  <Select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    disabled={loading}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                    <MenuItem value="student">Student</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                {user.subjects ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {user.subjects.map((subject, index) => (
                      <Chip 
                        key={index}
                        label={subject}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Edit User">
                  <IconButton color="primary" size="small" sx={{ mr: 1 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete User">
                  <IconButton 
                    color="error" 
                    size="small"
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Validate student form
  const validateStudentForm = () => {
    const errors = {};
    
    if (!newStudent.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!newStudent.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(newStudent.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!newStudent.password.trim()) {
      errors.password = 'Password is required';
    } else if (newStudent.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!newStudent.rollNumber.trim()) {
      errors.rollNumber = 'Roll number is required';
    }
    
    if (!newStudent.branch.trim()) {
      errors.branch = 'Branch is required';
    }
    
    if (!newStudent.section.trim()) {
      errors.section = 'Section is required';
    }
    
    // Subjects are optional for students
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit new student
  const handleSubmitStudent = async () => {
    if (!validateStudentForm()) {
      return;
    }
    
    try {
      // Map the selected subject IDs to subject names for the API
      const selectedSubjectNames = newStudent.subjects.map(
        subjectId => availableSubjects.find(s => s.id === subjectId)?.name || subjectId
      );
      
      // Prepare the data to send to the API
      const studentData = {
        name: newStudent.name,
        email: newStudent.email,
        password: newStudent.password,
        rollNumber: newStudent.rollNumber,
        className: newStudent.className,
        branch: newStudent.branch,
        section: newStudent.section,
        subjects: selectedSubjectNames
      };
      
      // Make the API call
      const response = await axios.post('/auth/users/student', studentData);
      
      // Get the created student from the response
      const createdStudent = response.data.student;
      
      // Update local state with new student
      setUsers(prev => [
        ...prev,
        {
          _id: createdStudent.id,
          name: createdStudent.name,
          email: createdStudent.email,
          role: 'student',
          rollNumber: createdStudent.rollNumber,
          branch: createdStudent.branch,
          section: createdStudent.section,
          subjects: createdStudent.subjects || []
        }
      ]);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Student created successfully!',
        severity: 'success'
      });
      
      // Close dialog
      handleCloseDialog();
      
    } catch (error) {
      console.error('Error creating student:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create student',
        severity: 'error'
      });
    }
  };

  // Fetch teachers by subject
  const fetchTeachersBySubject = async (subjectName) => {
    if (!subjectName) return;
    
    try {
      setTeacherListLoading(true);
      const response = await axios.get(`/subjects/${subjectName}/teachers`);
      setTeachersBySubject(response.data || []);
    } catch (error) {
      console.error('Error fetching teachers by subject:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load teachers for this subject',
        severity: 'error'
      });
      setTeachersBySubject([]);
    } finally {
      setTeacherListLoading(false);
    }
  };

  // Handle subject filter change
  const handleSubjectFilterChange = (e) => {
    const subject = e.target.value;
    setSubjectFilter(subject);
    if (subject) {
      fetchTeachersBySubject(subject);
    } else {
      setTeachersBySubject([]);
    }
  };

  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error && users.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="outlined" 
          sx={{ mt: 2 }} 
          onClick={fetchUsers}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: isMobile ? 4 : 2 }}>
      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 4, 
          borderRadius: 2,
          borderTop: `4px solid ${theme.palette.primary.main}`,
        }}
        elevation={2}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 'medium' }}>
            Manage Users
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('teacher')}
          >
            Add Teacher
          </Button>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="All Users" />
            <Tab label="Teachers" />
            <Tab label="Students" />
            <Tab label="Admins" />
          </Tabs>
        </Box>
      </Paper>
      
      {users.length === 0 ? (
        <Alert severity="info">No users found in the system.</Alert>
      ) : (
        <>
          {/* Mobile view */}
          {isMobile && (
            <Stack spacing={2}>
              {filteredUsers().map(user => renderMobileUserCard(user))}
            </Stack>
          )}
          
          {/* Tablet and desktop view */}
          {!isMobile && renderTableView()}
        </>
      )}
      
      {/* Teachers by Subject Section */}
      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mt: 4, 
          mb: 4, 
          borderRadius: 2,
          borderTop: `4px solid ${theme.palette.secondary.main}`,
        }}
        elevation={2}
      >
        <Typography variant="h5" color="secondary" sx={{ fontWeight: 'medium', mb: 3 }}>
          Teachers by Subject
        </Typography>
        
        <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
          <InputLabel id="subject-filter-label">Filter by Subject</InputLabel>
          <Select
            labelId="subject-filter-label"
            id="subject-filter"
            value={subjectFilter}
            onChange={handleSubjectFilterChange}
            label="Filter by Subject"
          >
            <MenuItem value="">
              <em>All Subjects</em>
            </MenuItem>
            {availableSubjects.map((subject) => (
              <MenuItem key={subject.id} value={subject.name}>
                {subject.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {teacherListLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : teachersBySubject.length > 0 ? (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Subjects</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachersBySubject.map((teacher) => (
                  <TableRow 
                    key={teacher.id}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: alpha(theme.palette.secondary.main, 0.04)
                      },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'medium' }}>{teacher.name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>
                      {teacher.subjects ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {teacher.subjects.map((subject, index) => (
                            <Chip 
                              key={index}
                              label={subject}
                              size="small"
                              variant="outlined"
                              color="secondary"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : subjectFilter ? (
          <Alert severity="info">No teachers found for {subjectFilter}</Alert>
        ) : (
          <Alert severity="info">Select a subject to view teachers</Alert>
        )}
      </Paper>
      
      {/* Dialog for adding new user */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New {userType === 'teacher' ? 'Teacher' : 'Student'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Fill in the details to create a new {userType === 'teacher' ? 'teacher' : 'student'} account.
          </DialogContentText>
          
          {/* User type selector */}
          <Box sx={{ mb: 3, mt: 1 }}>
            <FormControl component="fieldset">
              <RadioGroup
                row
                name="user-type"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <FormControlLabel value="teacher" control={<Radio />} label="Teacher" />
                <FormControlLabel value="student" control={<Radio />} label="Student" />
              </RadioGroup>
            </FormControl>
          </Box>
          
          {userType === 'teacher' ? (
            /* Teacher form fields */
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  name="name"
                  label="Full Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newTeacher.name}
                  onChange={handleInputChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={newTeacher.email}
                  onChange={handleInputChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={newTeacher.password}
                  onChange={handleInputChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.subjects}>
                  <InputLabel id="subjects-label">Assigned Subjects</InputLabel>
                  <Select
                    labelId="subjects-label"
                    id="subjects"
                    multiple
                    value={newTeacher.subjects}
                    onChange={handleSubjectChange}
                    label="Assigned Subjects"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((subjectId) => {
                          const subject = availableSubjects.find(s => s.id === subjectId);
                          return (
                            <Chip 
                              key={subjectId} 
                              label={subject ? subject.name : subjectId} 
                              size="small" 
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {availableSubjects.map((subject) => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.subjects && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {formErrors.subjects}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          ) : (
            /* Student form fields */
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  name="name"
                  label="Full Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newStudent.name}
                  onChange={handleStudentInputChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  id="rollNumber"
                  name="rollNumber"
                  label="Roll Number"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newStudent.rollNumber}
                  onChange={handleStudentInputChange}
                  error={!!formErrors.rollNumber}
                  helperText={formErrors.rollNumber}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={newStudent.email}
                  onChange={handleStudentInputChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={newStudent.password}
                  onChange={handleStudentInputChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  margin="dense"
                  id="className"
                  name="className"
                  label="Class Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newStudent.className}
                  onChange={handleStudentInputChange}
                  error={!!formErrors.className}
                  helperText={formErrors.className}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  margin="dense"
                  id="branch"
                  name="branch"
                  label="Branch"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newStudent.branch}
                  onChange={handleStudentInputChange}
                  error={!!formErrors.branch}
                  helperText={formErrors.branch}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  margin="dense"
                  id="section"
                  name="section"
                  label="Section"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newStudent.section}
                  onChange={handleStudentInputChange}
                  error={!!formErrors.section}
                  helperText={formErrors.section}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="student-subjects-label">Assigned Subjects (Optional)</InputLabel>
                  <Select
                    labelId="student-subjects-label"
                    id="student-subjects"
                    multiple
                    value={newStudent.subjects}
                    onChange={handleStudentSubjectChange}
                    label="Assigned Subjects (Optional)"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((subjectId) => {
                          const subject = availableSubjects.find(s => s.id === subjectId);
                          return (
                            <Chip 
                              key={subjectId} 
                              label={subject ? subject.name : subjectId} 
                              size="small" 
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {availableSubjects.map((subject) => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={userType === 'teacher' ? handleSubmitTeacher : handleSubmitStudent} 
            variant="contained" 
            startIcon={<SaveIcon />}
          >
            Create {userType === 'teacher' ? 'Teacher' : 'Student'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} elevation={6}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageUsers; 