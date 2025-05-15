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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
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
  Switch,
  FormControlLabel,
  Badge,
} from '@mui/material';
import { 
  Add as AddIcon,
  Send as SendIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Announcement as AnnouncementIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  History as HistoryIcon,
  MailOutline as MailOutlineIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import axios from 'axios';

const CommunicationSystem = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('announcements');
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [openNewMessageDialog, setOpenNewMessageDialog] = useState(false);
  const [newMessage, setNewMessage] = useState({
    title: '',
    message: '',
    recipient_type: 'all',
    recipient_ids: [],
    send_email: true,
    send_sms: false,
    is_important: false,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch announcements and recipients when component mounts
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch announcements
        const announcementsResponse = await axios.get('/announce/announcements');
        if (announcementsResponse.data) {
          setAnnouncements(announcementsResponse.data);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load communication data. Please try again.');
        
        // Set mock data for development
        setAnnouncements([
          {
            id: 1,
            title: 'School Closure - Holiday',
            message: 'The school will remain closed on 25th December for Christmas.',
            sender: 'Principal',
            date: '2023-12-20T10:30:00',
            recipient_type: 'all',
            is_important: true,
            read_count: 250,
            total_recipients: 350
          },
          {
            id: 2,
            title: 'Parent-Teacher Meeting',
            message: 'Parent-teacher meeting is scheduled for 15th January. All parents are requested to attend.',
            sender: 'Admin',
            date: '2023-12-15T14:00:00',
            recipient_type: 'parents',
            is_important: false,
            read_count: 120,
            total_recipients: 200
          },
          {
            id: 3,
            title: 'Exam Schedule Update',
            message: 'The final exams have been postponed by one week. New schedule will be shared soon.',
            sender: 'Exam Coordinator',
            date: '2023-12-10T09:15:00',
            recipient_type: 'students',
            is_important: true,
            read_count: 300,
            total_recipients: 400
          }
        ]);
        
        setRecipients([
          { id: 'all', name: 'Everyone', type: 'group', count: 800 },
          { id: 'students', name: 'All Students', type: 'group', count: 500 },
          { id: 'teachers', name: 'All Teachers', type: 'group', count: 50 },
          { id: 'parents', name: 'All Parents', type: 'group', count: 450 },
          { id: 'class_10', name: '10th Grade', type: 'class', count: 60 },
          { id: 'class_11', name: '11th Grade', type: 'class', count: 55 },
          { id: 'class_12', name: '12th Grade', type: 'class', count: 50 }
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

  const handleNewMessageChange = (e) => {
    const { name, value, checked } = e.target;
    setNewMessage(prev => ({
      ...prev,
      [name]: name.includes('send_') || name === 'is_important' ? checked : value
    }));
  };

  const handleOpenNewMessageDialog = () => {
    setOpenNewMessageDialog(true);
  };

  const handleCloseNewMessageDialog = () => {
    setOpenNewMessageDialog(false);
  };

  const handleSendMessage = async () => {
    try {
      setLoading(true);
      // API call to send message
      // await axios.post('/announcements', newMessage);
      
      // For now, simulate with local update
      const mockNewAnnouncement = {
        id: announcements.length + 1,
        title: newMessage.title,
        message: newMessage.message,
        sender: 'Admin', // Would come from user context in real app
        date: new Date().toISOString(),
        recipient_type: newMessage.recipient_type,
        is_important: newMessage.is_important,
        read_count: 0,
        total_recipients: recipients.find(r => r.id === newMessage.recipient_type)?.count || 0
      };
      
      setAnnouncements(prev => [mockNewAnnouncement, ...prev]);
      
      // Reset form
      setNewMessage({
        title: '',
        message: '',
        recipient_type: 'all',
        recipient_ids: [],
        send_email: true,
        send_sms: false,
        is_important: false,
      });
      
      handleCloseNewMessageDialog();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = (announcementId) => {
    // In real implementation, this would make an API call
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render the announcements list
  const renderAnnouncementsList = () => (
    <List>
      {announcements.map((announcement) => (
        <Paper 
          key={announcement.id} 
          elevation={1} 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            border: announcement.is_important ? `1px solid ${theme.palette.error.main}` : 'none'
          }}
        >
          <ListItem
            secondaryAction={
              <IconButton 
                edge="end" 
                color="error"
                onClick={() => handleDeleteAnnouncement(announcement.id)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar 
                sx={{ 
                  bgcolor: announcement.is_important ? 'error.main' : 'primary.main'
                }}
              >
                {announcement.is_important ? <NotificationsIcon /> : <AnnouncementIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {announcement.title}
                  </Typography>
                  {announcement.is_important && (
                    <Chip 
                      label="Important" 
                      color="error" 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                </Box>
              }
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {announcement.message}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Sent by {announcement.sender} • {formatDate(announcement.date)}
                    </Typography>
                    <Chip 
                      label={`${announcement.read_count}/${announcement.total_recipients} read`} 
                      size="small" 
                      color={announcement.read_count === announcement.total_recipients ? 'success' : 'primary'}
                      variant="outlined"
                    />
                  </Box>
                </>
              }
            />
          </ListItem>
        </Paper>
      ))}
    </List>
  );

  // Render email templates tab
  const renderEmailTemplatesTab = () => (
    <Box sx={{ mt: 2 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Create and manage email templates for common communications.
      </Alert>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Template Gallery
              </Typography>
              <List sx={{ mt: 2 }}>
                <ListItem 
                  button
                  sx={{ 
                    borderRadius: 1,
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <MailOutlineIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Absence Notice"
                    secondary="Template for notifying parents about student absence"
                  />
                </ListItem>
                
                <ListItem 
                  button
                  sx={{ 
                    borderRadius: 1,
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <MailOutlineIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Exam Reminder"
                    secondary="Template for upcoming exam reminders"
                  />
                </ListItem>
                
                <ListItem 
                  button
                  sx={{ 
                    borderRadius: 1,
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      <MailOutlineIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Fee Payment Reminder"
                    secondary="Template for fee payment reminders"
                  />
                </ListItem>
              </List>
              
              <Button 
                fullWidth 
                variant="contained" 
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
              >
                Create New Template
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Template Editor
              </Typography>
              <Typography color="text.secondary" paragraph>
                Select a template from the gallery to edit, or create a new one.
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
                  No template selected
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Render analytics tab
  const renderAnalyticsTab = () => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Badge
              color="primary"
              badgeContent={<EmailIcon fontSize="small" />}
              sx={{ 
                '& .MuiBadge-badge': { 
                  p: 1,
                  minWidth: 25,
                  height: 25,
                  borderRadius: '50%'
                } 
              }}
            >
              <Typography variant="h4" color="primary" fontWeight="bold">
                {announcements.length}
              </Typography>
            </Badge>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Announcements Sent
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Badge
              color="secondary"
              badgeContent={<GroupIcon fontSize="small" />}
              sx={{ 
                '& .MuiBadge-badge': { 
                  p: 1,
                  minWidth: 25,
                  height: 25,
                  borderRadius: '50%'
                } 
              }}
            >
              <Typography variant="h4" color="secondary" fontWeight="bold">
                {recipients.find(r => r.id === 'all')?.count || 0}
              </Typography>
            </Badge>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Total Recipients
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Badge
              color="success"
              badgeContent={<CheckIcon fontSize="small" />}
              sx={{ 
                '& .MuiBadge-badge': { 
                  p: 1,
                  minWidth: 25,
                  height: 25,
                  borderRadius: '50%'
                } 
              }}
            >
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {Math.round(announcements.reduce((sum, a) => sum + (a.read_count / a.total_recipients * 100), 0) / (announcements.length || 1))}%
              </Typography>
            </Badge>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Average Read Rate
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Badge
              color="error"
              badgeContent={<NotificationsIcon fontSize="small" />}
              sx={{ 
                '& .MuiBadge-badge': { 
                  p: 1,
                  minWidth: 25,
                  height: 25,
                  borderRadius: '50%'
                } 
              }}
            >
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {announcements.filter(a => a.is_important).length}
              </Typography>
            </Badge>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Important Notices
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card sx={{ mt: 2, p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Communication Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              View detailed analytics of all communications, including read rates, response rates, and more.
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<PdfIcon />}
            >
              Generate Report
            </Button>
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
          Communication Center
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
          onClick={handleOpenNewMessageDialog}
        >
          Send New Message
        </Button>
      </Box>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Send announcements, notifications, and messages to students, teachers, and parents. Track communication history and analytics.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <EmailIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Email</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Send messages via email
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <SmsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">SMS</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Send text messages to mobile
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <NotificationsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Announcements</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Post announcements to portal
                  </Typography>
                </Box>
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
            icon={<AnnouncementIcon />}
            iconPosition="start"
            label="Announcements"
            value="announcements"
          />
          <Tab
            icon={<MailOutlineIcon />}
            iconPosition="start"
            label="Email Templates"
            value="templates"
          />
          <Tab
            icon={<HistoryIcon />}
            iconPosition="start"
            label="Analytics"
            value="analytics"
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
          {activeTab === 'announcements' && (
            <>
              {announcements.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No announcements have been sent yet. Click "Send New Message" to create your first announcement.
                </Alert>
              ) : (
                renderAnnouncementsList()
              )}
            </>
          )}
          
          {activeTab === 'templates' && renderEmailTemplatesTab()}
          
          {/* {activeTab === 'analytics' && renderAnalyticsTab()} */}
        </>
      )}
      
      {/* New Message Dialog */}
      <Dialog 
        open={openNewMessageDialog} 
        onClose={handleCloseNewMessageDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Send New Message</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                name="title"
                label="Message Title"
                value={newMessage.title}
                onChange={handleNewMessageChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="message"
                label="Message Content"
                value={newMessage.message}
                onChange={handleNewMessageChange}
                multiline
                rows={4}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Recipients</InputLabel>
                <Select
                  name="recipient_type"
                  label="Recipients"
                  value={newMessage.recipient_type}
                  onChange={handleNewMessageChange}
                >
                  {recipients.map(recipient => (
                    <MenuItem key={recipient.id} value={recipient.id}>
                      {recipient.name} ({recipient.count} recipients)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ mb: 2, mt: 1 }}>Delivery Options</Divider>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={newMessage.send_email}
                    onChange={handleNewMessageChange}
                    name="send_email"
                    color="primary"
                  />
                }
                label="Send as Email"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={newMessage.send_sms}
                    onChange={handleNewMessageChange}
                    name="send_sms"
                    color="secondary"
                  />
                }
                label="Send as SMS"
                sx={{ ml: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={newMessage.is_important}
                    onChange={handleNewMessageChange}
                    name="is_important"
                    color="error"
                  />
                }
                label="Mark as Important"
                sx={{ ml: 2 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseNewMessageDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={!newMessage.title || !newMessage.message}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommunicationSystem; 