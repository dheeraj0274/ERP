import express from "express";
import {
  createClass,
  getallClasses,
  getClassesbyId,
  countClasses,
  updateClass,
  deleteClass,
} from "../controllers/classController.js";
import { VerifyToken, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", VerifyToken, allowRoles("admin"), createClass);
router.get("/count", VerifyToken, allowRoles("admin"), countClasses);
router.get("/", VerifyToken, allowRoles("admin", "teacher"), getallClasses);
router.get("/:id", VerifyToken, allowRoles("admin", "teacher"), getClassesbyId);
router.put("/:id", VerifyToken, allowRoles("admin"), updateClass);
router.delete("/:id", VerifyToken, allowRoles("admin"), deleteClass);

export default router;
