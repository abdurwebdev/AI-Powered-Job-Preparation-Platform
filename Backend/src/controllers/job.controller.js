import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import { generateJobMatchFeedback } from "../utils/ai.js";
import logger from "../config/logger.js";
import redisClient from "../config/redis.js";

export const createJob = async (req, res) => {
  try {
    const jobsData = [
      {
        title: "Frontend Developer",
        company: "TechCorp",
        requiredSkills: ["JavaScript", "React", "HTML", "CSS"],
        description: "Develop and maintain web applications using React."
      },
      {
        title: "Backend Developer",
        company: "DevSolutions",
        requiredSkills: ["Node.js", "Express", "MongoDB"],
        description: "Build robust backend services and APIs."
      },
      {
        title: "Full Stack Engineer",
        company: "Innovatech",
        requiredSkills: ["React", "Node.js", "SQL"],
        description: "Create and maintain both frontend and backend components."
      },
      {
        title: "Data Scientist",
        company: "DataWiz",
        requiredSkills: ["Python", "Machine Learning", "Pandas"],
        description: "Analyze data and build predictive models."
      },
      {
        title: "DevOps Engineer",
        company: "CloudyOps",
        requiredSkills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
        description: "Manage infrastructure and deployment pipelines."
      },
      {
        title: "Mobile Developer",
        company: "AppMakers",
        requiredSkills: ["Flutter", "Dart", "Android", "iOS"],
        description: "Develop cross-platform mobile applications."
      },
      {
        title: "QA Engineer",
        company: "QualityFirst",
        requiredSkills: ["Selenium", "Jest", "Test Automation"],
        description: "Ensure software quality through automated testing."
      },
      {
        title: "UI/UX Designer",
        company: "Designify",
        requiredSkills: ["Figma", "Sketch", "User Research"],
        description: "Design intuitive and engaging user interfaces."
      },
      {
        title: "Project Manager",
        company: "AgileWorks",
        requiredSkills: ["Scrum", "Communication", "Planning"],
        description: "Lead teams and manage project deliverables."
      },
      {
        title: "Security Analyst",
        company: "SafeNet",
        requiredSkills: ["Cybersecurity", "Network Security", "Risk Assessment"],
        description: "Protect systems and data from security threats."
      }
    ];

    const createdJobs = await Job.insertMany(jobsData);
    res.status(201).json({
      message: "10 jobs have been created successfully.",
      jobs: createdJobs
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create jobs", error: error.message });
  }
};

export const matchJobs = async (req,res)=>{
  try {
    const userId = req.user.id;

    let cachedResults = await redisClient.get(`job_match:${userId}`);
    const parsed = JSON.parse(cachedResults);
    if(cachedResults){
      return res.status(200).json({
        success:true,
        message:"Job fetced from cache.",
        data:parsed.data,
        feedback:parsed.feedback
      })
    }


    const resume = await Resume.findOne({user:userId}).sort({createdAt:-1});

    if(!resume){
      return res.status(404).json({
        success:false,
        message:"Resume not found."
      })
    }

    const jobs = await Job.find();

    const userSkills = resume.skills.map(skill=>skill.toLowerCase());

    const results = jobs.map(job=>{
      const matchedSkills = job.requiredSkills.filter(skill=>userSkills.includes(skill.toLowerCase()));
      const matchScore =job.requiredSkills.length? Math.round((matchedSkills.length/job.requiredSkills.length)*100):0;

      return {
         title:job.title,
         company:job.company,
         matchScore,
         matchedSkills,
         missingSkills:job.requiredSkills.filter(skill=>
          (!userSkills.includes(skill)
         ))
      }
    })
    
    const requiredSkills = jobs.map(job=>job.requiredSkills).flat();

    let aiFeedback = await generateJobMatchFeedback(userSkills,requiredSkills);

    await redisClient.setEx(`job_match:${userId}`, 60 * 60,JSON.stringify(
      {
        data:results.sort((a,b)=>b.matchScore - a.matchScore),
        feedback:aiFeedback
      }
    ));

    logger.info(`Jobs matched successfully for user ${userId}`,{totalMatches:results.length});
    res.status(200).json({
      success:true,
      data:results.sort((a,b)=>b.matchScore - a.matchScore),
      feedback:aiFeedback
    })
  } catch (error) {
   logger.error(`Error matching jobs:${error.message}`);
   res.status(500).json({
    success:false,
    message:"Failed to match jobs.",
   })
  }
}