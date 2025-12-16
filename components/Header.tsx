import React, { useState, useEffect } from 'react';
import { Bot, Menu, X } from 'lucide-react';
import { APP_NAME, NAV_ITEMS } from '../constants';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800 py-3' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-brand-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
            <div className="relative bg-gradient-to-tr from-brand-600 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-500 border border-white/10">
              <Bot size={26} className="text-white drop-shadow-md" />
            </div>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-2xl font-black font-mono tracking-tighter text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-brand-200 transition-all duration-500">
              {APP_NAME}
            </span>
            <span className="text-[10px] font-bold text-brand-400 tracking-widest uppercase opacity-80 pl-0.5 group-hover:text-brand-300 transition-colors duration-500">
              Project
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item.label} 
              href={item.href}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-500"
            >
              {item.label}
            </a>
          ))}
          <a 
            href="https://github.com/ukprmenbersaku-abc/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-bold bg-white text-slate-950 rounded-full hover:bg-brand-100 transition-colors duration-500"
          >
            GitHub
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-slate-300 hover:text-white transition-colors duration-500"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-800 p-6 flex flex-col gap-4 animate-fade-in-down shadow-2xl">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item.label} 
              href={item.href}
              className="text-lg font-medium text-slate-300 hover:text-white transition-colors duration-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a 
            href="https://github.com/ukprmenbersaku-abc/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lg font-medium text-brand-400 hover:text-brand-300 transition-colors duration-500"
          >
            GitHub
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;