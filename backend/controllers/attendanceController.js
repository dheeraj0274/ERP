import Attendance from "../models/Attendance.js"

export   const  getmyAttendance = async(req,res)=>{
    try {
        const studentId = req.user.userId;
        const total  = await Attendance.countDocuments({student:studentId})
        const present = await Attendance.countDocuments({student :studentId , status:"Present"});
        const absent = total-present;
        console.log(total , present);
        
        if (total === 0 ) return res.status(200).json({percentage:'0%',message:'No attendace found'});
        const  attend = total > 0 ?  (present/total)*100 : 0;
        console.log(attend);
        
        res.status(200).json({
            "attendance": `${attend}%` , 
            "totalLectures":total,
            "absent":absent
        }
        )

    }


        
     catch (error) {
        res.status(500).json({message:error.message})
        
    }
}
  