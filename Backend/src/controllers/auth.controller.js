import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req,res) =>{
  try{
    const {name,email,password} = req.body;
  
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
    password:hashedPassword
    }
  )
  
  registeredUser.password = undefined

  res.status(201).json({
    success:true,
    message:"user created successfully.",
    user:registeredUser
  })
  }
  catch(error){
    return res.status(500).json({
      success:false,
      message:"Server error..."
    })
  }
}

export const loginUser = async (req,res)=>{
  
  const {email,password} = req.body;
  
  let isEmailValid = await User.findOne({email}).select('+password');
  
  if(!isEmailValid){
    return res.status(409).json({
      success:false,
      message:"invalid credentials"
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
    sameSite:'lax'
  });
  isEmailValid.password = undefined;
  res.status(200).json({
    success:true,
    message:"login successful",
    user:isEmailValid
  })

}