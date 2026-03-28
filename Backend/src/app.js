import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/connectDB.js';
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
  res.send("API is Running! ")
})

export default app;
