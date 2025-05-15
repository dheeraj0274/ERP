import express from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  countStudents,
  getstudentByBranchandSection,
  getstudentBySubjects,
} from "../controllers/studentController.js";
import { VerifyToken, allowRoles } from "../middleware/authMiddleware.js";
import Student from "../models/student.js";


const router = express.Router();

// ✅ Add VerifyToken + allowRoles middleware to each route
router.get("/", VerifyToken, allowRoles("admin"), getAllStudents);
router.get('/subjectstudents',VerifyToken ,allowRoles('teacher'),getstudentBySubjects)
router.get('/by-class/:className', VerifyToken, allowRoles('teacher', 'admin'), async (req, res) => {
  try {
    const className = req.params.className;
    const [branch, section] = className.split('-').map(part => part.trim());
    
    console.log(`Fetching students by class: ${className}, Branch: ${branch}, Section: ${section}`);
    
    // Find students with matching branch and section
    const students = await Student.find({
      branch: branch,
      section: section
    }).populate('user', 'name email');
    
    if (!students || students.length === 0) {
      console.log(`No students found for class: ${className}`);
      return res.status(200).json([]);
    }
    
    // Format for frontend
    const formattedStudents = students.map(student => ({
      id: student.user?._id || student._id,
      name: student.user?.name || 'Unknown',
      roll_no: student.rollNumber || 'N/A',
      email: student.user?.email || 'N/A',
      class: `${student.branch || 'Unknown'} - ${student.section || 'Unknown'}`
    }));
    
    console.log(`Returning ${formattedStudents.length} students for class: ${className}`);
    res.status(200).json(formattedStudents);
  } catch (error) {
    console.error('Error fetching students by class:', error);
    res.status(500).json({ message: error.message });
  }
});
router.get("/:id", VerifyToken, allowRoles("admin"), getStudentById);
router.post("/", VerifyToken, allowRoles("admin"), createStudent);
router.put("/:id", VerifyToken, allowRoles("admin"), updateStudent);
router.delete("/:id", VerifyToken, allowRoles("admin"), deleteStudent);
router.get("/count", VerifyToken, allowRoles("admin"), countStudents);

// Diagnostic endpoint to check student data
router.get('/diagnostics', VerifyToken, async (req, res) => {
  try {
    const students = await Student.find().populate('user', 'name email role');
    const formatted = students.map(student => ({
      id: student._id,
      user_id: student.user ? student.user._id : null,
      name: student.user ? student.user.name : student.name,
      email: student.user ? student.user.email : student.email,
      role: student.user ? student.user.role : 'unknown',
      rollNumber: student.rollNumber,
      subjects: student.subjects || [],
      branch: student.branch,
      section: student.section,
      className: student.className
    }));
    
    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error getting student diagnostics:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
