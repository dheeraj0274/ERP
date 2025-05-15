import express from 'express';
import { VerifyToken, allowRoles } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Classes from '../models/class.js';
import Student from '../models/student.js';

const router = express.Router();

// Get subjects taught by a teacher
router.get('/teacher', VerifyToken, allowRoles('teacher'), async (req, res) => {
    try {
        const teacherId = req.user.userId;
        console.log(`Fetching subjects for teacher: ${teacherId}`);
        
        // First, get the teacher's assigned subjects from user model
        const teacher = await User.findById(teacherId);
        if (!teacher) {
            console.log('Teacher not found');
            return res.status(404).json({ message: 'Teacher not found' });
        }
        
        console.log(`Found teacher: ${teacher.name}, Subjects:`, teacher.subjects || []);
        
        if (teacher.subjects && teacher.subjects.length > 0) {
            // Return subjects directly from user model if available
            const subjectsArray = teacher.subjects.map((subject, index) => ({
                id: index + 1, // Generate a simple ID
                name: subject
            }));
            
            console.log('Returning subjects from teacher model:', subjectsArray);
            return res.status(200).json(subjectsArray);
        }
        
        // If no subjects in user model, check classes where this teacher is assigned
        const classes = await Classes.find({ classTeacher: teacherId });
        console.log(`Found ${classes.length} classes with this teacher as class teacher`);
        
        // Extract all subjects from these classes
        const subjectsSet = new Set();
        classes.forEach(cls => {
            if (cls.subjects && cls.subjects.length > 0) {
                cls.subjects.forEach(subject => subjectsSet.add(subject));
            }
        });
        
        // Convert to array with IDs for frontend
        const subjectsArray = Array.from(subjectsSet).map((subject, index) => ({
            id: index + 1,
            name: subject
        }));
        
        if (subjectsArray.length === 0) {
            // If no subjects found, add some default subjects for testing
            console.log('No subjects found for teacher, adding default subjects for testing');
            const defaultSubjects = [
                { id: 1, name: 'Mathematics' },
                { id: 2, name: 'Physics' },
                { id: 3, name: 'Chemistry' }
            ];
            
            // Also update the teacher record with these subjects
            teacher.subjects = defaultSubjects.map(s => s.name);
            await teacher.save();
            
            return res.status(200).json(defaultSubjects);
        }
        
        console.log('Returning subjects from classes:', subjectsArray);
        res.status(200).json(subjectsArray);
    } catch (error) {
        console.error('Error fetching teacher subjects:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get students by subject
router.get('/:subjectId/students', VerifyToken, allowRoles('teacher', 'admin'), async (req, res) => {
    const subjectId = req.params.subjectId;
    
    try {
        // Log for debugging
        console.log(`Getting students for subject ID: ${subjectId}`);
        
        // First, get the subject name
        const teacher = await User.findById(req.user.userId);
        console.log(`Teacher ID: ${req.user.userId}, Found teacher:`, teacher ? 'Yes' : 'No');
        
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        
        // Check if teacher has subjects
        if (!teacher.subjects || teacher.subjects.length === 0) {
            console.log('Teacher has no subjects assigned');
            // Get all students as fallback when teacher has no subjects
            const fallbackStudents = await Student.find().populate('user', 'name email');
            
            const formattedStudents = fallbackStudents.map(student => ({
                id: student.user._id,
                name: student.user.name,
                roll_no: student.rollNumber,
                email: student.user.email,
                class: `${student.branch || 'Unknown'} - ${student.section || 'Unknown'}`
            }));
            
            return res.status(200).json(formattedStudents);
        }
        
        console.log(`Teacher has ${teacher.subjects.length} subjects:`, teacher.subjects);
        
        // Find the subject name from the ID (which is just an index)
        const subjectIndex = parseInt(subjectId) - 1;
        if (isNaN(subjectIndex) || subjectIndex < 0 || subjectIndex >= teacher.subjects.length) {
            console.log(`Invalid subject index: ${subjectIndex} (from ID: ${subjectId})`);
            
            // If invalid index, use the first subject if available
            if (teacher.subjects.length > 0) {
                console.log(`Using first subject as fallback: ${teacher.subjects[0]}`);
                // Keep going with the first subject
            } else {
                return res.status(404).json({ message: 'Subject not found' });
            }
        }
        
        // Use the correct subject based on the index or fallback to first subject
        const subjectName = teacher.subjects[subjectIndex >= 0 && subjectIndex < teacher.subjects.length 
            ? subjectIndex 
            : 0];
        
        console.log(`Looking for students with subject: ${subjectName}`);
        
        let allStudents = [];
        
        // First try to find students that have the subject in their subjects array
        try {
            const studentsWithSubject = await Student.find({
                subjects: subjectName
            }).populate('user', 'name email');
            
            console.log(`Found ${studentsWithSubject.length} students with subject '${subjectName}' in their subjects array`);
            
            if (studentsWithSubject.length > 0) {
                allStudents = [...studentsWithSubject];
            }
        } catch (err) {
            console.error('Error finding students by subject array:', err);
        }
        
        // If no students found with direct subject match, try class matching
        if (allStudents.length === 0) {
            console.log('No students found with direct subject match, trying class matching');
            
            // Find classes that have this subject
            const classes = await Classes.find({ subjects: subjectName });
            console.log(`Found ${classes.length} classes with subject '${subjectName}'`);
            
            if (classes && classes.length > 0) {
                // Get branch & section combinations from these classes
                const classInfo = classes.map(cls => ({
                    branch: cls.branch,
                    section: cls.section
                }));
                
                console.log('Looking for students in these classes:', classInfo);
                
                // Find students in these classes
                const classStudents = await Student.find({
                    $or: classInfo.map(info => ({
                        branch: info.branch,
                        section: info.section
                    }))
                }).populate('user', 'name email');
                
                console.log(`Found ${classStudents.length} students in classes with this subject`);
                
                // Merge with any students found by direct subject match
                for (const student of classStudents) {
                    if (!allStudents.some(s => s._id.toString() === student._id.toString())) {
                        allStudents.push(student);
                    }
                }
            }
        }
        
        // Fallback: If still no students found, try to fetch some data for testing
        if (allStudents.length === 0) {
            console.log('No students found. Fetching all students for testing...');
            
            // First, try querying by teacher's subject from our specialized endpoint
            try {
                // Try to use the subjectstudents endpoint as a source of students
                // This is a temporary indirect approach for testing
                const teacherId = req.user.userId;
                const allStudentsResponse = await Student.find().populate('user', 'name email');
                allStudents = allStudentsResponse || [];
                console.log(`Fallback: Found ${allStudents.length} total students in system`);
            } catch (subjectErr) {
                console.error('Error using fallback student fetch:', subjectErr);
            }
        }
        
        // Format students for frontend
        const formattedStudents = allStudents.map(student => ({
            id: student.user?._id || student._id,
            name: student.user?.name || student.name || 'Unknown',
            roll_no: student.rollNumber || 'N/A',
            email: student.user?.email || student.email || 'N/A',
            class: `${student.branch || 'Unknown'} - ${student.section || 'Unknown'}`
        }));
        
        res.status(200).json(formattedStudents);
    } catch (error) {
        console.error('Error fetching students by subject:', error);
        res.status(500).json({ 
            message: 'Error fetching students by subject', 
            error: error.message,
            stack: error.stack
        });
    }
});

// Get teachers by subject
router.get('/:subjectName/teachers', VerifyToken, allowRoles('admin', 'student', 'teacher'), async (req, res) => {
    const subjectName = req.params.subjectName;
    
    try {
        // Find teachers who have this subject
        const teachers = await User.find({
            role: 'teacher',
            subjects: subjectName
        }).select('-password');
        
        if (!teachers || teachers.length === 0) {
            return res.status(200).json([]);
        }
        
        // Format for frontend
        const formattedTeachers = teachers.map(teacher => ({
            id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            subjects: teacher.subjects
        }));
        
        res.status(200).json(formattedTeachers);
    } catch (error) {
        console.error('Error fetching teachers by subject:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all subjects
router.get('/', VerifyToken, allowRoles('admin'), async (req, res) => {
    try {
        // Get unique subjects from all classes
        const classes = await Classes.find();
        
        // Extract all subjects from these classes
        const subjectsSet = new Set();
        classes.forEach(cls => {
            if (cls.subjects && cls.subjects.length > 0) {
                cls.subjects.forEach(subject => subjectsSet.add(subject));
            }
        });
        
        // Also add subjects from teachers
        const teachers = await User.find({ role: 'teacher' });
        teachers.forEach(teacher => {
            if (teacher.subjects && teacher.subjects.length > 0) {
                teacher.subjects.forEach(subject => subjectsSet.add(subject));
            }
        });
        
        // Convert to array with IDs for frontend
        const subjectsArray = Array.from(subjectsSet).map((subject, index) => ({
            id: index + 1,
            name: subject
        }));
        
        res.status(200).json(subjectsArray);
    } catch (error) {
        console.error('Error fetching all subjects:', error);
        res.status(500).json({ message: error.message });
    }
});

// Diagnostic endpoint to check class and student structure
router.get('/diagnostic', VerifyToken, allowRoles('admin', 'teacher'), async (req, res) => {
    try {
        // Get all classes
        const classes = await Classes.find();
        
        // Get all students
        const students = await Student.find().populate('user', 'name email');
        
        // Get all teachers with subjects
        const teachers = await User.find({ role: 'teacher' }).select('name email subjects');
        
        // Prepare diagnostic information
        const diagnosticInfo = {
            classes: classes.map(cls => ({
                id: cls._id,
                branch: cls.branch,
                section: cls.section,
                subjects: cls.subjects || [],
                teacherId: cls.classTeacher
            })),
            students: students.map(student => ({
                id: student._id,
                userId: student.user?._id,
                name: student.user?.name,
                email: student.user?.email,
                rollNumber: student.rollNumber,
                branch: student.branch,
                section: student.section,
                className: student.className
            })),
            teachers: teachers.map(teacher => ({
                id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                subjects: teacher.subjects || []
            })),
            summary: {
                totalClasses: classes.length,
                totalStudents: students.length,
                totalTeachers: teachers.length,
                classesWithSubjects: classes.filter(c => c.subjects && c.subjects.length > 0).length,
                teachersWithSubjects: teachers.filter(t => t.subjects && t.subjects.length > 0).length
            }
        };
        
        res.status(200).json(diagnosticInfo);
    } catch (error) {
        console.error('Error fetching diagnostic information:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all students (regardless of subject)
router.get('/all-students', VerifyToken, allowRoles('teacher', 'admin'), async (req, res) => {
    try {
        // Get all students
        const students = await Student.find().populate('user', 'name email');
        
        // Format for frontend
        const formattedStudents = students.map(student => ({
            id: student.user._id,
            name: student.user.name,
            roll_no: student.rollNumber,
            email: student.user.email,
            class: `${student.branch || 'Unknown'} - ${student.section || 'Unknown'}`
        }));
        
        res.status(200).json(formattedStudents);
    } catch (error) {
        console.error('Error fetching all students:', error);
        res.status(500).json({ message: error.message });
    }
});

// Add a student to a subject
router.post('/:subjectId/students', VerifyToken, allowRoles('teacher', 'admin'), async (req, res) => {
    const { student_id } = req.body;
    const { subjectId } = req.params;
    
    if (!student_id) {
        return res.status(400).json({ message: 'Student ID is required' });
    }
    
    try {
        // Get the subject name
        const teacher = await User.findById(req.user.userId);
        if (!teacher || !teacher.subjects || teacher.subjects.length === 0) {
            return res.status(404).json({ message: 'Teacher not found or has no subjects assigned' });
        }
        
        const subjectIndex = parseInt(subjectId) - 1;
        const subjectName = teacher.subjects[subjectIndex];
        
        if (!subjectName) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        console.log(`Adding student ${student_id} to subject ${subjectName}`);
        
        // Get the student
        const student = await Student.findOne({ 'user': student_id });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        console.log(`Found student ${student.name}, current subjects:`, student.subjects);
        
        // Initialize subjects array if it doesn't exist
        if (!student.subjects) {
            student.subjects = [];
        }
        
        // Add the subject if it's not already in the list
        if (!student.subjects.includes(subjectName)) {
            student.subjects.push(subjectName);
            await student.save();
            console.log(`Updated student ${student.name}, new subjects:`, student.subjects);
        } else {
            console.log(`Student ${student.name} already has subject ${subjectName}`);
        }
        
        res.status(200).json({
            message: 'Student added to subject successfully',
            student: {
                id: student._id,
                name: student.name,
                subjects: student.subjects
            }
        });
    } catch (error) {
        console.error('Error adding student to subject:', error);
        res.status(500).json({ message: error.message });
    }
});

// TESTING ONLY: Assign a subject to all students
router.post('/assign-to-all-students/:subjectName', VerifyToken, allowRoles('admin', 'teacher'), async (req, res) => {
    const { subjectName } = req.params;
    
    if (!subjectName) {
        return res.status(400).json({ message: 'Subject name is required' });
    }
    
    try {
        console.log(`Assigning subject '${subjectName}' to all students`);
        
        // Get all students
        const students = await Student.find();
        let updatedCount = 0;
        
        // Add the subject to each student if they don't already have it
        for (const student of students) {
            if (!student.subjects) {
                student.subjects = [];
            }
            
            if (!student.subjects.includes(subjectName)) {
                student.subjects.push(subjectName);
                await student.save();
                updatedCount++;
            }
        }
        
        res.status(200).json({
            message: `Added subject '${subjectName}' to ${updatedCount} students`,
            totalStudents: students.length,
            updatedStudents: updatedCount
        });
    } catch (error) {
        console.error(`Error assigning subject to all students:`, error);
        res.status(500).json({ message: error.message });
    }
});

// Get subjects for the logged-in student
router.get('/my', VerifyToken, allowRoles('student'), async (req, res) => {
    try {
        const studentId = req.user.userId;
        console.log(`Fetching subjects for student: ${studentId}`);
        
        // Find student profile
        const student = await Student.findOne({ user: studentId });
        if (!student) {
            console.log('Student not found');
            return res.status(404).json({ message: 'Student profile not found' });
        }
        
        console.log(`Found student: ${student.name}, Subjects:`, student.subjects || []);
        
        let subjectsArray = [];
        
        // If student has subjects in their profile, use those
        if (student.subjects && student.subjects.length > 0) {
            // Get details for each subject
            const teachers = await User.find({ 
                role: 'teacher', 
                subjects: { $in: student.subjects } 
            }).select('name subjects');
            
            subjectsArray = student.subjects.map((subject, index) => {
                // Try to find a teacher for this subject
                const teacherForSubject = teachers.find(t => 
                    t.subjects && t.subjects.includes(subject)
                );
                
                return {
                    id: index + 1,
                    name: subject,
                    teacher: teacherForSubject ? teacherForSubject.name : 'Unassigned',
                    day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][index % 5],
                    time: `${9 + (index % 8)}:${index % 2 === 0 ? '00' : '30'} ${index % 2 === 0 ? 'AM' : 'PM'}`
                };
            });
        } else {
            // If no subjects found, use some defaults for testing
            subjectsArray = [
                { id: 1, name: 'Mathematics', teacher: 'Dr. Smith', time: '10:00 AM', day: 'Monday' },
                { id: 2, name: 'Physics', teacher: 'Mrs. Johnson', time: '11:30 AM', day: 'Tuesday' },
                { id: 3, name: 'Chemistry', teacher: 'Mr. Davis', time: '09:15 AM', day: 'Wednesday' },
                { id: 4, name: 'Biology', teacher: 'Ms. Williams', time: '02:00 PM', day: 'Thursday' },
            ];
        }
        
        res.status(200).json(subjectsArray);
    } catch (error) {
        console.error('Error fetching student subjects:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get upcoming exams for the current user
router.get('/exams/upcoming', VerifyToken, async (req, res) => {
    try {
        // This is a placeholder implementation since we don't have a real exams database yet
        const userId = req.user.userId;
        const userRole = req.user.role;
        
        if (userRole === 'student') {
            // Get the student's subjects
            const student = await Student.findOne({ user: userId });
            if (!student || !student.subjects || student.subjects.length === 0) {
                return res.status(200).json([]);
            }
            
            // Create dummy exams based on the student's subjects
            const now = new Date();
            const mockExams = student.subjects.map((subject, index) => {
                const examDate = new Date();
                examDate.setDate(now.getDate() + (7 + index * 2)); // Spread exams out over coming weeks
                
                return {
                    id: index + 1,
                    subject: subject,
                    date: examDate.toISOString().split('T')[0],
                    time: `${10 + (index % 6)}:${index % 2 === 0 ? '00' : '30'} ${index % 2 === 0 ? 'AM' : 'PM'}`
                };
            });
            
            return res.status(200).json(mockExams);
        } else {
            // For teachers and admins, return a standard set of upcoming exams
            const mockExams = [
                { id: 1, subject: 'Mathematics', date: '2023-06-20', time: '10:00 AM' },
                { id: 2, subject: 'Physics', date: '2023-06-22', time: '02:00 PM' },
                { id: 3, subject: 'Chemistry', date: '2023-06-25', time: '09:30 AM' },
                { id: 4, subject: 'Biology', date: '2023-06-27', time: '11:00 AM' }
            ];
            
            return res.status(200).json(mockExams);
        }
    } catch (error) {
        console.error('Error fetching upcoming exams:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router; 