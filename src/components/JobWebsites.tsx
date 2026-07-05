import React from 'react';

interface JobWebsitesProps {
  country: string;
}

interface JobSite {
  name: string;
  url: string;
  description: string;
  popular: boolean;
}

const JOB_SITES_BY_COUNTRY: Record<string, JobSite[]> = {
  'United States': [
    { name: 'LinkedIn', url: 'https://linkedin.com/jobs', description: 'World\'s largest professional network', popular: true },
    { name: 'Indeed', url: 'https://indeed.com', description: 'Comprehensive job search engine', popular: true },
    { name: 'Glassdoor', url: 'https://glassdoor.com', description: 'Jobs with company reviews', popular: true },
    { name: 'Dice', url: 'https://dice.com', description: 'Tech-focused job board', popular: false },
    { name: 'Stack Overflow Jobs', url: 'https://stackoverflow.com/jobs', description: 'Developer-focused opportunities', popular: false },
    { name: 'AngelList', url: 'https://angel.co/jobs', description: 'Startup and tech jobs', popular: false },
  ],
  'United Kingdom': [
    { name: 'LinkedIn', url: 'https://linkedin.com/jobs', description: 'Professional networking & jobs', popular: true },
    { name: 'Indeed UK', url: 'https://uk.indeed.com', description: 'Leading UK job site', popular: true },
    { name: 'Reed', url: 'https://reed.co.uk', description: 'UK\'s largest job site', popular: true },
    { name: 'CWJobs', url: 'https://cwjobs.co.uk', description: 'IT & tech specialist jobs', popular: false },
    { name: 'Totaljobs', url: 'https://totaljobs.com', description: 'Major UK recruitment site', popular: false },
  ],
  'Canada': [
    { name: 'LinkedIn', url: 'https://linkedin.com/jobs', description: 'Global professional network', popular: true },
    { name: 'Indeed Canada', url: 'https://ca.indeed.com', description: 'Leading Canadian job portal', popular: true },
    { name: 'Workopolis', url: 'https://workopolis.com', description: 'Canadian job search portal', popular: true },
    { name: 'Monster.ca', url: 'https://monster.ca', description: 'Global job opportunities in Canada', popular: false },
  ],
  'default': [
    { name: 'LinkedIn', url: 'https://linkedin.com/jobs', description: 'Global professional network', popular: true },
    { name: 'Indeed', url: 'https://indeed.com', description: 'Worldwide job opportunities', popular: true },
    { name: 'Glassdoor', url: 'https://glassdoor.com', description: 'Jobs and company insights', popular: true },
    { name: 'Monster', url: 'https://monster.com', description: 'Global job search platform', popular: false },
    { name: 'CareerBuilder', url: 'https://careerbuilder.com', description: 'Comprehensive job listings', popular: false },
  ]
};

export default function JobWebsites({ country }: JobWebsitesProps) {
  const sites = JOB_SITES_BY_COUNTRY[country] || JOB_SITES_BY_COUNTRY['default'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        🌐 Recommended Job Websites for {country}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        These platforms are widely used and trusted by millions of job seekers worldwide
      </p>

      <div className="space-y-3">
        {sites.map((site, index) => (
          <a
            key={index}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 group-hover:text-primary-600">
                    {site.name}
                  </span>
                  {site.popular && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{site.description}</p>
              </div>
              <span className="text-primary-500 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700">
          💡 Pro tip: Apply through multiple platforms and customize your resume for each job application for the best results!
        </p>
      </div>
    </div>
  );
}