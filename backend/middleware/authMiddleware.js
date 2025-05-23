import jwt from 'jsonwebtoken'

const VerifyToken = (req, res, next)=>{
    const token = req.headers.authorization?.split(" ")[1];
    if(!token) return res.status(401).json({message:'Token not matched'})
    try {
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        req.user=decoded;
        next()
    } catch (error) {
        res.status(401).json({ message: "Invalid Token" });
        
    }

   
}
const allowRoles=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({ message: "Access Forbidden" });
        }
        next();
      
    }
  
}

export  {VerifyToken , allowRoles};