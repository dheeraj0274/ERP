import express from 'express'
import { VerifyToken , allowRoles } from '../middleware/authMiddleware.js'
import {getmyAttendance} from '../controllers/attendanceController.js'


const router = express.Router();

router.get('/my-percentage' , VerifyToken , allowRoles("student") , getmyAttendance);
export default router;