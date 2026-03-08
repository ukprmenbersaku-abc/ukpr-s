import React from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const CardWrapper = project.url ? 'a' : 'div';
  const wrapperProps = project.url 
    ? { href: project.url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <CardWrapper 
      {...wrapperProps}
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 transition-all duration-500 ${project.url ? 'hover:border-slate-600 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1 cursor-pointer' : 'opacity-80'}`}
    >
      {/* Gradient Glow on Hover */}
      <div className={`absolute inset-0 opacity-0 ${project.url ? 'group-hover:opacity-10' : ''} transition-opacity duration-700 bg-gradient-to-br ${project.gradient}`} />

      <div className="p-6 md:p-8 flex-1 flex flex-col z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={project.url ? "group-hover:scale-110 transition-transform duration-500" : ""}>
            {/* Icons are now self-contained SVGs with backgrounds, so we display them larger without a wrapper */}
            <project.icon size={48} />
          </div>
          {project.url && (
            <ExternalLink size={20} className="text-slate-500 group-hover:text-brand-400 transition-colors duration-500" />
          )}
        </div>

        <h3 className={`text-xl font-bold text-white mb-2 ${project.url ? 'group-hover:text-brand-300' : ''} transition-colors duration-500 ${project.fontClass || 'font-sans'}`}>
          {project.name}
        </h3>
        
        <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto">
          {project.tags.map(tag => (
            <span key={tag} className="text-xs font-mono py-1 px-2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className={`bg-slate-950/50 p-4 border-t border-slate-800 flex items-center justify-between ${project.url ? 'group-hover:bg-slate-800/50' : ''} transition-colors duration-500`}>
        <span className={`text-xs font-semibold text-slate-400 ${project.url ? 'group-hover:text-white' : ''} transition-colors duration-500`}>
          {project.url ? 'Open Tool' : 'Under Development'}
        </span>
        {project.url && (
          <ArrowRight size={16} className="text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all duration-500" />
        )}
      </div>
    </CardWrapper>
  );
};

export default ProjectCard;