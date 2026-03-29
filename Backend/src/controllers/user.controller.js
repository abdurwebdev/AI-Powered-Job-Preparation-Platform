import bcrypt from "bcryptjs";
import User from "../models/User.js"
import redisClient from "../config/redis.js";
import logger from '../config/logger.js';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from "../config/mailer.js";

export const getProfile = async (req,res) =>{
  try {
    const userId = req.user.id;

   const cachedUser = await redisClient.get(`user_profile:${userId}`);

   if(cachedUser){
    return res.status(200).json({
      success:true,
      message:"user fetched successfully from cache",
      user:JSON.parse(cachedUser)
    })
   }

    let user = await User.findById(userId).select('-password');
    if(!user){
      return res.status(404).json({
        success:false,
        message:"user not found."
      })
    }
    const TWO_DAYS = 2 * 24 * 60 * 60;
    await redisClient.setEx(`user_profile:${userId}`,TWO_DAYS,JSON.stringify(user));

    res.status(200).json({
      success:true,
      message:"user fetched successfully.",
      user:user
    })
  } catch (error) {
    logger.error(`Error Fetching Profile:${error.message}`,{userId:req.user.id})
    res.status(500).json(
      {
      success:false,
      message:error.message
    })
  }
}

export const updateProfile = async (req,res) =>{
  try {
    const userId = req.user.id;
    let {name,email,skills,bio} = req.body;
    
    let currentUser = await User.findById(userId).select('email');
    
    if(!currentUser){
      return res.status(404).json({
        success:false,
        message:"user not found."
      })
    }
    let isEmailChanging = email && email!== currentUser.email;
    if(isEmailChanging){
      let existingUser = await User.findOne({email});
      if(existingUser){
        
        return res.status(400).json({success:false,message:"Email already in use."})
      }
    }

    let updateData = {};
    if(name) updateData.name = name;
    if(email) updateData.email = email;
    if(skills) updateData.skills = skills;
    if(bio) updateData.bio = bio;
    
    if(Object.keys(updateData).length===0){
      return res.status(400).json({
        success:false,
        message:"no data provided to update"
      })
    }

    let updatedProfile = await User.findByIdAndUpdate(userId,{$set:updateData},{returnDocument:'after'}).select('-password');

    if(!updatedProfile){
      
      return res.status(404).json({
        success:false,
        message:"user not found."
      })
    }

    await redisClient.del(`user_profile:${userId}`)
    res.clearCookie("token");

    if(isEmailChanging){
      updatedProfile.verified = false;
      await updatedProfile.save();
      
      let token = jwt.sign({id:userId,type:'email-verification'},process.env.JWT_SECRET,{expiresIn:'7h'});
      
      await sendVerificationEmail(email,token)

      await redisClient.del(`user_token:${userId}`)
      res.clearCookie("token");
    }
    
    return res.status(200).json(
      {
        success:true,
        message:isEmailChanging?'Profile updated successfully. Please verify your new email.':'Profile updated successfully.',
        user:updatedProfile
      })

      

  } catch (error) {
    logger.error(`Error Updating Profile:${error.message}`,{userId:req.user.id})
    res.status(500).json(
      {
      success:false,
      message:error.message
    })
  }
}

export const updatePassword = async (req,res) => {
  try {
    
    const userId = req.user.id;
    
    let {oldPassword,newPassword} = req.body;
    if(!oldPassword || !newPassword){
      return res.status(400).json({success:false,message:"both passsword fields are required."})
    }
    let user = await User.findById(userId).select("+password");

    if(!user){
      return res.status(404).json({
        success:false,
        message:"user not found."
      })
    }

    let isMatch = await bcrypt.compare(oldPassword,user.password);
    
    if(!isMatch){
      return res.status(400).json({
        success:false,
        message:"old password is incorrect."
      })
    }
    
    user.password = await bcrypt.hash(newPassword,10);
    await user.save();
    await redisClient.del(`user_token:${userId}`)
    res.clearCookie("token")
    await redisClient.del(`user_profile:${userId}`)
    res.status(200).json({
      success:true,
      message:"password updated successfully",
    })

  } catch (error) {
    logger.error(`Error changing password:${error.message}`,{userId:req.user.id})
    res.status(500).json({
      success:false,
      message:error.message
    })
  }
}

export const verifyEmail = async (req,res) =>{
 try {
  const {token} = req.query;
  if(!token) return res.status(400).json({
    success:false,
    message:"invalid link"
  }) 
  let decoded;
  try{
    decoded = jwt.verify(token,process.env.JWT_SECRET);
  }
  catch(error){
    return res.status(400).json({
      success:false,
      message:"invalid or expired token"
    })
  }
  

  if(decoded.type !== 'email-verification'){
    return res.status(400).json({
      success:false,
      message:"invalid token type"
    })
  }

  const user = await User.findById(decoded.id);

  if(!user) return res.status(400).json({
    success:false,
    message:"user not found."
  })
  if(user.verified) return res.status(400).json({
    success:false,
    message:"user already verified."
  })
  user.verified = true;
  await user.save();
  res.status(200).json({
    success:true,
    message:"email verified successfully."
  })
 } catch (error) {
   logger.error(`Verifying email failed: ${error.message}`)
   return res.status(500).json({
    success:false,
    message:"internal server error."
   })
 }
}