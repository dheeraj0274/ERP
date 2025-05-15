import express from "express";
import {VerifyToken , allowRoles} from '../middleware/authMiddleware.js'


const router = express.Router();

router.get("/profile",  VerifyToken, (req, res) => {
    res.json({ message: `Welcome ${req.user.role}` });
  });

  router.get('/adminOnly' , VerifyToken , allowRoles("admin"), (req,res)=>{
    res.json({ message: "Hello Admin" });
  });
  router.get("/teacher", VerifyToken, allowRoles("teacher"), (req, res) => {
    res.status(200).json({ message: "Welcome Teacher" });
  });

export default router;