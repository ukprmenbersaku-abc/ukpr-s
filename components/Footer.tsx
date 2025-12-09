import React from 'react';
import { APP_NAME } from '../constants';
import { Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12 mt-20">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-bold font-mono text-white mb-2">{APP_NAME}</h3>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} UKPR-S Project. All rights reserved.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <a 
            href="https://github.com/ukprmenbersaku-abc/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
          >
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">View on GitHub</span>
            <Github size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;