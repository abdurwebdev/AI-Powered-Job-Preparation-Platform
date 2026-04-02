import { useState } from "react";
import { useInterview } from "../../../hooks/useInterview";
import ReactMarkdown from "react-markdown";

const Interview = () => {
  const {
    question,
    summary,
    evaluation,
    startInterview,
    submitAnswer,
    endInterview,
    loadingQuestion,
    loadingEvaluation,
  } = useInterview();

  const [answer, setAnswer] = useState("");

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-zinc-900 rounded-2xl shadow-xl p-6 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Interview</h1>
          <div className="flex gap-2">
            <button
              onClick={() => startInterview("Frontend")}
              disabled={loadingQuestion || !summary && question}
              className={`px-4 py-2 rounded-lg text-sm ${loadingQuestion ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loadingQuestion ? "Starting..." : "Start"}
            </button>
            <button
              onClick={endInterview}
              disabled={!question && !summary}
              className={`px-4 py-2 rounded-lg text-sm ${!question && !summary ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
            >
              End
            </button>
          </div>
        </div>

        {/* SUMMARY VIEW */}
        {summary ? (
          <div className="bg-zinc-800 p-6 rounded-xl space-y-6">
            <h2 className="text-xl font-semibold">Interview Summary</h2>
            <p><span className="font-semibold">Role:</span> {summary.role}</p>
            <p><span className="font-semibold">Total Score:</span> <span className="text-green-400">{summary.totalScore}</span></p>

            {summary.answers.map((a, i) => (
              <div key={i} className="bg-zinc-900 p-4 rounded-lg space-y-2">
                <p><b>Q:</b> {a.question}</p>
                <p><b>A:</b> {a.answer}</p>
                <p className="text-green-400"><b>Score:</b> {a.score}</p>
                <p className="text-gray-300"><b>Feedback:</b> {a.feedback}</p>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Question */}
            <div className="bg-zinc-800 p-6 rounded-xl min-h-[120px] flex flex-col items-start justify-center">
              {loadingQuestion ? (
                <p className="text-gray-400 animate-pulse">Loading question...</p>
              ) : (
                <ReactMarkdown>{question || "Click 'Start' to begin the interview."}</ReactMarkdown>
              )}
            </div>

            {/* Input */}
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-32 bg-zinc-800 p-4 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!question || loadingEvaluation}
            />

            {/* Submit */}
            <button
              onClick={() => {
                submitAnswer(answer);
                setAnswer("");
              }}
              disabled={!answer || loadingEvaluation || !question}
              className={`w-full py-3 rounded-lg text-white font-semibold ${loadingEvaluation || !answer || !question ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {loadingEvaluation ? "Evaluating..." : "Submit Answer"}
            </button>

            {/* Evaluation */}
            {evaluation && (
              <div className="bg-zinc-800 p-4 rounded-lg mt-2 border-l-4 border-green-500">
                <p className="font-semibold">Feedback:</p>
                <p>{evaluation.feedback}</p>
                <p className="text-green-400 font-semibold">Score: {evaluation.score}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Interview;