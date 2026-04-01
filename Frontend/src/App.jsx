import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";

const socket = io("http://localhost:5000");

const App = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [interviewStarted, setInterviewStarted] = useState(false);

  useEffect(() => {
    socket.on("newQuestion", (q) => {
      setQuestion(q);
      setAnswer("");
      setLoading(false);
    });

    socket.on("evaluation", (evalData) => {
      setEvaluation(evalData);
      setLoading(false);
    });

    socket.on("interviewSummary", (data) => {
      console.log("Summary:", data);
      setLoading(false);
      alert(`Interview Finished! Total Score: ${data.totalScore}`);
      setInterviewStarted(false);
      setQuestion("");
      setAnswer("");
      setEvaluation(null);
    });

    return () => {
      socket.off("newQuestion");
      socket.off("evaluation");
      socket.off("interviewSummary");
    };
  }, []);

  const startInterview = () => {
    setLoading(true);
    socket.emit("startInterview", "Frontend Developer");
    setInterviewStarted(true);
  };

  const submitAnswer = () => {
    if (!answer.trim()) return;
    setLoading(true);
    socket.emit("submitAnswer", { answer });
  };

  const endInterview = () => {
    setLoading(true);
    socket.emit("endInterview");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
          AI Interview
        </h1>

        {!interviewStarted ? (
          <button
            onClick={startInterview}
            className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded hover:bg-indigo-700 transition"
          >
            {loading ? "Loading..." : "Start Interview"}
          </button>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Question:
              </h3>
              <div className="p-4 bg-gray-100 rounded text-gray-800 prose prose-indigo max-w-full">
                <ReactMarkdown>
                  {question || "Loading question..."}
                </ReactMarkdown>
              </div>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Your Answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="flex justify-between gap-2">
              <button
                onClick={submitAnswer}
                className="flex-1 bg-green-500 text-white font-semibold py-2 rounded hover:bg-green-600 transition"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Answer"}
              </button>

              <button
                onClick={endInterview}
                className="flex-1 bg-red-500 text-white font-semibold py-2 rounded hover:bg-red-600 transition"
                disabled={loading}
              >
                {loading ? "Ending..." : "End Interview"}
              </button>
            </div>

            {evaluation && (
              <div className="mt-6 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded">
                <p className="font-semibold text-indigo-700">Score: {evaluation.score}</p>
                <p className="text-gray-800">{evaluation.feedback}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;