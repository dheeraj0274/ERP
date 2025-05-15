import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    branch: { type: String, required: true },
    section: { type: String, required: true },
    semester: { type: Number, required: true },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subjects: [{ type: String }],
    createdAt: { type: Date, default: Date.now },

});

 export  default mongoose.model('Classes' , classSchema);