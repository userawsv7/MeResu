import React from 'react';
import { ProfileData, TemplateType } from '@/types';

interface ResumePreviewProps {
  content: string;
  template: TemplateType;
  profile: ProfileData;
}

export default function ResumePreview({ content, template, profile }: ResumePreviewProps) {
  const sections = content.split('\n\n');

  if (template === 'classic') {
    return (
      <div id="resume-preview" className="resume-preview bg-white p-8 text-black font-serif max-w-[210mm] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-wide">PROFESSIONAL NAME</h1>
          <p className="text-sm mt-2 text-gray-600">
            {profile.preferredRoles[0]} | {profile.country} | {profile.experience}+ Years Experience
          </p>
        </div>

        {sections.map((section, index) => (
          <div key={index} className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-widest border-b-2 border-gray-800 pb-1 mb-3">
              {section.split('\n')[0]}
            </h2>
            <div className="text-sm whitespace-pre-wrap leading-relaxed text-gray-700">
              {section.split('\n').slice(1).join('\n')}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div id="resume-preview" className="resume-preview bg-white p-8 max-w-[210mm] mx-auto" style={{ fontFamily: 'system-ui' }}>
      <div className="mb-8 pb-6 border-b-4" style={{ borderColor: '#0ea5e9' }}>
        <h1 className="text-4xl font-bold text-gray-900">Professional Resume</h1>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
          <span>📍 {profile.country}</span>
          <span>💼 {profile.experience}+ Years</span>
          <span>🎯 {profile.preferredRoles.join(', ')}</span>
        </div>
      </div>

      {sections.map((section, index) => {
        const lines = section.split('\n');
        const title = lines[0];

        return (
          <div key={index} className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: '#0ea5e9' }} />
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            </div>
            <div className="pl-6 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {lines.slice(1).join('\n')}
            </div>
          </div>
        );
      })}

      <div className="mt-8 pt-6 border-t text-xs text-gray-500">
        Optimized for ATS • Keywords: {profile.skills.slice(0, 5).join(', ')}
      </div>
    </div>
  );
}