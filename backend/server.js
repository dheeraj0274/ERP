import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js'
import testProtected from './routes/testProtected.js'
import attendance from './routes/attendance.js'
import studentRoutes from './routes/studentRoutes.js'
import classRoutes from './routes/classRoutes.js'
import attendpercentage from './routes/studentAttendance.js'
import subjectsRoutes from './routes/subjects.js'
import announcement from './routes/announcement.js'

dotenv.config();
const Port = process.env.PORT

const app = express();
app.use(cors());
app.use(express.json())

app.get("/", (req, res) => {
    res.send(" College ERP Attendance API Running - Jai Shree Ram 🚩");
  });

  //DB
  mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
  }).then(()=>{
    console.log("MongoDB Connected");
    
  }).catch(err=>{
    console.error(" DB Error:", err);
    
  })

  app.use('/api/auth', authRoutes);
  app.use('/api/test', testProtected)
  app.use('/api/attendance', attendance)
  app.use('/api/students', studentRoutes)
  app.use('/api/classes' ,  classRoutes)
  app.use('/api/subjects', subjectsRoutes)
  app.use('/api', attendpercentage)
  app.use('/api/announce', announcement)



  
app.listen(Port,()=>{
    console.log(`Server is running on the port ${Port}`);
    
});