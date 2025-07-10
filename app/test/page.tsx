"use client"
import React, { useState, useRef, useEffect } from 'react';
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
  id: string;
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
}

interface Project {
  id: string;
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

const ResumePage = ({ children }: { children: React.ReactNode;  }) => (
<div className="w-[8.5in] min-h-[11in] bg-white pt-0 px-8 pb-8 shadow-lg font-serif mx-auto mb-8 relative print:pt-0 print:px-8 print:pb-4 print:shadow-none print:mb-0">

   
    {children}
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="border-b-2 border-black mb-3 ">
    <h2 className="text-lg font-bold uppercase tracking-wide">{title}</h2>
  </div>
);

const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personal: {
      name: 'Jake Ryan',
      title: 'Software Developer',
      email: 'jake@su.edu',
      phone: '123-456-7890',
      location: 'Georgetown, TX',
      linkedin: 'linkedin.com/in/jake',
      github: 'github.com/jake',
      website: ''
    },
    education: [
      {
        id: '1',
        institution: 'Southwestern University',
        degree: 'Bachelor of Arts in Computer Science, Minor in Business',
        location: 'Georgetown, TX',
        startDate: 'Aug. 2018',
        endDate: 'May 2021'
      },
      {
        id: '2',
        institution: 'Blinn College',
        degree: 'Associate\'s in Liberal Arts',
        location: 'Bryan, TX',
        startDate: 'Aug. 2014',
        endDate: 'May 2018'
      }
    ],
    experience: [
      {
        id: '1',
        title: 'Undergraduate Research Assistant',
        company: 'Texas A&M University',
        location: 'College Station, TX',
        startDate: 'June 2020',
        endDate: 'Present',
        current: true,
        responsibilities: [
          'Developed a REST API using FastAPI and PostgreSQL to store data from learning management systems',
          'Developed a full-stack web application using Flask, React, PostgreSQL and Docker to analyze GitHub data',
          'Explored ways to visualize GitHub collaboration in a classroom setting'
        ]
      },
      {
        id: '2',
        title: 'Information Technology Support Specialist',
        company: 'Southwestern University',
        location: 'Georgetown, TX',
        startDate: 'Sep. 2018',
        endDate: 'Present',
        current: true,
        responsibilities: [
          'Communicate with managers to set up campus computers used on campus',
          'Assess and troubleshoot computer problems brought by students, faculty and staff',
          'Maintain upkeep of computers, classroom equipment, and 200 printers across campus'
        ]
      }
    ],
    projects: [
      {
        id: '1',
        name: 'Gitlytics',
        technologies: 'Python, Flask, React, PostgreSQL, Docker',
        startDate: 'June 2020',
        endDate: 'Present',
        description: [
          'Developed a full-stack web application using with Flask serving a REST API with React as the frontend',
          'Implemented GitHub OAuth to get data from user\'s repositories',
          'Visualized GitHub data to show collaboration',
          'Used Celery and Redis for asynchronous tasks'
        ]
      },
      {
        id: '2',
        name: 'Simple Paintball',
        technologies: 'Spigot API, Java, Maven, TravisCI, Git',
        startDate: 'May 2018',
        endDate: 'May 2020',
        description: [
          'Developed a Minecraft server plugin to entertain kids during free time for a previous job',
          'Published plugin to websites gaining 2K+ downloads and an average 4.5/5-star review',
          'Implemented continuous delivery using TravisCI to build the plugin upon new a release',
          'Collaborated with Minecraft server administrators to suggest features and get feedback about the plugin'
        ]
      }
    ],
    skills: {
      languages: ['Java', 'Python', 'C/C++', 'SQL (Postgres)', 'JavaScript', 'HTML/CSS', 'R'],
      frameworks: ['React', 'Node.js', 'Flask', 'JUnit', 'WordPress', 'Material-UI', 'FastAPI'],
      tools: ['Git', 'Docker', 'TravisCI', 'Google Cloud Platform', 'VS Code', 'Visual Studio', 'PyCharm', 'IntelliJ', 'Eclipse'],
      libraries: ['pandas', 'NumPy', 'Matplotlib']
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  const updatePersonal = (field: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      location: '',
      startDate: '',
      endDate: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      responsibilities: ['']
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean | string[]) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addResponsibility = (expId: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === expId ? { ...exp, responsibilities: [...exp.responsibilities, ''] } : exp
      )
    }));
  };

  const updateResponsibility = (expId: string, index: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === expId ? {
          ...exp,
          responsibilities: exp.responsibilities.map((resp, i) => i === index ? value : resp)
        } : exp
      )
    }));
  };

  const removeResponsibility = (expId: string, index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === expId ? {
          ...exp,
          responsibilities: exp.responsibilities.filter((_, i) => i !== index)
        } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      technologies: '',
      startDate: '',
      endDate: '',
      description: ['']
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const addProjectDescription = (projId: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === projId ? { ...proj, description: [...proj.description, ''] } : proj
      )
    }));
  };

  const updateProjectDescription = (projId: string, index: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === projId ? {
          ...proj,
          description: proj.description.map((desc, i) => i === index ? value : desc)
        } : proj
      )
    }));
  };

  const removeProjectDescription = (projId: string, index: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === projId ? {
          ...proj,
          description: proj.description.filter((_, i) => i !== index)
        } : proj
      )
    }));
  };

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  const updateSkills = (category: keyof Skills, skills: string[]) => {
    setResumeData(prev => ({
      ...prev,
      skills: { ...prev.skills, [category]: skills }
    }));
  };

  const addSkill = (category: keyof Skills) => {
    setResumeData(prev => ({
      ...prev,
      skills: { ...prev.skills, [category]: [...prev.skills[category], ''] }
    }));
  };

  const updateSkill = (category: keyof Skills, index: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].map((skill, i) => i === index ? value : skill)
      }
    }));
  };

  const removeSkill = (category: keyof Skills, index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].filter((_, i) => i !== index)
      }
    }));
  };

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
        <title>Resume Print</title>
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
    color: #2563eb; /* Tailwind's blue-600 */
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

    .print\\:hidden {
      display: none !important;
    }

    .print\\:block {
      display: block !important;
    }

    button, input, textarea {
      display: none !important;
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

  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
};


  const calculateContentHeight = () => {
    if (!resumeRef.current) return [];
    
    const pageHeight = 11 * 96; // 11 inches in pixels (96 DPI)
    const contentHeight = 8.5 * 96; // Available content height
    
    return [1]; // For now, return single page - actual pagination logic would be more complex
  };

  const renderEditableField = (
    value: string,
    onChange: (value: string) => void,
    className: string = '',
    placeholder: string = '',
    multiline: boolean = false
  ) => {
    if (!isEditing) return <span className={className}>{value}</span>;
    
    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${className} border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
          placeholder={placeholder}
          rows={2}
        />
      );
    }
    
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${className} border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        placeholder={placeholder}
      />
    );
  };

  const renderResume = () => {
    const pages = calculateContentHeight();
    
    return (
      <div ref={resumeRef} className="print:block">
        {pages.map((_, pageIndex) => (
          <ResumePage key={pageIndex}>
            {pageIndex === 0 && (
              <>
                {/* Header */}
                <div className="text-center mb-2">
                  {renderEditableField(
                    resumeData.personal.name,
                    (value) => updatePersonal('name', value),
                    'text-4xl font-bold tracking-wider',
                    'Full Name'
                  )}
                 <div className="text-sm mt-1 flex flex-wrap justify-center gap-4">
  <div className="flex items-center gap-1">
    <Phone className="w-3 h-3" />
    {renderEditableField(
      resumeData.personal.phone,
      (value) => updatePersonal('phone', value),
      '',
      'Phone'
    )}
  </div>
  <div className="flex items-center gap-1">
    <Mail className="w-3 h-3" />
    {isEditing ? (
      renderEditableField(
        resumeData.personal.email,
        (value) => updatePersonal('email', value),
        '',
        'Email'
      )
    ) : (
      <a href={`mailto:${resumeData.personal.email}`} className="hover:text-blue-600">
        {resumeData.personal.email}
      </a>
    )}
  </div>
  <div className="flex items-center gap-1">
    <Linkedin className="w-3 h-3" />
    {isEditing ? (
      renderEditableField(
        resumeData.personal.linkedin,
        (value) => updatePersonal('linkedin', value),
        '',
        'LinkedIn'
      )
    ) : (
      <a 
        href={`https://${resumeData.personal.linkedin}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:text-blue-600"
      >
        {resumeData.personal.linkedin}
      </a>
    )}
  </div>
  <div className="flex items-center gap-1">
    <Github className="w-3 h-3" />
    {isEditing ? (
      renderEditableField(
        resumeData.personal.github,
        (value) => updatePersonal('github', value),
        '',
        'GitHub'
      )
    ) : (
      <a 
        href={`https://${resumeData.personal.github}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:text-blue-600"
      >
        {resumeData.personal.github}
      </a>
    )}
  </div>
  {resumeData.personal.website && (
    <div className="flex items-center gap-1">
      <Globe className="w-3 h-3" />
      {isEditing ? (
        renderEditableField(
          resumeData.personal.website,
          (value) => updatePersonal('website', value),
          '',
          'Website'
        )
      ) : (
        <a 
          href={resumeData.personal.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-blue-600"
        >
          {resumeData.personal.website}
        </a>
      )}
    </div>
  )}
</div>
                </div>

                {/* Education */}
                <div className="mb-3">
                  <SectionHeader title="Education" />
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="mb-2 relative group">
                      {isEditing && (
                        <button
                          onClick={() => removeEducation(edu.id)}
                          className="absolute -left-6 top-0 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {renderEditableField(
                            edu.institution,
                            (value) => updateEducation(edu.id, 'institution', value),
                            'font-bold text-base',
                            'Institution'
                          )}
                          <div className="text-sm italic">
                            {renderEditableField(
                              edu.degree,
                              (value) => updateEducation(edu.id, 'degree', value),
                              '',
                              'Degree'
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          {renderEditableField(
                            edu.location,
                            (value) => updateEducation(edu.id, 'location', value),
                            '',
                            'Location'
                          )}
                          <div className="italic">
                            {renderEditableField(
                              edu.startDate,
                              (value) => updateEducation(edu.id, 'startDate', value),
                              '',
                              'Start Date'
                            )}
                            {' -- '}
                            {renderEditableField(
                              edu.endDate,
                              (value) => updateEducation(edu.id, 'endDate', value),
                              '',
                              'End Date'
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      onClick={addEducation}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Education
                    </button>
                  )}
                </div>

                {/* Experience */}
                <div className="mb-6">
                  <SectionHeader title="Experience" />
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="mb-4 relative group">
                      {isEditing && (
                        <button
                          onClick={() => removeExperience(exp.id)}
                          className="absolute -left-6 top-0 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          {renderEditableField(
                            exp.title,
                            (value) => updateExperience(exp.id, 'title', value),
                            'font-bold text-base',
                            'Job Title'
                          )}
                          <div className="text-sm italic">
                            {renderEditableField(
                              exp.company,
                              (value) => updateExperience(exp.id, 'company', value),
                              '',
                              'Company'
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          {renderEditableField(
                            exp.location,
                            (value) => updateExperience(exp.id, 'location', value),
                            '',
                            'Location'
                          )}
                          <div className="italic">
                            {renderEditableField(
                              exp.startDate,
                              (value) => updateExperience(exp.id, 'startDate', value),
                              '',
                              'Start Date'
                            )}
                            {' -- '}
                            {renderEditableField(
                              exp.endDate,
                              (value) => updateExperience(exp.id, 'endDate', value),
                              '',
                              'End Date'
                            )}
                          </div>
                        </div>
                      </div>
                    
                    <ul className="list-disc list-outside ml-10 text-sm space-y-0.25">
                        {exp.responsibilities.map((resp, index) => (
                          <li key={index} className="relative group/item">
                            {isEditing && (
                              <button
                                onClick={() => removeResponsibility(exp.id, index)}
                                className="absolute -left-6 top-0 text-red-500 hover:text-red-700 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            )}
                            {renderEditableField(
                              resp,
                              (value) => updateResponsibility(exp.id, index, value),
                              'ml-2',
                              'Responsibility',
                              true
                            )}
                          </li>
                        ))}
                      </ul>
                      {isEditing && (
                        <button
                          onClick={() => addResponsibility(exp.id)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-xs mt-2"
                        >
                          <Plus className="w-3 h-3" />
                          Add Responsibility
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      onClick={addExperience}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Experience
                    </button>
                  )}
                </div>

                {/* Projects */}
                <div className="mb-3">
                  <SectionHeader title="Projects" />
                  {resumeData.projects.map((project) => (
                    <div key={project.id} className="mb-3 relative group">
                      {isEditing && (
                        <button
                          onClick={() => removeProject(project.id)}
                          className="absolute -left-6 top-0 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
               <div className="flex justify-between items-start mb-1">
  <div className="flex-1">
    <div className="text-sm">
      <span className="font-bold">
        {isEditing ? (
          renderEditableField(
            project.name,
            (value) => updateProject(project.id, 'name', value),
            '',
            'Project Name'
          )
        ) : project.link ? (
          <a 
            href={project.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            {project.name}
          </a>
        ) : (
          project.name
        )}
      </span>
      <span className="mx-2">|</span>
      <span className="italic">
        {renderEditableField(
          project.technologies,
          (value) => updateProject(project.id, 'technologies', value),
          '',
          'Technologies'
        )}
      </span>
    </div>
  </div>
  <div className="text-right text-sm">
    {renderEditableField(
      project.startDate,
      (value) => updateProject(project.id, 'startDate', value),
      '',
      'Start Date'
    )}
    {' -- '}
    {renderEditableField(
      project.endDate,
      (value) => updateProject(project.id, 'endDate', value),
      '',
      'End Date'
    )}
  </div>{isEditing && (
  <div className="mt-2">
    <label className="block text-xs text-gray-600 mb-1">Project Link (optional):</label>
    {renderEditableField(
      project.link || '',
      (value) => updateProject(project.id, 'link', value),
      'text-xs',
      'https://github.com/username/project'
    )}
  </div>
)}
</div>
                    <ul className="list-disc list-outside ml-10 text-sm space-y-0.25">
                        {project.description.map((desc, index) => (
                          <li key={index} className="relative group/item">
                            {isEditing && (
                              <button
                                onClick={() => removeProjectDescription(project.id, index)}
                                className="absolute -left-6 top-0 text-red-500 hover:text-red-700 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            )} 
                            {renderEditableField(
                              desc,
                              (value) => updateProjectDescription(project.id, index, value),
                              'ml-2',
                              'Description',
                              true
                            )}
                          </li>
                        ))}
                      </ul>
                      {isEditing && (
                        <button
                          onClick={() => addProjectDescription(project.id)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-xs mt-2"
                        >
                          <Plus className="w-3 h-3" />
                          Add Description
                        </button>
                      )}
                    </div>
                  ))}
                 
                  {isEditing && (
                    <button
                      onClick={addProject}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Project
                    </button>
                  )}
                </div>

                {/* Technical Skills */}
                <div className="mb-6">
                  <SectionHeader title="Technical Skills" />
                  <div className="text-sm space-y-2">
                    {Object.entries(resumeData.skills).map(([category, skills]) => (
                      <div key={category} className="flex">
                        <span className="font-bold capitalize w-24 flex-shrink-0">
                          {category}:
                        </span>
                        <div className="flex-1">
                          {skills.map((skill: string, index: number) => (
                            <span key={index} className="inline-block relative group/skill">
                              {isEditing && (
                                <button
                                  onClick={() => removeSkill(category as keyof Skills, index)}
                                  className="absolute -left-4 top-0 text-red-500 hover:text-red-700 opacity-0 group-hover/skill:opacity-100 transition-opacity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                              )}
                              {renderEditableField(
                                skill,
                                (value) => updateSkill(category as keyof Skills, index, value),
                                '',
                                'Skill'
                              )}
                              {index < skills.length - 1 && ', '}
                            </span>
                          ))}
                          {isEditing && (
                            <button
                              onClick={() => addSkill(category as keyof Skills)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <Plus className="w-3 h-3 inline" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </ResumePage>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Control Panel */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex-1">
            Developer Resume Builder
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isEditing
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Print/Download
            </button>
          </div>
        </div>
      </div>

      {/* Resume Display */}
      <div className="max-w-4xl mx-auto">
        {renderResume()}
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

export default ResumeBuilder;