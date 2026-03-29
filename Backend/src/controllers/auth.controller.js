import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import redisClient from "../config/redis.js";
import logger from '../config/logger.js'
import { sendVerificationEmail } from "../config/mailer.js";

export const registerUser = async (req,res) =>{
  try{
    const {name,email,password,skills,bio} = req.body;
  
  let isUserWithEmail = await User.findOne({email});
 

  if(isUserWithEmail){
    return res.status(409).json({
      success:false,
      message:"user already exists"
    })
  }
  
  let hashedPassword = await bcrypt.hash(password,10);

  let registeredUser = await User.create({
    name,
    email,
    password:hashedPassword,
    skills,
    bio
    }
  )
  
  registeredUser.password = undefined
  
  const token = jwt.sign({id:registeredUser._id,type:"email-verification"},process.env.JWT_SECRET,{expiresIn:'7h'})

  await sendVerificationEmail(email,token);

  res.status(201).json({
    success:true,
    message:"user created successfully please check your email to verify.",
    user:registeredUser
  })
  }
  catch(error){
    logger.error(`Error registering user:${error.message}`);

    return res.status(500).json({
      success:false,
      message:"Server error..."
    })
  }
}

export const loginUser = async (req,res)=>{
  try{
    const {email,password} = req.body;
  
    let isEmailValid = await User.findOne({email}).select('+password');
    
    if(!isEmailValid){
      return res.status(409).json({
        success:false,
        message:"invalid credentials"
      })
    }
    
    if(!isEmailValid.verified){
      return res.status(403).json({
        success:false,
        message:"verify your email first"
      })
    }

    let isPasswordValid = await bcrypt.compare(password,isEmailValid.password);
    
    if(!isPasswordValid){
      return res.status(401).json({
        success:false,
        message:"invalid credentials"
      })
    }
  
    let token = jwt.sign({id:isEmailValid._id},process.env.JWT_SECRET,{expiresIn:'7d'})
    
    res.cookie("token",token,{
      httpOnly:true,
      secure:false,
      sameSite:'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
  
    await redisClient.set(`user_token:${isEmailValid._id}`,token,{
      EX: 7 * 24 * 60 * 60
    })
    
    isEmailValid.password = undefined;
    res.status(200).json({
      success:true,
      message:"login successful",
      user:isEmailValid
    })
  
  }
  catch(error){
    logger.error(`Error logging in user:${error.message}`);
    res.status(500).json({
      success:false,
      message:error.message
    })
  }
 
}

export const logOutUser = async (req,res) =>{
       try {
        const userId = req.user.id;

        await redisClient.del(`user_token:${userId}`);

        res.clearCookie("token",{
          httpOnly:true,
          secure:process.env.NODE_ENV==='production',
          sameSite:'Strict'
        })
        res.json({message:"Loggedout successfully"})
       } catch (error) {
        logger.error(`Error logging out user:${error.message}`,{userId:req.user.id});
        res.status(500).json({message:error.message})
       }
}