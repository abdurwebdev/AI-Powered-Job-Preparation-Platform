import redisClient from "../config/redis.js";
import {
  generateInterviewQuestion,
  evaluateAnswer,
  generateSummaryStream, // imported, no local redeclaration
} from "../utils/ai.js";

// ---- Start Interview ----
export const startInterviewService = async (socketId, role) => {
  const question = await generateInterviewQuestion(role);

  const session = {
    role,
    lastQuestion: question,
    totalScore: 0,
    answers: [],
  };

  await redisClient.setEx(
    `session:${socketId}`,
    3600,
    JSON.stringify(session)
  );

  return question;
};

// ---- Submit Answer ----
export const submitAnswerService = async (socketId, answer) => {
  const sessionData = await redisClient.get(`session:${socketId}`);
  if (!sessionData) throw new Error("session not found.");

  const session = JSON.parse(sessionData);

  const evaluation = await evaluateAnswer({
    role: session.role,
    question: session.lastQuestion,
    answer,
  });

  session.answers.push({
    question: session.lastQuestion,
    answer,
    score: evaluation.score,
    feedback: evaluation.feedback,
  });

  session.totalScore += evaluation.score;

  const nextQuestion = await generateInterviewQuestion(session.role);
  session.lastQuestion = nextQuestion;

  await redisClient.set(
    `session:${socketId}`,
    JSON.stringify(session)
  );

  return { evaluation, nextQuestion };
};

// ---- End Interview ----
export const endInterviewService = async (socketId) => {
  const sessionData = await redisClient.get(`session:${socketId}`);
  if (!sessionData) return null;

  const session = JSON.parse(sessionData);
  await redisClient.del(`session:${socketId}`);

  return {
    role: session.role,
    totalScore: session.totalScore,
    answers: session.answers,
  };
};

// ---- Stream Summary ----
export const streamInterviewSummary = async function* (socketId) {
  const sessionData = await redisClient.get(`session:${socketId}`);
  if (!sessionData) throw new Error("session not found.");

  const session = JSON.parse(sessionData);

  for await (const token of generateSummaryStream(session)) {
    yield token;
  }
};