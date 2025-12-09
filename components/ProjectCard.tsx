import React from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <a 
      href={project.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 transition-all duration-300 hover:border-slate-600 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1"
    >
      {/* Gradient Glow on Hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${project.gradient}`} />

      <div className="p-6 md:p-8 flex-1 flex flex-col z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-slate-800 text-white group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/10`}>
            <project.icon size={24} />
          </div>
          <ExternalLink size={20} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2 font-sans group-hover:text-brand-300 transition-colors">
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
      
      <div className="bg-slate-950/50 p-4 border-t border-slate-800 flex items-center justify-between group-hover:bg-slate-800/50 transition-colors">
        <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">Open Tool</span>
        <ArrowRight size={16} className="text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
      </div>
    </a>
  );
};

export default ProjectCard;