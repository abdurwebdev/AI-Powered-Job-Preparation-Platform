import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/connectDB.js';
import authRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.routes.js';

const app = express();

connectDB();

app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());

//Routes
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)

app.get('/',(req,res)=>{
  res.send("API is Running! ")
})

export default app;
