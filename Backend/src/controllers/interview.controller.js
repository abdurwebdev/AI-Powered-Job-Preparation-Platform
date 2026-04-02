import * as interviewService from "../services/interview.service.js";

export const startInterview = async (socket) => {
  await interviewService.streamQuestion(socket);
};

export const submitAnswer = async (socket, answer) => {
  await interviewService.streamEvaluation(socket, answer);
};

export const endInterview = async (socket) => {
  await interviewService.streamSummary(socket);
};