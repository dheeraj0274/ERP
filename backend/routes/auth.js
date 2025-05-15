import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js';
import dotenv from 'dotenv'
import { VerifyToken, allowRoles } from '../middleware/authMiddleware.js'
import Student from '../models/student.js'
import Classes from '../models/class.js'
dotenv.config();


const router = express.Router();



//register
router.post('/register',async(req,res)=>{
    const {name, email , password , role}= req.body;
    try {
        const userExist = await User.findOne({email});
        if(userExist) return res.status(400).json({message:'user already exist'});
        const hash = await bcrypt.hash(password , 10);
        const user = new User({name , email, password:hash,role})
        await user.save();
        
        res.status(201).json({ message: "User registered successfully" });
       
    } catch (error) {
        res.status(500).json({ error: error.message });
        
    }

})

//Login

router.post('/login',async(req,res)=>{

    const {email , password}=req.body;
    console.log(email, password);
    
    try {
        const user = await User.findOne({email});
    if(!user) return res.status(404).json({ message: "User not found" });
    const match = await bcrypt.compare(password , user.password);
    if(!match) return 
    const token = jwt.sign({userId:user._id , role:user.role}, process.env.JWT_SECRET,{
        expiresIn:'7d'
    })
    res.status(200).json({token, user:{id:user._id, name:user.name , role:user.role}, message:"loggedIn"})
        
    } catch (error) {
        res.status(500).json({ error: err.message });
        
    }
})

// Get all users
router.get('/users', VerifyToken, allowRoles("admin"), async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user role
router.patch('/users/:id/role', VerifyToken, allowRoles("admin"), async (req, res) => {
    const { role } = req.body;
    
    // Validate role
    if (!role || !["admin", "teacher", "student"].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
    }

    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Update role
        user.role = role;
        await user.save();
        
        res.status(200).json({ 
            message: "User role updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create teacher by admin
router.post('/users/teacher', VerifyToken, allowRoles("admin"), async (req, res) => {
    const { name, email, password, subjects } = req.body;
    
    try {
        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        
        // Validate subjects
        if (!subjects || subjects.length === 0) {
            return res.status(400).json({ message: 'At least one subject must be assigned to a teacher' });
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create a new user with teacher role
        const newTeacher = new User({
            name,
            email,
            password: hashedPassword,
            role: 'teacher',
            subjects: subjects
        });
        
        // Save the teacher
        await newTeacher.save();
        
        // Create response object without password
        const responseTeacher = {
            id: newTeacher._id,
            name: newTeacher.name,
            email: newTeacher.email,
            role: newTeacher.role,
            subjects: newTeacher.subjects
        };
        
        // Return success response
        res.status(201).json({ 
            message: 'Teacher created successfully', 
            teacher: responseTeacher 
        });
        
    } catch (error) {
        console.error('Error creating teacher:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete user (admin only)
router.delete('/users/:id', VerifyToken, allowRoles("admin"), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        await User.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ 
            message: "User deleted successfully"
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create student by admin
router.post('/users/student', VerifyToken, allowRoles("admin"), async (req, res) => {
    const { name, email, password, className, branch, section, rollNumber, subjects } = req.body;
    
    try {
        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create a new user with student role
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'student'
        });
        
        // Save the user
        await newUser.save();
        
        // Create the student profile with proper subject array
        const newStudent = new Student({
            name,
            email,
            rollNumber,
            subjects: subjects || [], // Ensure this is an array even if empty
            className,
            branch,
            section,
            user: newUser._id
        });
        
        // Log for debugging
        console.log(`Creating student with subjects:`, subjects);
        
        // Save the student profile
        await newStudent.save();
        console.log(`Student saved with ID: ${newStudent._id}, Subjects: ${newStudent.subjects}`);
        
        // Check if we need to handle subject assignment
        if (subjects && subjects.length > 0) {
            // Check if a class exists for this branch and section
            let classExists = await Classes.findOne({ branch, section });
            
            if (classExists) {
                // Add subjects to existing class if they're not already there
                if (!classExists.subjects) classExists.subjects = [];
                
                // Add each subject that isn't already in the class
                let updated = false;
                for (const subject of subjects) {
                    if (!classExists.subjects.includes(subject)) {
                        classExists.subjects.push(subject);
                        updated = true;
                    }
                }
                
                // Save the updated class if changes were made
                if (updated) {
                    await classExists.save();
                    console.log(`Updated existing class with new subjects: ${JSON.stringify(classExists.subjects)}`);
                }
            } else {
                // Create a new class for this branch and section with these subjects
                const newClass = new Classes({
                    branch,
                    section,
                    semester: 1, // Default semester
                    subjects: subjects
                });
                
                await newClass.save();
                console.log(`Created new class with subjects: ${JSON.stringify(newClass.subjects)}`);
            }
        }
        
        // Create response object without password
        const responseStudent = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            rollNumber,
            branch,
            section,
            className,
            subjects: subjects || []
        };
        
        // Return success response
        res.status(201).json({ 
            message: 'Student created successfully', 
            student: responseStudent 
        });
        
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;