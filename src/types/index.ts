export interface ProfileData {
  country: string;
  skills: string[];
  roles: string[];
  experience: number;
  preferredRoles: string[];
  jobDescription: string;
  additionalInfo: Record<string, any>;
  education?: string;
  certifications?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface Option {
  id: string;
  label: string;
  value: string;
}

export type TemplateType = 'classic' | 'modern';