import student from "../models/student.js";
import Student from "../models/student.js";
import User from "../models/User.js";




//GET ALL STUDENTS
export const getAllStudents = async(req,res)=>{
    try {
        const students = await Student.find().populate("user" , "email role")
     
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
        
    }

}
export const countStudents = async(req,res)=>{
    try {
        const count = await Student.countDocuments();
        res.status(200).json(count);
        
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}
export const getstudentByBranchandSection = async(req,res)=>{
    const {branch , section} = req.query;
    try {
        const filter = {}
        if(branch) filter.branch=branch
        if(section) filter.section= section


        const students = await Student.find(filter).populate("name" , "email role")
        if(students.length===0) return res.status(400).json({message:'NO STUDENT FOUND'});
        res.status(200).json(students)
    } catch (error) {
        
    }
}


export const getStudentById = async(req, res)=>{
   
    try {
        const students = await Student.findById(req.params.id).populate("user");
       
        
        
        res.status(200).json('');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
   
}

export const createStudent = async(req,res)=>{
    try {
        const newStudent = new Student(req.body);
        await newStudent.save();
        res.status(201).json(newStudent);
    } catch (err) {
        res.status(400).json({ message: err.message });
        
    }
}
export const getstudentBySubjects = async (req, res) => {
    try {
        // Get the teacher's subjects
        const teacher = await User.findById(req.user.userId);
        if (!teacher || !teacher.subjects || teacher.subjects.length === 0) {
            return res.status(404).json({ message: 'Teacher not found or has no subjects assigned' });
        }
        
        console.log(`Teacher ${teacher.name} has subjects:`, teacher.subjects);
        
        // First try with $in operator for array fields
        let students = await Student.find({
            subjects: { $in: teacher.subjects }
        }).populate('user', 'name email');
        
        console.log(`Found ${students.length} students with array matching`);
        
        // If no students found, try alternate approach for string fields
        if (students.length === 0) {
            // Try to find students where subjects field might be a comma-separated string
            for (const subject of teacher.subjects) {
                const subjectStudents = await Student.find({
                    $or: [
                        { subjects: { $regex: subject, $options: 'i' } },
                        { className: { $regex: subject, $options: 'i' } }
                    ]
                }).populate('user', 'name email');
                
                // Add unique students to our result set
                for (const student of subjectStudents) {
                    if (!students.some(s => s._id.toString() === student._id.toString())) {
                        students.push(student);
                    }
                }
            }
            console.log(`After text search, found ${students.length} students`);
        }
        
        // If still no students, just return all students as a fallback for testing
        if (students.length === 0) {
            console.log('No students found by subject matching, returning all students as fallback');
            students = await Student.find().populate('user', 'name email');
        }
        
        // Format the response
        const formattedStudents = students.map(student => ({
            id: student.user?._id || student._id,
            name: student.user?.name || student.name,
            roll_no: student.rollNumber,
            email: student.user?.email || student.email,
            class: `${student.branch || 'Unknown'} - ${student.section || 'Unknown'}`,
            subjects: student.subjects || []
        }));
        
        res.status(200).json(formattedStudents);
        console.log(`Returning ${formattedStudents.length} students for teacher's subjects:`, teacher.subjects);
    } catch (error) {
        console.error('Error fetching students by subjects:', error);
        res.status(500).json({ message: error.message });
    }
}


export const updateStudent= async(req,res)=>{
    try {
        const updated = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        )
        res.status(200).json({updated})
    } catch (err) {
        res.status(400).json({ message: err.message });
        
    }
}

export const deleteStudent = async(req,res)=>{
    try {
        await Student.findOneAndDelete(req.params.id);
        res.status(200).json({message:'Student deleted'});

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

