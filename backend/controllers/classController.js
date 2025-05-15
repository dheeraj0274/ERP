import Classes from '../models/class.js'
export const createClass = async(req,res)=>{
    try {
        const newClass = new Classes(req.body);
        await newClass.save()
        res.status(201).json(newClass)
    }

       
     catch (error) {
       
       
        res.status(500).json({message:'server error'})
    }
}

export  const getallClasses = async(req,res)=>{
    try {
        const getclass = await Classes.find().populate('classTeacher' , ' name email role');
        if(getclass.length === 0) return res.status(400).json({message:'no class found'})
           
        res.status(200).json(getclass)
    
        
    } catch (error) {
        res.status(500).json({message:error.message})
        
    }
  
}
export const countClasses = async(req,res)=>{
    try {
        const count = await Classes.countDocuments();
        res.status(200).json(count);
        
        
        
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}
export  const getClassesbyId = async(req,res)=>{
    try {
        const getclassbyid = await Classes.findById(req.params.id).populate('classTeacher' , ' name email ');
       
           
            res.status(200).json(getclassbyid)
    
        
    } catch (error) {
        res.status(500).json({message:'server error'})
        
    }
  
}

export const updateClass = async(req,res)=>{
    try {
        const update = await Classes.findByIdAndUpdate(req.params.id , req.body, {new:true});
        res.status(200).json(update)
    } catch (error) {
        res.status(500).json({message:err.message})
        
    }
}
export const deleteClass = async(req,res)=>{
    try {
        const deleteclass = await Classes.findByIdAndDelete(req.params.id );
        res.status(200).json(deleteclass)
    } catch (error) {
        res.status(500).json({message:err.message})
        
    }
}