// useInterview.js
import { useEffect, useState } from "react";
import socket from "../sockets/socket";

export const useInterview = () => {
  const [question, setQuestion] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [summary, setSummary] = useState(null);

  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);

  useEffect(() => {
    socket.on("newQuestion", (q) => {
      setQuestion(q);
      setLoadingQuestion(false);
    });

    socket.on("evaluation", (e) => {
      setEvaluation(e);
      setLoadingEvaluation(false);
    });

    socket.on("interviewSummary", (data) => {
      setSummary(data);
      setQuestion("");
      setEvaluation(null);
    });

    return () => {
      socket.off("newQuestion");
      socket.off("evaluation");
      socket.off("interviewSummary");
    };
  }, []);

  const startInterview = (role) => {
    setSummary(null);
    setLoadingQuestion(true);
    socket.emit("startInterview", role);
  };

  const submitAnswer = (answer) => {
    setLoadingEvaluation(true);
    socket.emit("submitAnswer", { answer });
  };

  const endInterview = () => {
    socket.emit("endInterview");
  };

  return {
    question,
    evaluation,
    summary,
    loadingQuestion,
    loadingEvaluation,
    startInterview,
    submitAnswer,
    endInterview,
  };
};