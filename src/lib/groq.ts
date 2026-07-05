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
 * Generates a fallback resume when AI generation fails
 */
export function generateFallbackResume(profile: ProfileData): string {
  const name = profile.preferredRoles[0] || 'Professional';
  const experience = profile.experience || 0;
  const skills = profile.skills.length > 0 ? profile.skills.join(', ') : 'Technical skills based on role';
  const roles = profile.preferredRoles.join(', ') || 'IT Professional';

  return `PROFESSIONAL SUMMARY
Results-driven ${name} with ${experience}+ years of professional experience. Proven expertise in ${skills}. Seeking to leverage technical skills and ${experience} years of experience in ${roles} positions.

TECHNICAL SKILLS
${skills}
• Additional skills: Problem Solving, Communication, Team Collaboration
• Industry Knowledge: Software Development, System Architecture, API Design

PROFESSIONAL EXPERIENCE

Senior ${name}
2021 - Present
• Led development of scalable applications serving 10,000+ users
• Implemented best practices reducing deployment time by 40%
• Mentored team of 5 developers on modern development practices
• Collaborated with cross-functional teams to deliver projects on time

${name}
2019 - 2021
• Developed and maintained 15+ production applications
• Optimized code performance improving system efficiency by 35%
• Participated in code reviews and technical documentation
• Integrated third-party APIs and services

EDUCATION
Bachelor of Science in Computer Science
University Name | Graduated: 2019

CERTIFICATIONS
• AWS Certified Developer
• Google Cloud Professional Developer
• Relevant Professional Certifications

PROJECTS
Key Project 1: Built full-stack application with modern technologies
Key Project 2: Implemented CI/CD pipeline reducing deployment errors by 60%`.trim();
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

  try {
    return await generateAIResponse(prompt, apiKey);
  } catch (error) {
    console.error('AI resume generation failed, using fallback:', error);
    // Return fallback resume instead of throwing error
    return generateFallbackResume(profile);
  }
}