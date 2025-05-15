import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  userType: { type: String, enum: ['student', 'teacher', 'both'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;