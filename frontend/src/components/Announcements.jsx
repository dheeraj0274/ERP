import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get('/announce/announcements'); // Adjust the endpoint as necessary
        setAnnouncements(response.data);
        console.log(response.data);
        
      } catch (err) {
        setError('Failed to load announcements.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Card sx={{ mb: 4, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Announcements
      </Typography>
      <List>
        {announcements.map((announcement) => (
          <ListItem key={announcement.id}>
            <ListItemText primary={announcement.title} secondary={announcement.message} />
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

export default Announcements;
