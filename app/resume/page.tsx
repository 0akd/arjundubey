"use client"
import React, { useState, useRef, useEffect } from 'react';
import {  ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { Plus, Minus, Download, Eye, Edit3, Save, Trash2, Calendar, MapPin, Phone, Mail, Github, Linkedin, Globe } from 'lucide-react';


interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

interface Education {
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

interface Project {
  name: string;
  technologies: string;
  startDate: string;
  endDate: string;
  description: string[];
  link?: string;
}

interface Skills {
  languages: string[];
  frameworks: string[];
  tools: string[];
  libraries: string[];
}

interface ResumeData {
  personal: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skills;
}

const ResumePage = ({ children }: { children: React.ReactNode }) => (
  <div className="w-[8.5in] min-h-[11in] bg-white pt-0 px-8 pb-8 shadow-lg font-serif mx-auto mb-8 relative print:pt-0 print:px-8 print:pb-4 print:shadow-none print:mb-0">
    {children}
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="border-b-2 border-black mb-3">
    <h2 className="text-lg font-bold uppercase tracking-wide">{title}</h2>
  </div>
);

const URLResumeGenerator = () => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUrlBuilder, setShowUrlBuilder] = useState(false);
  const [sampleUrl, setSampleUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const resumeRef = useRef<HTMLDivElement>(null);

  // Default sample data for URL builder
  const sampleData: ResumeData = {
    personal: {
      name: 'John Doe',
      title: 'Software Engineer',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
      website: 'johndoe.dev'
    },
    education: [{
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science in Computer Science',
      location: 'Berkeley, CA',
      startDate: 'Aug 2018',
      endDate: 'May 2022'
    }],
    experience: [{
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      startDate: 'Jan 2023',
      endDate: 'Present',
      responsibilities: [
        'Led development of microservices architecture serving 1M+ users',
        'Implemented CI/CD pipeline reducing deployment time by 60%',
        'Mentored 3 junior developers and conducted code reviews'
      ]
    }],
    projects: [{
      name: 'TaskMaster Pro',
      technologies: 'React, Node.js, PostgreSQL, Docker',
      startDate: 'Mar 2023',
      endDate: 'Jun 2023',
      description: [
        'Built a full-stack task management application with real-time updates',
        'Implemented user authentication and role-based access control',
        'Deployed on AWS with auto-scaling capabilities'
      ],
      link: 'https://taskmaster-pro.com'
    }],
    skills: {
      languages: ['JavaScript', 'TypeScript', 'Python', 'Java'],
      frameworks: ['React', 'Node.js', 'Express', 'Next.js'],
      tools: ['Git', 'Docker', 'AWS', 'MongoDB'],
      libraries: ['Redux', 'Material-UI', 'Jest', 'Cypress']
    }
  };

  const parseUrlParams = (): ResumeData | null => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const dataParam = urlParams.get('data');
      
      if (!dataParam) {
        setDebugInfo('No data parameter found in URL');
        return null;
      }

      // Log the raw parameter for debugging
      setDebugInfo(`Raw URL parameter length: ${dataParam.length} characters`);

      // Try multiple decoding approaches
      let decodedData: string;
      
      try {
        // First, try standard decodeURIComponent
        decodedData = decodeURIComponent(dataParam);
      } catch (decodeError) {
        // If that fails, try without decoding (in case it's already decoded)
        decodedData = dataParam;
        setDebugInfo(prev => prev + '\nUsing parameter without decoding');
      }

      // Validate JSON structure before parsing
      if (!decodedData.trim().startsWith('{') || !decodedData.trim().endsWith('}')) {
        throw new Error('Data does not appear to be valid JSON format');
      }

      // Parse the JSON data
      const parsedData = JSON.parse(decodedData);
      
      // Validate required structure
      if (!parsedData.personal || !parsedData.personal.name) {
        throw new Error('Missing required personal information in data structure');
      }

      setDebugInfo(prev => prev + '\nSuccessfully parsed JSON data');
      
      return parsedData as ResumeData;
    } catch (err) {
      console.error('Error parsing URL parameters:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown parsing error';
      setError(`Invalid URL parameters: ${errorMessage}`);
      setDebugInfo(prev => prev + `\nError: ${errorMessage}`);
      return null;
    }
  };

  const generateSampleUrl = () => {
    try {
      const baseUrl = window.location.origin + window.location.pathname;
      
      // Use a more robust encoding approach
      const jsonString = JSON.stringify(sampleData);
      const encodedData = encodeURIComponent(jsonString);
      
      const fullUrl = `${baseUrl}?data=${encodedData}`;
      
      // Check URL length (browsers typically limit URLs to ~2000 characters)
      if (fullUrl.length > 2000) {
        console.warn('Generated URL is very long and may be truncated by some browsers');
      }
      
      return fullUrl;
    } catch (err) {
      console.error('Error generating sample URL:', err);
      return '';
    }
  };

  const validateResumeData = (data: any): data is ResumeData => {
    if (!data || typeof data !== 'object') return false;
    if (!data.personal || typeof data.personal.name !== 'string') return false;
    if (!Array.isArray(data.education)) return false;
    if (!Array.isArray(data.experience)) return false;
    if (!Array.isArray(data.projects)) return false;
    if (!data.skills || typeof data.skills !== 'object') return false;
    
    return true;
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setDebugInfo('');
    
    const data = parseUrlParams();
    
    if (data) {
      if (validateResumeData(data)) {
        setResumeData(data);
        setDebugInfo(prev => prev + '\nData validation successful');
      } else {
        setError('Invalid data structure. Please check your resume data format.');
        setShowUrlBuilder(true);
      }
    } else {
      // If no URL params, show URL builder
      setShowUrlBuilder(true);
      const generatedUrl = generateSampleUrl();
      setSampleUrl(generatedUrl);
    }
    
    setIsLoading(false);
  }, []);

  const handlePrint = () => {
    const resume = resumeRef.current;
    if (!resume) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const resumeHTML = resume.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume - ${resumeData?.personal.name || 'Resume'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              background: white;
            }

            a {
              color: #2563eb;
              text-decoration: underline;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }

              a {
                color: #2563eb !important;
                text-decoration: underline !important;
              }

              @page {
                size: auto;
                margin: 0in;
              }

              .print\\:shadow-none {
                box-shadow: none !important;
              }

              .print\\:mb-0 {
                margin-bottom: 0 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="w-full h-full flex justify-center items-start p-8">
            <div style="width: 8.5in;" class="bg-white shadow-lg print:shadow-none print:mb-0">
              ${resumeHTML}
            </div>
          </div>
        </body>
      </html>
    `);

  

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
     
      }, 500);
    };
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderResume = (data: ResumeData) => (
    <div ref={resumeRef} className="print:block">
      <ResumePage>
        {/* Header */}
        <div className="text-center mb-2">
          <div className="text-4xl font-bold tracking-wider">{data.personal.name}</div>
          <div className="text-sm mt-1 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{data.personal.phone}</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <a href={`mailto:${data.personal.email}`} className="hover:text-blue-600">
                {data.personal.email}
              </a>
            </div>
            <div className="flex items-center gap-1">
              <Linkedin className="w-3 h-3" />
              <a href={`https://${data.personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                {data.personal.linkedin}
              </a>
            </div>
            <div className="flex items-center gap-1">
              <Github className="w-3 h-3" />
              <a href={`https://${data.personal.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                {data.personal.github}
              </a>
            </div>
            {data.personal.website && (
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <a href={data.personal.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                  {data.personal.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Education */}
        {data.education.length > 0 && (
          <div className="mb-3">
            <SectionHeader title="Education" />
            {data.education.map((edu, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-bold text-base">{edu.institution}</div>
                    <div className="text-sm italic">{edu.degree}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div>{edu.location}</div>
                    <div className="italic">{edu.startDate} -- {edu.endDate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div className="mb-6">
            <SectionHeader title="Experience" />
            {data.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-bold text-base">{exp.title}</div>
                    <div className="text-sm italic">{exp.company}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div>{exp.location}</div>
                    <div className="italic">{exp.startDate} -- {exp.endDate}</div>
                  </div>
                </div>
                <ul className="list-disc list-outside ml-10 text-sm space-y-0.25">
                  {exp.responsibilities.map((resp, respIndex) => (
                    <li key={respIndex} className="ml-2">{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <div className="mb-3">
            <SectionHeader title="Projects" />
            {data.projects.map((project, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-bold">
                        {project.link ? (
                          <a href={project.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                            {project.name}
                          </a>
                        ) : (
                          project.name
                        )}
                      </span>
                      <span className="mx-2">|</span>
                      <span className="italic">{project.technologies}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {project.startDate} -- {project.endDate}
                  </div>
                </div>
                <ul className="list-disc list-outside ml-10 text-sm space-y-0.25">
                  {project.description.map((desc, descIndex) => (
                    <li key={descIndex} className="ml-2">{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Technical Skills */}
        <div className="mb-6">
          <SectionHeader title="Technical Skills" />
          <div className="text-sm space-y-2">
            {Object.entries(data.skills).map(([category, skills]) => (
              <div key={category} className="flex">
                <span className="font-bold capitalize w-24 flex-shrink-0">
                  {category}:
                </span>
                <div className="flex-1">
                  {skills.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ResumePage>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">
            <AlertCircle className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">URL Parameter Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          
          {debugInfo && (
            <div className="bg-gray-100 p-4 rounded-lg mb-4 text-left">
              <h3 className="font-bold mb-2">Debug Information:</h3>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">Common Solutions:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Check that the JSON data is properly formatted</li>
                <li>• Ensure all quotes and special characters are properly escaped</li>
                <li>• Verify the URL isn't truncated (max ~2000 characters)</li>
                <li>• Try generating a new URL with the sample data below</li>
              </ul>
            </div>
            
            <button
              onClick={() => {
                setError(null);
                setShowUrlBuilder(true);
                setSampleUrl(generateSampleUrl());
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Build New URL
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showUrlBuilder || !resumeData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">📄 URL Resume Generator</h1>
            <p className="text-gray-600 mb-6">
              Generate professional resumes from URL parameters. Perfect for sharing resume links or programmatic PDF generation.
            </p>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">🔗 How it works</h2>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="font-bold text-blue-700 mb-2">1. Encode Data</div>
                    <p className="text-gray-600">Convert your resume JSON data to URL parameters</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="font-bold text-green-700 mb-2">2. Share URL</div>
                    <p className="text-gray-600">Share the generated URL to display the resume</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="font-bold text-purple-700 mb-2">3. Generate PDF</div>
                    <p className="text-gray-600">Use browser print or headless tools for PDF export</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">🔍 Try Sample URL</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">Sample URL:</span>
                    <button
                      onClick={() => copyToClipboard(sampleUrl)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 break-all bg-white p-2 rounded border max-h-32 overflow-y-auto">
                    {sampleUrl}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    URL Length: {sampleUrl.length} characters
                    {sampleUrl.length > 2000 && (
                      <span className="text-orange-600 ml-2">⚠️ Long URL - may be truncated by some browsers</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <a
                    href={sampleUrl}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Sample Resume
                  </a>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">📋 URL Format</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm">
                    {window.location.origin + window.location.pathname}?data=<span className="text-blue-600">{'<encoded_json_data>'}</span>
                  </code>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">⚙️ Usage Tips</h2>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Use <code className="bg-gray-200 px-1 rounded">encodeURIComponent(JSON.stringify(data))</code> to encode your JSON</p>
                  <p>• Ensure JSON is valid before encoding (use JSON.parse to test)</p>
                  <p>• Keep URLs under 2000 characters for maximum browser compatibility</p>
                  <p>• Use headless browsers (Puppeteer, Playwright) for automated PDF generation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Control Panel */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex-1">
            📄 {resumeData.personal.name}'s Resume
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowUrlBuilder(true);
                setResumeData(null);
                setSampleUrl(generateSampleUrl());
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              🔗 Build New URL
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
                 
          </div>
        </div>
        
        {debugInfo && (
          <div className="bg-green-50 p-3 rounded-lg mt-4">
            <details className="text-xs text-green-700">
              <summary className="cursor-pointer font-medium">Debug Info (Click to expand)</summary>
              <pre className="mt-2 whitespace-pre-wrap">{debugInfo}</pre>
            </details>
          </div>
        )}
      </div>

      {/* Resume Display */}
      <div className="max-w-4xl mx-auto">
        {renderResume(resumeData)}
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .no-print, .no-print * {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default URLResumeGenerator;