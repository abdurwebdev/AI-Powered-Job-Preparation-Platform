import {ChatMistralAI} from '@langchain/mistralai';
import {PromptTemplate} from '@langchain/core/prompts'

const model = new ChatMistralAI({
  apiKey:process.env.MISTRAL_API_KEY,
  model:'mistral-small',
})

const prompt = PromptTemplate.fromTemplate(`
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
  `)

export const analyzeResumeWithAI = async (text) =>{
  const formattedPrompt = await prompt.format({text});

  const response = await model.invoke(formattedPrompt);

  const content = response.content;

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if(!jsonMatch) throw new Error("Error fetching response");

  return JSON.parse(jsonMatch[0]);

}

const prompttwo = PromptTemplate.fromTemplate(`
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
  `)


export const generateJobMatchFeedback = async (skills,requiredSkills)=>{
    
  const formattedPrompt = await prompttwo.format({skills,requiredSkills});

  const response = await model.invoke(formattedPrompt);

  const content = response.content;

  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if(!jsonMatch) throw new Error("Error fetching response");

  return JSON.parse(jsonMatch[0]);


}