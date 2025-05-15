// backend/routes/announcements.js
import express from 'express';
import Announcement from '../models/Announcement.js'; // Adjust the path as necessary

const router = express.Router();

// Create a new announcement
router.post('/', async (req, res) => {
  const { title, message, userType } = req.body;

  try {
    const newAnnouncement = new Announcement({ title, message, userType });
    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create announcement.' });
  }
});

// Fetch announcements based on user type
router.get('/announcements', async (req, res) => {
 

  try {
    const announcements = await Announcement.find();
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load announcements.' });
  }
});

export default router;