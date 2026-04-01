import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
  },
  extractedText:String,
  skills:[String],
  score:Number,
  missingSkills:[String],
  version:{
    type:Number,
    default:1
  }
},{timestamps:true})

export default mongoose.model("Resume",resumeSchema)