import { ChatMistralAI } from '@langchain/mistralai';
import { PromptTemplate } from '@langchain/core/prompts';

const model = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY,
  model: 'mistral-small',
});

// ---- Resume Analyzer ----
const resumePrompt = PromptTemplate.fromTemplate(`
You are an AI Resume Analyzer.

Extract:
1. Skills (array)
2. Missing Skills (array)
3. Score (0-100)

Return ONLY valid JSON:

{{
  "skills": [],
  "missingSkills": [],
  "score": number
}}

Resume:
{text}
`);

export const analyzeResumeWithAI = async (text) => {
  const formattedPrompt = await resumePrompt.format({ text });
  const response = await model.invoke(formattedPrompt);
  const content = response.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Error fetching response");
  return JSON.parse(jsonMatch[0]);
};

// ---- Job Match Feedback ----
const jobMatchPrompt = PromptTemplate.fromTemplate(`
Resume Skills: {skills}
Job Skills: {requiredSkills}

Give:
1. Fit Level (Strong / Moderate / Weak)
2. Reason
3. Missing Skills Improvement
4. Final Verdict (Short e.g 'Highly Recommended' / 'Recommended' / 'Not Recommended')

Return JSON format only

{{
  "fitLevel": "string",
  "reason": "string",
  "missingSkillsImprovement": "string",
  "finalVerdict": "string"
}}
`);

export const generateJobMatchFeedback = async (skills, requiredSkills) => {
  const formattedPrompt = await jobMatchPrompt.format({ skills, requiredSkills });
  const response = await model.invoke(formattedPrompt);
  const content = response.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Error fetching response");
  return JSON.parse(jsonMatch[0]);
};

// ---- Interview Question Generator ----
const questionPrompt = PromptTemplate.fromTemplate(`
You are an AI interviewer for the role: {role}.
Generate exactly one short interview question for this role.
The question must fit in one sentence.
Do not ask for code implementation, only conceptual or knowledge-based questions.
Example format: "What is the difference between relative, absolute, and fixed positioning in CSS?"
`);

export const generateInterviewQuestion = async (role) => {
  const formattedPrompt = await questionPrompt.format({ role });
  const response = await model.invoke(formattedPrompt);
  return response.content;
};

// ---- Answer Evaluator ----
const evaluatePrompt = PromptTemplate.fromTemplate(`
You are an AI evaluator for a {role} interview.
Question: {question}
Candidate Answer: {answer}

Evaluate the answer:
1. Score (0-100)
2. Feedback
3. Suggestions for improvement

Return as valid JSON string:
{{ 
"score":"number",
"feedback":"string",
"improvement":"string"
}}
`);

export const evaluateAnswer = async ({ role, question, answer }) => {
  const formattedPrompt = await evaluatePrompt.format({ role, question, answer });
  const response = await model.invoke(formattedPrompt);
  const content = response.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Error fetching response");
  return JSON.parse(jsonMatch[0]);
};

// ---- Summary Stream (async generator) ----
export const generateSummaryStream = async function* (session) {
  const response = await model.stream({
    messages: [
      { role: "system", content: `Give a detailed summary for this interview session: ${JSON.stringify(session)}` }
    ]
  });

  for await (const token of response) yield token;
};

// ---- Optional: Question & Answer Streams ----
export const generateQuestionStream = generateSummaryStream; // alias for example
export const evaluateAnswerStream = generateSummaryStream;   // alias for example