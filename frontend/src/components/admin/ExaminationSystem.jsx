import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Alert,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  alpha,
  Tooltip,
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
  Schedule as ScheduleIcon,
  PictureAsPdf as PdfIcon,
  ContentCopy as DuplicateIcon,
  Check as CheckIcon,
  Assignment as AssignmentIcon,
  Class as ClassIcon,
  LibraryBooks as SubjectIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/lab';
import { useTheme } from '@mui/material';
import axios from 'axios';

const ExaminationSystem = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('exams');
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [openNewExamDialog, setOpenNewExamDialog] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    class_id: '',
    subject_id: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    duration: 60,
    total_marks: 100,
    passing_marks: 35,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch exams, classes and subjects when component mounts
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch exams
        const examsResponse = await axios.get('/exams');
        if (examsResponse.data) {
          setExams(examsResponse.data);
        }

        // Fetch classes
        const classesResponse = await axios.get('/classes');
        if (classesResponse.data) {
          setClasses(classesResponse.data);
        }

        // Fetch subjects
        const subjectsResponse = await axios.get('/subjects');
        if (subjectsResponse.data) {
          setSubjects(subjectsResponse.data);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        // Set mock data for development
        setExams([
          {
            id: 1,
            title: 'Mid-Term Mathematics',
            class: '10th Grade',
            subject: 'Mathematics',
            date: '2023-11-15',
            start_time: '09:00',
            duration: 60,
            total_marks: 100,
            passing_marks: 35,
            status: 'scheduled'
          },
          {
            id: 2,
            title: 'Final Science Exam',
            class: '9th Grade',
            subject: 'Science',
            date: '2023-12-10',
            start_time: '10:30',
            duration: 90,
            total_marks: 100,
            passing_marks: 40,
            status: 'scheduled'
          },
          {
            id: 3,
            title: 'History Quiz',
            class: '11th Grade',
            subject: 'History',
            date: '2023-10-25',
            start_time: '14:00',
            duration: 45,
            total_marks: 50,
            passing_marks: 20,
            status: 'completed'
          }
        ]);
        
        setClasses([
          { id: 1, name: '9th Grade' },
          { id: 2, name: '10th Grade' },
          { id: 3, name: '11th Grade' },
          { id: 4, name: '12th Grade' }
        ]);
        
        setSubjects([
          { id: 1, name: 'Mathematics' },
          { id: 2, name: 'Science' },
          { id: 3, name: 'History' },
          { id: 4, name: 'English' },
          { id: 5, name: 'Physics' },
          { id: 6, name: 'Chemistry' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleNewExamChange = (e) => {
    const { name, value } = e.target;
    setNewExam(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenNewExamDialog = () => {
    setOpenNewExamDialog(true);
  };

  const handleCloseNewExamDialog = () => {
    setOpenNewExamDialog(false);
  };

  const handleCreateExam = async () => {
    try {
      setLoading(true);
      // API call to create new exam
      // await axios.post('/exams', newExam);
      
      // For now, simulate with local update
      const mockNewExam = {
        id: exams.length + 1,
        title: newExam.title,
        class: classes.find(c => c.id.toString() === newExam.class_id.toString())?.name || 'Unknown',
        subject: subjects.find(s => s.id.toString() === newExam.subject_id.toString())?.name || 'Unknown',
        date: newExam.date,
        start_time: newExam.start_time,
        duration: newExam.duration,
        total_marks: newExam.total_marks,
        passing_marks: newExam.passing_marks,
        status: 'scheduled'
      };
      
      setExams(prev => [...prev, mockNewExam]);
      
      // Reset form
      setNewExam({
        title: '',
        class_id: '',
        subject_id: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        duration: 60,
        total_marks: 100,
        passing_marks: 35,
      });
      
      handleCloseNewExamDialog();
    } catch (err) {
      console.error('Error creating exam:', err);
      setError('Failed to create exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = (examId) => {
    // In real implementation, this would make an API call
    setExams(prev => prev.filter(exam => exam.id !== examId));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled':
        return 'primary';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Render the examinations table
  const renderExamsTable = () => (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
          <TableRow>
            <TableCell>Exam Title</TableCell>
            <TableCell>Class</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Marks</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell>{exam.title}</TableCell>
              <TableCell>{exam.class}</TableCell>
              <TableCell>{exam.subject}</TableCell>
              <TableCell>{new Date(exam.date).toLocaleDateString()}</TableCell>
              <TableCell>{exam.start_time}</TableCell>
              <TableCell>{exam.duration} min</TableCell>
              <TableCell>{exam.total_marks} ({exam.passing_marks})</TableCell>
              <TableCell>
                <Chip 
                  label={exam.status.charAt(0).toUpperCase() + exam.status.slice(1)} 
                  color={getStatusColor(exam.status)} 
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Tooltip title="Edit">
                  <IconButton size="small" color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteExam(exam.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Duplicate">
                  <IconButton size="small" color="secondary">
                    <DuplicateIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render results and grading options
  const renderResultsTab = () => (
    <Box sx={{ mt: 2 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Select an exam to view and manage results, or upload new results.
      </Alert>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Exam
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Class</InputLabel>
                <Select
                  label="Class"
                  value=""
                  onChange={() => {}}
                >
                  {classes.map(cls => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Exam</InputLabel>
                <Select
                  label="Exam"
                  value=""
                  onChange={() => {}}
                >
                  {exams.map(exam => (
                    <MenuItem key={exam.id} value={exam.id}>
                      {exam.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 3 }}
                startIcon={<AssignmentIcon />}
              >
                View Results
              </Button>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Result Actions
              </Typography>
              
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<PdfIcon />}
                sx={{ mt: 1 }}
              >
                Generate Marksheets
              </Button>
              
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 1 }}
              >
                Upload Results
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Results Preview
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4 }}>
                Select an exam to view results.
              </Typography>
              
              <Box 
                sx={{ 
                  height: 300, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 1
                }}
              >
                <Typography color="text.secondary">
                  No results to display
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Main render
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" fontWeight="medium">
          Examination Management
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenNewExamDialog}
        >
          Create New Exam
        </Button>
      </Box>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Manage examinations, schedule tests, and track student performance. Create and distribute exam schedules, manage grades, and generate performance reports.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {exams.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Exams
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="secondary">
                  {exams.filter(e => e.status === 'scheduled').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upcoming Exams
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {exams.filter(e => e.status === 'completed').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Exams
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {exams.filter(e => e.status === 'cancelled').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Canceled Exams
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
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
            icon={<CalendarIcon />}
            iconPosition="start"
            label="Exams"
            value="exams"
          />
          <Tab
            icon={<AssignmentIcon />}
            iconPosition="start"
            label="Results & Grading"
            value="results"
          />
        </Tabs>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          {activeTab === 'exams' && (
            <>
              {exams.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No exams have been scheduled yet. Click "Create New Exam" to schedule your first exam.
                </Alert>
              ) : (
                renderExamsTable()
              )}
            </>
          )}
          
          {activeTab === 'results' && renderResultsTab()}
        </>
      )}
      
      {/* New Exam Dialog */}
      <Dialog 
        open={openNewExamDialog} 
        onClose={handleCloseNewExamDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Examination</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                name="title"
                label="Exam Title"
                value={newExam.title}
                onChange={handleNewExamChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Class</InputLabel>
                <Select
                  name="class_id"
                  label="Class"
                  value={newExam.class_id}
                  onChange={handleNewExamChange}
                >
                  {classes.map(cls => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Subject</InputLabel>
                <Select
                  name="subject_id"
                  label="Subject"
                  value={newExam.subject_id}
                  onChange={handleNewExamChange}
                >
                  {subjects.map(subject => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="date"
                label="Exam Date"
                type="date"
                value={newExam.date}
                onChange={handleNewExamChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="start_time"
                label="Start Time"
                type="time"
                value={newExam.start_time}
                onChange={handleNewExamChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                name="duration"
                label="Duration (minutes)"
                type="number"
                value={newExam.duration}
                onChange={handleNewExamChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                name="total_marks"
                label="Total Marks"
                type="number"
                value={newExam.total_marks}
                onChange={handleNewExamChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                name="passing_marks"
                label="Passing Marks"
                type="number"
                value={newExam.passing_marks}
                onChange={handleNewExamChange}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseNewExamDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleCreateExam}
            disabled={!newExam.title || !newExam.class_id || !newExam.subject_id}
          >
            Create Exam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExaminationSystem; 