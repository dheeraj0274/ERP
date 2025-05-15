import mongoose from "mongoose";
import Attendance from '../models/Attendance.js';
import User from '../models/User.js'
import express from "express";
import { VerifyToken , allowRoles} from "../middleware/authMiddleware.js";



const router = express.Router();
 
// Mark attendance for a single student
router.post('/mark', VerifyToken, allowRoles("teacher"), async (req, res) => {
    const {subject, studentId, date, status} = req.body;
    try {
        // Get the subject name if it's an ID
        let subjectName = subject;
        if (!isNaN(parseInt(subject))) {
            const teacher = await User.findById(req.user.userId);
            if (!teacher || !teacher.subjects) {
                return res.status(404).json({ message: 'Teacher or subjects not found' });
            }
            
            const subjectIndex = parseInt(subject) - 1;
            if (isNaN(subjectIndex) || subjectIndex < 0 || subjectIndex >= teacher.subjects.length) {
                return res.status(404).json({ message: 'Subject not found' });
            }
            
            subjectName = teacher.subjects[subjectIndex];
        }
        
        const exist = await Attendance.findOne({student: studentId, date: date});
        if(exist) return res.status(400).json({message: 'Already Marked!'});
        const record = new Attendance({
            student: studentId,
            subject: subjectName,
            date,
            status,
            markedBy: req.user.userId,
        });
        await record.save();
        res.status(200).json({message: 'Attendance marked'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

// Mark attendance for multiple students at once
router.post('/mark-bulk', VerifyToken, allowRoles("teacher"), async (req, res) => {
    const {subject_id, date, attendance} = req.body;
    
    if (!subject_id || !date || !attendance || !Array.isArray(attendance)) {
        return res.status(400).json({message: 'Invalid request data'});
    }
    
    try {
        // Get the subject name from the ID
        const teacher = await User.findById(req.user.userId);
        if (!teacher || !teacher.subjects) {
            return res.status(404).json({ message: 'Teacher or subjects not found' });
        }
        
        const subjectIndex = parseInt(subject_id) - 1;
        if (isNaN(subjectIndex) || subjectIndex < 0 || subjectIndex >= teacher.subjects.length) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        // Get subject name
        const subjectName = teacher.subjects[subjectIndex];
        
        // Validate the date format
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return res.status(400).json({message: 'Invalid date format'});
        }
        
        // Create an array to track successful and failed entries
        const results = {
            success: [],
            errors: []
        };
        
        // Process each attendance record
        for (const record of attendance) {
            const {student_id, present} = record;
            
            if (!student_id) {
                results.errors.push({student_id, message: 'Invalid student ID'});
                continue;
            }
            
            try {
                // Check if attendance already marked for this student on this date
                const exists = await Attendance.findOne({
                    student: student_id,
                    date: dateObj,
                    subject: subjectName
                });
                
                if (exists) {
                    // Update existing record
                    exists.status = present ? 'Present' : 'Absent';
                    await exists.save();
                    results.success.push({student_id, message: 'Attendance updated'});
                } else {
                    // Create new attendance record
                    const newRecord = new Attendance({
                        student: student_id,
                        subject: subjectName,
                        date: dateObj,
                        status: present ? 'Present' : 'Absent',
                        markedBy: req.user.userId
                    });
                    await newRecord.save();
                    results.success.push({student_id, message: 'Attendance marked'});
                }
            } catch (err) {
                results.errors.push({student_id, message: err.message});
            }
        }
        
        // Return appropriate response based on results
        if (results.errors.length === 0) {
            res.status(200).json({
                message: 'All attendance records processed successfully',
                results
            });
        } else if (results.success.length === 0) {
            res.status(500).json({
                message: 'Failed to process any attendance records',
                results
            });
        } else {
            res.status(207).json({
                message: 'Some attendance records were processed',
                results
            });
        }
    } catch (error) {
        console.error('Error marking bulk attendance:', error);
        res.status(500).json({message: error.message});
    }
});

//Attendance by admin or student 
router.get('/student/:id', VerifyToken, allowRoles("admin", "student"), async (req, res) => {
    const studentId = req.params.id;
    try {
        const records = await Attendance.find({student: studentId}).populate("student", "name email");
        res.json(records);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

//all attendance by admin
router.get('/all', VerifyToken, allowRoles('admin'), async (req, res) => {
    try {
        const all = await Attendance.find().populate("student", "name").populate("markedBy", "name");
        res.status(200).json(all);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// Get attendance statistics for a student (for dashboard)
router.get('/my', VerifyToken, allowRoles("student"), async (req, res) => {
    try {
        const studentId = req.user.userId;
        
        // Count total attendance records
        const totalRecords = await Attendance.countDocuments({student: studentId});
        
        // Count present records
        const presentRecords = await Attendance.countDocuments({
            student: studentId,
            status: 'present'
        });
        
        // Calculate attendance percentage
        const attendancePercentage = totalRecords > 0 
            ? Math.round((presentRecords / totalRecords) * 100) 
            : 0;
        
        // Get trend (simplified for now)
        const trend = attendancePercentage > 80 
            ? '+2% from last week' 
            : '-3% from last week';
        
        res.status(200).json({
            attendance: attendancePercentage,
            trend: trend,
            totalClasses: totalRecords,
            present: presentRecords,
            absent: totalRecords - presentRecords
        });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// Check if attendance has been marked for a subject on a specific date
router.get('/check/:subjectId/:date', VerifyToken, allowRoles("teacher"), async (req, res) => {
    const { subjectId, date } = req.params;
    
    try {
        // First, get the subject name from ID (which is just an index)
        const teacher = await User.findById(req.user.userId);
        if (!teacher || !teacher.subjects) {
            return res.status(404).json({ message: 'Teacher or subjects not found' });
        }
        
        const subjectIndex = parseInt(subjectId) - 1;
        if (isNaN(subjectIndex) || subjectIndex < 0 || subjectIndex >= teacher.subjects.length) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        // Get subject name
        const subjectName = teacher.subjects[subjectIndex];
        
        // Format date to match the database format
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }
        
        // Find attendance records for this subject on this date
        const records = await Attendance.find({
            subject: subjectName,
            date: {
                $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
                $lt: new Date(dateObj.setHours(23, 59, 59, 999))
            },
            markedBy: req.user.userId
        }).populate('student', 'name');
        
        // Return records if found
        if (records && records.length > 0) {
            return res.status(200).json({
                message: 'Attendance has already been marked for this subject on this date',
                records
            });
        }
        
        // If no records found
        return res.status(200).json({
            message: 'No attendance records found for this subject on this date',
            records: []
        });
    } catch (error) {
        console.error('Error checking attendance:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;






