import { startInterview, submitAnswer, endInterview } from "../controllers/interview.controller.js";

export default (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("startInterview", () => startInterview(socket));
    socket.on("submitAnswer", (data) => submitAnswer(socket, data.answer));
    socket.on("endInterview", () => endInterview(socket));
  });
};