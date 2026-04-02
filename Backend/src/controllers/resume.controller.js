import redisClient from "../config/redis.js";
import { parseResume } from "../utils/parseResume.js";
import Resume from "../models/Resume.js";
import logger from "../config/logger.js";
import { analyzeResumeWithAI } from "../utils/ai.js";
import { createEmbeddings } from "../utils/embeddings.js";
import { index } from "../config/connectVector.js";

export const uploadResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const force = req.query.force === "true";

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // 🔥 Cache check
    if (!force) {
      const cached = await redisClient.get(`resume:${userId}`);
      if (cached) {
        return res.status(200).json({
          success: true,
          message: "resume fetched from cache",
          data: JSON.parse(cached),
        });
      }
    }

    const text = await parseResume(req.file.buffer);

   // 1️⃣ Query IDs for this user
const userVectors = await index.query({
  filter: { userId: userId, type: "resume" },
  topK: 1000,       // adjust depending on expected number of chunks
  includeValues: false,
  includeMetadata: false,
});

// 2️⃣ Delete by IDs
if (userVectors.matches.length > 0) {
  await index.delete({
    ids: userVectors.matches.map((v) => v.id),
  });
}
    const chunks = text.match(/.{1,500}/g) || [];

    // 🔥 Store embeddings
    await Promise.all(
      chunks.map(async (chunk, i) => {
        const embedding = await createEmbeddings(chunk);

        return index.upsert({
          vectors: [
            {
              id: `${userId}-resume-${i}`,
              values: embedding,
              metadata: {
                userId,
                type: "resume",
                text: chunk,
              },
            },
          ],
        });
      })
    );

    // 🔥 AI analysis
    const aiResult = await analyzeResumeWithAI(text);
    const { skills, missingSkills, score } = aiResult;

    const resume = await Resume.create({
      user: userId,
      extractedText: text,
      skills,
      score,
      missingSkills,
    });

    // 🔥 Cache
    await redisClient.setEx(
      `resume:${userId}`,
      60 * 60,
      JSON.stringify(resume)
    );

    res.status(201).json({
      success: true,
      message: "Resume analyzed successfully",
      data: resume,
    });
  } catch (error) {
    logger.error(`Error analyzing resume: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};