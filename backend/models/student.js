import mongoose from "mongoose";
import User from "./User.js";

const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    rollNumber: String,
    subjects: [String],
    className: String,
    branch: String,
    section: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    createdAt: {type: Date, default: Date.now()}
});

export default mongoose.model("Student", studentSchema); 