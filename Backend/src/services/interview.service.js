import redisClient from "../config/redis.js";
import { generateInterviewQuestion,evaluateAnswer } from "../utils/ai.js";

export const startInterviewService = async (socketId, role) => {
  const question = await generateInterviewQuestion(role);

  const session = {
    role,
    lastQuestion: question,
    totalScore: 0,
    answers: [], // ✅ important
  };

  await redisClient.setEx(
    `session:${socketId}`,
    3600,
    JSON.stringify(session)
  );

  return question;
};

export const submitAnswerService = async (socketId, answer) => {
  const sessionData = await redisClient.get(`session:${socketId}`);
  if (!sessionData) throw new Error("session not found.");

  const session = JSON.parse(sessionData);

  // ✅ FIX: correct param name
  const evaluation = await evaluateAnswer({
    role: session.role,
    question: session.lastQuestion, // ❌ you used "session"
    answer,
  });

  // ✅ STORE ANSWER (THIS WAS MISSING)
  session.answers.push({
    question: session.lastQuestion,
    answer,
    score: evaluation.score,
    feedback: evaluation.feedback,
  });

  // ✅ UPDATE SCORE
  session.totalScore += evaluation.score;

  // ✅ NEXT QUESTION
  const nextQuestion = await generateInterviewQuestion(session.role);
  session.lastQuestion = nextQuestion;

  // ✅ SAVE BACK TO REDIS (VERY IMPORTANT)
  await redisClient.set(
    `session:${socketId}`,
    JSON.stringify(session)
  );

  return { evaluation, nextQuestion };
};
export const endInterviewService = async(socketId) =>{
     const sessionData = await redisClient.get(`session:${socketId}`);

     if(!sessionData) return null;

     const session = JSON.parse(sessionData);

     await redisClient.del(`session:${socketId}`);

     return {
      role:session.role,
      totalScore:session.totalScore,
      answers:session.answers
     }
}