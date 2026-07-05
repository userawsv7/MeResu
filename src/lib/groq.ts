import Groq from 'groq-sdk';
import { ProfileData } from '@/types';

const SYSTEM_PROMPT = `You are Me-Resu, an expert AI resume assistant specializing in ATS-optimized resumes for IT professionals. Your goal is to create resumes that:
1. Pass any ATS system by using relevant keywords naturally
2. Are tailored to the candidate's skills and target roles
3. Follow professional formatting standards
4. Include quantifiable achievements when possible
5. Use industry-standard job titles and skills terminology

Always suggest improvements and generate content that maximizes job match scores.`;

/**
 * Generates AI response using Groq API
 */
export async function generateAIResponse(prompt: string, apiKey: string): Promise<string> {
  try {
    const groq = new Groq({
      apiKey: apiKey || process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to generate AI response');
  }
}

/**
 * Generates a complete ATS-optimized resume based on profile
 */
export async function generateResume(profile: ProfileData, apiKey: string): Promise<string> {
  const prompt = `Create an ATS-optimized professional resume for an IT professional with the following details:

Country: ${profile.country}
Skills: ${profile.skills.join(', ')}
Experience: ${profile.experience} years
Preferred Roles: ${profile.preferredRoles.join(', ')}
${profile.jobDescription ? `Target Job Description: ${profile.jobDescription}` : ''}

Requirements:
1. Start with a compelling professional summary optimized for ATS
2. Create a skills section with both technical and soft skills
3. Generate 3-4 impactful work experience entries with quantifiable achievements
4. Include relevant certifications and education placeholders
5. Use keywords from the skills and target roles naturally throughout
6. Format it professionally with clear section headers
7. Ensure it will pass ATS screening tests

Return the resume content in a clean, structured format without markdown formatting.`;

  return generateAIResponse(prompt, apiKey);
}