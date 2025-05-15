import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    name:{type:String , required:true},
    email:{type:String , unique:true, required:true},
    password:{type:String , required:true},
    role:{type:String, enum:["admin", "teacher", "student"], default:"student"},
    subjects: {
        type: [String], 
        default: [],
        validate: {
            validator: function(v) {
                // Only teachers should have subjects
                return this.role !== 'teacher' || v.length > 0;
            },
            message: props => 'Teachers must have at least one subject assigned'
        }
    }
},{timestamps:true});


export default mongoose.model('User', UserSchema);