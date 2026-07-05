'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, RefreshCw, CheckCircle, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ResumePreview from '@/components/ResumePreview';
import JobWebsites from '@/components/JobWebsites';
import { ProfileData, Message, Option } from '@/types';
import { generateAIResponse, generateResume } from '@/lib/groq';
import { calculateCompleteness } from '@/lib/utils';

const INITIAL_QUESTIONS = [
  "Hello! I'm Me-Resu, your AI resume coach. I'll help you create an ATS-optimized, professional resume that passes any screening. Ready? Let's start! What's your country?",
];

const COUNTRY_OPTIONS: Option[] = [
  { id: 'us', label: '🇺🇸 United States', value: 'United States' },
  { id: 'uk', label: '🇬🇧 United Kingdom', value: 'United Kingdom' },
  { id: 'ca', label: '🇨🇦 Canada', value: 'Canada' },
  { id: 'au', label: '🇦🇺 Australia', value: 'Australia' },
  { id: 'de', label: '🇩🇪 Germany', value: 'Germany' },
  { id: 'in', label: '🇮🇳 India', value: 'India' },
  { id: 'sg', label: '🇸🇬 Singapore', value: 'Singapore' },
  { id: 'other', label: '🌍 Other', value: 'other' },
];

export default function MeResu() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: INITIAL_QUESTIONS[0] }
  ]);
  const [input, setInput] = useState('');
  const [currentOptions, setCurrentOptions] = useState<Option[]>(COUNTRY_OPTIONS);
  const [profile, setProfile] = useState<ProfileData>({
    country: '',
    skills: [],
    roles: [],
    experience: 0,
    preferredRoles: [],
    jobDescription: '',
    additionalInfo: {},
  });
  const [currentStep, setCurrentStep] = useState<'country' | 'email' | 'skills' | 'education' | 'experience' | 'roles' | 'preferred-roles' | 'summary' | 'confirm' | 'complete' | 'template'>('country');
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern'>('classic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [resumeContent, setResumeContent] = useState('');
  const [showJobSites, setShowJobSites] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const addMessage = (content: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleOptionSelect = async (option: Option) => {
    addMessage(option.label, 'user');
    setCurrentOptions([]);

    switch (currentStep) {
      case 'country':
        handleCountrySelection(option);
        break;
      case 'email':
        // Email handled via text input
        break;
      case 'skills':
        await handleSkillSelection(option);
        break;
      case 'education':
        await handleEducationSelection(option);
        break;
      case 'experience':
        await handleExperienceSelection(option);
        break;
      case 'roles':
        await handleRoleSelection(option);
        break;
      case 'preferred-roles':
        await handlePreferredRoleSelection(option);
        break;
      case 'summary':
        await handleSummarySelection(option);
        break;
      case 'confirm':
        await handleConfirmSelection(option);
        break;
      case 'complete':
        handleFinalOption(option);
        break;
    }
  };

  const handleCountrySelection = (option: Option) => {
    const country = option.value === 'other' ? 'your country' : option.value;
    setProfile(prev => ({ ...prev, country: option.value }));

    const nextMessage = `Perfect! 📍 Now, what's your email address? (We'll add it to your resume header)`;
    addMessage(nextMessage, 'assistant');
    setCurrentStep('email');
  };

  const handleEmailInput = (email: string) => {
    setProfile(prev => ({ ...prev, email }));
    addMessage(`Thanks! 📧 Now let's collect your skills. Select 1-4 skills that best represent you:`, 'assistant');

    const skillsOptions: Option[] = [
      { id: 'js', label: 'JavaScript/TypeScript', value: 'JavaScript/TypeScript' },
      { id: 'py', label: 'Python', value: 'Python' },
      { id: 'java', label: 'Java', value: 'Java' },
      { id: 'react', label: 'React.js', value: 'React.js' },
      { id: 'node', label: 'Node.js', value: 'Node.js' },
      { id: 'aws', label: 'AWS', value: 'AWS' },
      { id: 'sql', label: 'SQL/NoSQL', value: 'SQL/NoSQL' },
      { id: 'devops', label: 'DevOps/CI-CD', value: 'DevOps' },
      { id: 'ml', label: 'Machine Learning/AI', value: 'Machine Learning' },
      { id: 'other', label: '➕ Other (type custom)', value: 'other' },
      { id: 'proceed', label: '✅ Proceed with selected skills', value: 'proceed' },
      { id: 'skip', label: '⏭️ Skip to next step', value: 'skip' },
    ];
    setCurrentOptions(skillsOptions);
    setCurrentStep('skills');
  };

  const handleEducationSelection = async (option: Option) => {
    if (option.value !== 'skip' && option.value !== 'skip-edu') {
      setProfile(prev => ({ ...prev, education: option.value }));
    }

    addMessage("Excellent! 🎓 How many years of professional experience?", 'assistant');

    const expOptions: Option[] = [
      { id: '0-1', label: '0-1 years (Entry Level)', value: '0-1' },
      { id: '1-3', label: '1-3 years (Junior)', value: '1-3' },
      { id: '3-5', label: '3-5 years (Mid-level)', value: '3-5' },
      { id: '5-8', label: '5-8 years (Senior)', value: '5-8' },
      { id: '8+', label: '8+ years (Lead/Principal)', value: '8+' },
      { id: 'skip-exp', label: '⏭️ Skip', value: 'skip' },
    ];
    setCurrentOptions(expOptions);
    setCurrentStep('experience');
  };

  const handleSkillSelection = async (option: Option) => {
    if (option.value === 'other') {
      addMessage("Please type your additional skills (comma-separated):", 'assistant');
      setCurrentOptions([]);
      return;
    }

    if (option.value === 'skip') {
      addMessage("Moving to education. What's your highest education level?", 'assistant');
      const educationOptions: Option[] = [
        { id: 'hs', label: 'High School', value: 'High School' },
        { id: 'bs', label: 'Bachelor\'s Degree', value: 'Bachelor\'s Degree' },
        { id: 'ms', label: 'Master\'s Degree', value: 'Master\'s Degree' },
        { id: 'phd', label: 'PhD/Doctorate', value: 'PhD/Doctorate' },
        { id: 'other-edu', label: '➕ Other', value: 'other' },
        { id: 'skip-edu', label: '⏭️ Skip', value: 'skip' },
      ];
      setCurrentOptions(educationOptions);
      setCurrentStep('education');
      return;
    }

    if (option.value === 'proceed') {
      // Allow proceeding with any number of skills including 0
      addMessage(`Great! Selected ${profile.skills.length} skills. Now, what's your education level?`, 'assistant');
      const educationOptions: Option[] = [
        { id: 'hs', label: 'High School', value: 'High School' },
        { id: 'bs', label: 'Bachelor\'s Degree', value: 'Bachelor\'s Degree' },
        { id: 'ms', label: 'Master\'s Degree', value: 'Master\'s Degree' },
        { id: 'phd', label: 'PhD/Doctorate', value: 'PhD/Doctorate' },
        { id: 'other-edu', label: '➕ Other', value: 'other' },
        { id: 'skip-edu', label: '⏭️ Skip', value: 'skip' },
      ];
      setCurrentOptions(educationOptions);
      setCurrentStep('education');
      return;
    }

    const updatedSkills = [...profile.skills, option.value];
    setProfile(prev => ({ ...prev, skills: updatedSkills }));

    if (updatedSkills.length < 4) {
      const remainingOptions = currentOptions.filter(o => o.id !== option.id && o.value !== 'proceed');
      // Add proceed option after first skill
      if (updatedSkills.length >= 1) {
        remainingOptions.push({ id: 'proceed', label: '✅ Proceed with these skills', value: 'proceed' });
      }
      setCurrentOptions(remainingOptions);
    } else {
      addMessage(`Perfect! ${updatedSkills.length} skills collected. Now education:`, 'assistant');
      const educationOptions: Option[] = [
        { id: 'hs', label: 'High School', value: 'High School' },
        { id: 'bs', label: 'Bachelor\'s Degree', value: 'Bachelor\'s Degree' },
        { id: 'ms', label: 'Master\'s Degree', value: 'Master\'s Degree' },
        { id: 'phd', label: 'PhD/Doctorate', value: 'PhD/Doctorate' },
        { id: 'other-edu', label: '➕ Other', value: 'other' },
      ];
      setCurrentOptions(educationOptions);
      setCurrentStep('education');
    }
  };

  const handleExperienceSelection = async (option: Option) => {
    if (option.value !== 'skip') {
      const expYears = parseInt(option.value.split('-')[0]) || parseInt(option.value);
      setProfile(prev => ({ ...prev, experience: expYears }));
    }

    addMessage("Great! 💼 Based on your skills, here are target roles. Select preferred:", 'assistant');

    // Generate role suggestions based on skills
    const skillBasedRoles: Option[] = [
      { id: 'se', label: 'Software Engineer', value: 'Software Engineer' },
      { id: 'fsd', label: 'Full Stack Developer', value: 'Full Stack Developer' },
      { id: 'fe', label: 'Frontend Developer', value: 'Frontend Developer' },
      { id: 'be', label: 'Backend Developer', value: 'Backend Developer' },
      { id: 'da', label: 'Data Analyst', value: 'Data Analyst' },
      { id: 'de', label: 'DevOps Engineer', value: 'DevOps Engineer' },
      { id: 'other-role', label: '➕ Other (type role)', value: 'other' },
      { id: 'proceed-roles', label: '✅ Proceed with selections', value: 'proceed' },
      { id: 'skip-roles', label: '⏭️ Skip role selection', value: 'skip' },
    ];
    setCurrentOptions(skillBasedRoles);
    setCurrentStep('roles');
  };

  const handleRoleSelection = async (option: Option) => {
    if (option.value === 'other') {
      addMessage("Type your target role:", 'assistant');
      setCurrentOptions([]);
      return;
    }

    if (option.value === 'skip') {
      addMessage("What are your preferred roles to target? (For tailoring)", 'assistant');
      const prefOptions: Option[] = [
        { id: 'pref-se', label: 'Software Engineer', value: 'Software Engineer' },
        { id: 'pref-fsd', label: 'Full Stack Developer', value: 'Full Stack Developer' },
        { id: 'pref-fe', label: 'Frontend Developer', value: 'Frontend Developer' },
        { id: 'pref-be', label: 'Backend Developer', value: 'Backend Developer' },
        { id: 'pref-other', label: '➕ Other', value: 'other' },
        { id: 'skip-pref', label: '⏭️ Skip', value: 'skip' },
      ];
      setCurrentOptions(prefOptions);
      setCurrentStep('preferred-roles');
      return;
    }

    if (option.value === 'proceed') {
      addMessage("Would you like to specify preferred target roles?", 'assistant');
      const prefOptions: Option[] = [
        { id: 'pref-se', label: 'Software Engineer', value: 'Software Engineer' },
        { id: 'pref-fsd', label: 'Full Stack Developer', value: 'Full Stack Developer' },
        { id: 'pref-fe', label: 'Frontend Developer', value: 'Frontend Developer' },
        { id: 'pref-be', label: 'Backend Developer', value: 'Backend Developer' },
        { id: 'pref-other', label: '➕ Other', value: 'other' },
        { id: 'skip-pref', label: '⏭️ Skip', value: 'skip' },
      ];
      setCurrentOptions(prefOptions);
      setCurrentStep('preferred-roles');
      return;
    }

    const updatedRoles = [...profile.roles, option.value];
    setProfile(prev => ({ ...prev, roles: updatedRoles }));

    const remainingOptions = currentOptions.filter(o => o.id !== option.id);
    // Add proceed option after first role
    if (!remainingOptions.find(o => o.value === 'proceed')) {
      remainingOptions.push({ id: 'proceed-roles', label: '✅ Proceed', value: 'proceed' });
    }
    setCurrentOptions(remainingOptions);
  };

  const handlePreferredRoleSelection = async (option: Option) => {
    if (option.value === 'other') {
      addMessage("Type your preferred role:", 'assistant');
      setCurrentOptions([]);
      return;
    }

    if (option.value !== 'skip') {
      const updatedPref = [...profile.preferredRoles, option.value];
      setProfile(prev => ({ ...prev, preferredRoles: updatedPref }));
    }

    addMessage("Would you like to add a professional summary or let AI generate one?", 'assistant');
    const summaryOptions: Option[] = [
      { id: 'ai-summary', label: '🤖 Let AI Generate Summary', value: 'ai' },
      { id: 'custom-summary', label: '✍️ Type Custom Summary', value: 'custom' },
      { id: 'skip-summary', label: '⏭️ Skip Summary', value: 'skip' },
    ];
    setCurrentOptions(summaryOptions);
    setCurrentStep('summary');
  };

  const handleSummarySelection = async (option: Option) => {
    if (option.value === 'custom') {
      addMessage("Please type your professional summary (2-3 sentences):", 'assistant');
      setCurrentOptions([]);
      return;
    }

    if (option.value === 'ai') {
      addMessage("AI will generate a compelling summary using your profile data. Generating resume...", 'assistant');
    }

    // Generate resume with collected data
    await generateFinalResume();
  };

  const handleConfirmSelection = async (option: Option) => {
    // Show final confirmation options
    if (option.value === 'edit') {
      addMessage("What would you like to change?", 'assistant');
      setCurrentOptions([]);
      return;
    }
    await generateFinalResume();
  };

  const generateFinalResume = async () => {
    setIsGenerating(true);
    addMessage("Generating your ATS-optimized resume...", 'assistant');

    try {
      const resume = await generateResume(profile, process.env.NEXT_PUBLIC_GROQ_API_KEY || '');
      setResumeContent(resume);
      setShowPreview(true);

      const completeness = calculateCompleteness(profile);
      addMessage(`Your resume is ${completeness}% complete. Preview is ready! Would you like to download or make changes?`, 'assistant');

      const finalOptions: Option[] = [
        { id: 'download', label: '📥 Download Resume (PDF)', value: 'download' },
        { id: 'change-template', label: '🎨 Change Template', value: 'template' },
        { id: 'job-sites', label: '🌐 View Job Websites', value: 'jobs' },
        { id: 'edit', label: '✏️ Edit Resume', value: 'edit' },
      ];
      setCurrentOptions(finalOptions);
      setCurrentStep('complete');
    } catch (error) {
      // Fallback is now handled in generateResume, so this should rarely trigger
      const fallbackContent = `PROFESSIONAL SUMMARY
Results-driven professional with ${profile.experience || 0}+ years of experience.

SKILLS
${profile.skills.join(', ') || 'Technical skills'}

EXPERIENCE
Professional experience in ${profile.preferredRoles.join(', ') || 'IT roles'}.`;
      setResumeContent(fallbackContent);
      setShowPreview(true);
      addMessage("Your basic resume template is ready. You can customize it further.", 'assistant');
    }
    setIsGenerating(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    addMessage(userInput, 'user');
    setInput('');

    if (currentStep === 'skills' && profile.skills.length === 0) {
      const skills = userInput.split(',').map(s => s.trim());
      setProfile(prev => ({ ...prev, skills }));

      addMessage("Based on your skills, generating role suggestions...", 'assistant');
      setIsGenerating(true);

      try {
        const roles = await generateAIResponse(
          `Based on these skills: ${skills.join(', ')}, suggest 6 relevant IT job roles. Return only the role names separated by commas.`,
          process.env.NEXT_PUBLIC_GROQ_API_KEY || ''
        );

        const roleOptions: Option[] = roles.split(',').slice(0, 6).map((role, index) => ({
          id: `role-${index}`,
          label: role.trim(),
          value: role.trim(),
        }));
        roleOptions.push({ id: 'other-role', label: '➕ Other (type your roles)', value: 'other' });

        setCurrentOptions(roleOptions);
        setCurrentStep('roles');
      } catch (error) {
        const defaultRoles: Option[] = [
          { id: 'se', label: 'Software Engineer', value: 'Software Engineer' },
          { id: 'fsd', label: 'Full Stack Developer', value: 'Full Stack Developer' },
          { id: 'fe', label: 'Frontend Developer', value: 'Frontend Developer' },
          { id: 'be', label: 'Backend Developer', value: 'Backend Developer' },
          { id: 'da', label: 'Data Analyst', value: 'Data Analyst' },
          { id: 'de', label: 'DevOps Engineer', value: 'DevOps Engineer' },
          { id: 'other-role', label: '➕ Other', value: 'other' },
        ];
        setCurrentOptions(defaultRoles);
        setCurrentStep('roles');
      }
      setIsGenerating(false);
    } else if (currentStep === 'roles') {
      const roles = userInput.split(',').map(r => r.trim());
      setProfile(prev => ({ ...prev, preferredRoles: roles }));

      addMessage("How many years of experience do you have?", 'assistant');
      const expOptions: Option[] = [
        { id: '0-1', label: '0-1 years (Entry Level)', value: '0-1' },
        { id: '1-3', label: '1-3 years (Junior)', value: '1-3' },
        { id: '3-5', label: '3-5 years (Mid-level)', value: '3-5' },
        { id: '5-8', label: '5-8 years (Senior)', value: '5-8' },
        { id: '8+', label: '8+ years (Lead/Principal)', value: '8+' },
      ];
      setCurrentOptions(expOptions);
      setCurrentStep('experience');
    } else if (currentStep === 'template') {
      setProfile(prev => ({ ...prev, jobDescription: userInput }));
      await generateFinalResume();
    }
  };

  const handleDownload = () => {
    const element = document.getElementById('resume-preview');
    if (element) {
      import('html2pdf.js').then(html2pdf => {
        const opt = {
          margin: 0.5,
          filename: `resume-${profile.preferredRoles[0]?.toLowerCase().replace(/\s+/g, '-') || 'professional'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        (html2pdf as any).default().from(element).set(opt).save();
      });
    }
  };

  const handleCopyToClipboard = async () => {
    if (resumeContent) {
      try {
        await navigator.clipboard.writeText(resumeContent);
        toast.success('Resume copied to clipboard!');
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = resumeContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Resume copied to clipboard!');
      }
    }
  };

  const resetChat = () => {
    setMessages([{ id: '1', role: 'assistant', content: INITIAL_QUESTIONS[0] }]);
    setProfile({
      country: '',
      skills: [],
      roles: [],
      experience: 0,
      preferredRoles: [],
      jobDescription: '',
      additionalInfo: {},
    });
    setCurrentStep('country');
    setCurrentOptions(COUNTRY_OPTIONS);
    setShowPreview(false);
    setResumeContent('');
    setShowJobSites(false);
  };

  const handleFinalOption = (option: Option) => {
    switch (option.value) {
      case 'download':
        handleDownload();
        break;
      case 'template':
        setSelectedTemplate(selectedTemplate === 'classic' ? 'modern' : 'classic');
        break;
      case 'jobs':
        setShowJobSites(true);
        break;
      case 'edit':
        addMessage("Sure! What would you like to change in your resume?", 'assistant');
        setCurrentOptions([]);
        break;
    }
  };

  const completeness = calculateCompleteness(profile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Me-Resu</h1>
                <p className="text-xs text-gray-500">AI Resume Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {profile.country && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Profile: {completeness}%</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all duration-300"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </div>
              )}
              <button
                onClick={resetChat}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Reset conversation"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[700px]">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Chat with Me-Resu</h2>
              <p className="text-sm text-gray-500">Just select options or type when needed</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="chat-bubble-ai">
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse">Thinking...</div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {currentOptions.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Select an option:</p>
                <div className="flex flex-wrap gap-2">
                  {currentOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option)}
                      className="option-button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type here or select an option above..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 text-sm"
                  disabled={isGenerating}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isGenerating}
                  className="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Select options above for easy input. Type only when "Other" is selected.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {showPreview && resumeContent ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Resume Preview</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTemplate(selectedTemplate === 'classic' ? 'modern' : 'classic')}
                      className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Switch to {selectedTemplate === 'classic' ? 'Modern' : 'Classic'}
                    </button>
                    <button
                      onClick={handleCopyToClipboard}
                      className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <Copy size={16} /> Copy Text
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      <Download size={16} /> Download PDF
                    </button>
                  </div>
                </div>
                <div className="max-h-[550px] overflow-y-auto resume-container">
                  <ResumePreview
                    content={resumeContent}
                    template={selectedTemplate}
                    profile={profile}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Your Resume Will Appear Here</h3>
                <p className="text-gray-500 text-sm">
                  Complete the conversation to generate your ATS-optimized resume
                </p>
              </div>
            )}

            {showJobSites && <JobWebsites country={profile.country} />}
          </div>
        </div>
      </div>
    </div>
  );
}