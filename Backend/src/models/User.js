import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:String,
  email:{
    type:String,
    unique:true,
    index:true
  },
  password:{
    type:String,
    select:false
  },
  skills:[String],
  bio:String,
  role:{
    type:String,
    default:'user'
  },
  verified:{
    type:Boolean,
    default:false
  },
},{
  timestamps:true
})

export default mongoose.model("User",userSchema);