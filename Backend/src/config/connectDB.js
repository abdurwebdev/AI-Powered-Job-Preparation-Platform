import mongoose from 'mongoose';
import logger from './logger.js'
export const connectDB = async () =>{
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected To Mongo DB.")
  } catch (error) {
    logger.error(`DB Error: ${error.message}`)
    process.exit(1);
  }
}