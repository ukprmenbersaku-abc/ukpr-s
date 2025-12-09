import React from 'react';
import { Sparkles, ArrowDown } from 'lucide-react';
import { APP_TAGLINE } from '../constants';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-6 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-brand-300 text-xs font-semibold mb-6 animate-fade-in-up">
          <Sparkles size={12} />
          <span>Innovating with AI</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight animate-fade-in-up delay-100">
          We build tools that <br />
          <span className="gradient-text">empower creators.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
          {APP_TAGLINE}. <br className="hidden md:block" />
          UKPR-Sは、AIの力を借りて開発プロセスを加速させ、便利で直感的なウェブユーティリティを提供するプロジェクトです。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
          <a 
            href="#projects"
            className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-brand-900/50 flex items-center gap-2"
          >
            Explore Tools
            <ArrowDown size={18} />
          </a>
          <a 
            href="#about"
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 rounded-full font-bold transition-all"
          >
            About Project
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;