import { endInterviewService, startInterviewService, submitAnswerService } from "../services/interview.service.js"

export const handleInterviewSocket = async (socket) => {

  socket.on("startInterview", async (role) => {
    const question = await startInterviewService(socket.id, role);
    socket.emit("newQuestion", question);
  });

  socket.on("submitAnswer", async ({ answer }) => {
    const { evaluation, nextQuestion } = await submitAnswerService(socket.id, answer);
    socket.emit("evaluation", evaluation);
    socket.emit("newQuestion", nextQuestion);
  });

  socket.on("endInterview", async () => {
    const summary = await endInterviewService(socket.id);
    if (summary) socket.emit("interviewSummary", summary);
  });

  socket.on("disconnect", async () => {
    await endInterviewService(socket.id);
  });
};