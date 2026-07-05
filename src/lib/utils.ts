import { ProfileData } from '@/types';

/**
 * Calculates profile completeness percentage
 */
export function calculateCompleteness(profile: ProfileData): number {
  let score = 0;
  const weights = {
    country: 10,
    skills: 25,
    preferredRoles: 20,
    experience: 15,
    jobDescription: 15,
    education: 10,
    certifications: 5,
  };

  // Check country
  if (profile.country) score += weights.country;

  // Check skills (need at least 3)
  if (profile.skills.length >= 3) score += weights.skills;
  else if (profile.skills.length > 0) score += (weights.skills / 3) * profile.skills.length;

  // Check preferred roles (need at least 2)
  if (profile.preferredRoles.length >= 2) score += weights.preferredRoles;
  else if (profile.preferredRoles.length > 0) score += (weights.preferredRoles / 2) * profile.preferredRoles.length;

  // Check experience
  if (profile.experience > 0) score += weights.experience;

  // Check job description (bonus)
  if (profile.jobDescription) score += weights.jobDescription;

  // Check education
  if (profile.education) score += weights.education;

  // Check certifications
  if (profile.certifications && profile.certifications.length > 0) score += weights.certifications;

  return Math.min(Math.round(score), 100);
}

/**
 * Extracts keywords from skills and roles for ATS optimization
 */
export function extractATSKeywords(profile: ProfileData): string[] {
  const keywords = new Set<string>();

  // Add skills as keywords
  profile.skills.forEach(skill => keywords.add(skill.toLowerCase()));

  // Add role-related keywords
  profile.preferredRoles.forEach(role => {
    const roleWords = role.toLowerCase().split(/\s+/);
    roleWords.forEach(word => {
      if (word.length > 2) keywords.add(word);
    });
  });

  return Array.from(keywords);
}

/**
 * Validates if resume content is ATS-friendly
 */
export function validateATSCompliance(content: string): {
  score: number;
  suggestions: string[];
} {
  const suggestions: string[] = [];
  let score = 100;

  // Check for common ATS issues
  if (content.includes('•') || content.includes('●')) {
    score -= 10;
    suggestions.push('Replace special bullet points with standard dashes or asterisks');
  }

  if (content.length < 1000) {
    score -= 15;
    suggestions.push('Add more content - resumes should be 300-600 words');
  }

  if (!content.match(/\d+/g)) {
    score -= 20;
    suggestions.push('Add quantifiable achievements with numbers');
  }

  return { score: Math.max(score, 0), suggestions };
}