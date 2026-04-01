import redisClient from "../config/redis.js";
import {parseResume} from '../utils/parseResume.js';
import Resume from '../models/Resume.js';
import logger from '../config/logger.js'
import { analyzeResumeWithAI } from "../utils/ai.js";

export const uploadResume = async (req,res) =>{
  try {
    const userId = req.user.id;

    const force = req.query.force === 'true';

    if(!force){
      const cached = await redisClient.get(`resume:${userId}`);
      if(cached){
        return res.status(200).json({
          succes:true,
          message:"resume fetched from cache",
          data:JSON.parse(cached)
        })
      }
    }

    const text = await parseResume(req.file.buffer);

    let aiResult = await analyzeResumeWithAI(text);
    const {skills,missingSkills,score} = aiResult;

    const resume = await Resume.create({
      user:userId,
      extractedText:text,
      skills,
      score,
      missingSkills,

    })
    
    await redisClient.setEx(`resume:${userId}`, 60 * 60,JSON.stringify(resume));
    
    res.status(201).json({
      success: true,
      message: "Resume analyzed successfully",
      data: resume,
    });
  } catch (error) {
    logger.error(`Error ananlyzing resume:${error.message}`);
    res.status(500).json({
      success:false,
      message:error.message
    })
  }
}