import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProjectCard from './components/ProjectCard';
import Footer from './components/Footer';
import InteractiveBackground from './components/InteractiveBackground';
import MiniCarGame from './components/MiniCarGame';
import { PROJECTS } from './constants';
import { Cpu, Zap, Code2, ExternalLink, Cloud, Flame, Sparkles } from 'lucide-react';
import { Github } from './components/GithubIcon';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [isRacingActive, setIsRacingActive] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const startRaceMode = () => {
    if (isTransitioning || isRacingActive) return;
    setIsTransitioning(true);
    // After a short futuristic warp countdown, switch to racing mode
    setTimeout(() => {
      setIsRacingActive(true);
      setIsTransitioning(false);
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-brand-500/30 selection:text-brand-200 relative overflow-x-hidden">
      
      {/* Immersive 3D Racing Game Overrides whole app */}
      <AnimatePresence mode="wait">
        {isRacingActive && (
          <motion.div
            key="racing-game"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 overflow-hidden"
          >
            <MiniCarGame onClose={() => setIsRacingActive(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cyber warp screen transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-center p-6 select-none overflow-hidden"
          >
            {/* Radial glow warp background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.18)_0%,transparent_70%)] animate-pulse" />
            
            <motion.div 
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: [0.8, 1.05, 1], y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 flex flex-col items-center max-w-md"
            >
              <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/50 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 animate-bounce">
                <Zap size={28} className="animate-pulse" />
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black tracking-widest text-white mb-2 font-mono">
                CRITICAL LIMIT DETECTED
              </h2>
              <p className="text-brand-400 font-bold font-mono text-xs tracking-widest uppercase mb-8 animate-pulse">
                Warping to Cyber Grid Circuit...
              </p>
              
              {/* Linear warp loader */}
              <div className="w-64 h-3 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-[2px]">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-600 rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <InteractiveBackground onBoundaryHit={startRaceMode} />
      <Header />
      
      <main className="relative z-10">
        <Hero onStartRace={startRaceMode} />

        {/* Projects Grid Section */}
        <section id="projects" className="py-24 relative">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Tools</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        開発者やクリエイターの作業を効率化するために作られた、シンプルで強力なウェブアプリケーション群です。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PROJECTS.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>

                <div className="mt-8 flex justify-center">
                    <a 
                        href="https://ukpr-riyoukiyaku.pages.dev" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-400 transition-colors duration-500 text-sm group"
                    >
                        <span>利用規約はこちらから</span>
                        <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500" />
                    </a>
                </div>
            </div>
        </section>

        {/* About / Features Section */}
        <section id="about" className="py-24 bg-slate-900/30 border-y border-slate-900">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Why UKPR-S?</h2>
                    <p className="text-slate-400 text-lg">
                        UKPR-Sは、AIとの共創によって生まれる新しい開発スタイルを提案します。<br/>
                        「あったらいいな」を形にするスピードとクオリティを追求しています。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
                    <a 
                        href="https://deepmind.google/technologies/gemini/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800/50 transition-all duration-500 hover:-translate-y-1 hover:border-blue-500/30 cursor-pointer group"
                    >
                        <div className="p-4 rounded-full bg-blue-500/10 text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-500">
                            <Cpu size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-blue-300 transition-colors duration-500">AI-Powered Dev</h3>
                        <p className="text-slate-400 text-sm">
                            最新のAIモデルを活用し、コード生成からUIデザインまで、開発のあらゆるフェーズを最適化しています。
                        </p>
                    </a>
                    <a 
                        href="https://pages.cloudflare.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800/50 transition-all duration-500 hover:-translate-y-1 hover:border-purple-500/30 cursor-pointer group"
                    >
                        <div className="p-4 rounded-full bg-purple-500/10 text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-500">
                            <Zap size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-purple-300 transition-colors duration-500">Speed & Performance</h3>
                        <p className="text-slate-400 text-sm">
                            軽量で高速な技術スタックを採用。ユーザー体験を損なわない、サクサク動くツールを提供します。
                        </p>
                    </a>
                    <a 
                        href="https://github.com/ukprmenbersaku-abc/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800/50 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/30 cursor-pointer group"
                    >
                        <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-500">
                            <Code2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-300 transition-colors duration-500">Open & Free</h3>
                        <p className="text-slate-400 text-sm">
                            公開しているツールは完全に無料利用可能。ウェブブラウザさえあれば、どこでも使えます。
                        </p>
                    </a>
                </div>

                {/* Thanks to Section */}
                <div className="pt-12 border-t border-slate-800/50">
                    <h3 className="text-2xl font-bold text-center mb-10 text-slate-300">Thanks to</h3>
                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
                        <a 
                            href="https://aistudio.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/50 hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-500"
                        >
                            <Sparkles size={20} className="text-blue-400" />
                            <span className="font-semibold">Google AI Studio & Gemini</span>
                        </a>
                        <a 
                            href="https://www.cloudflare.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-orange-500/50 hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-500"
                        >
                            <Cloud size={20} className="text-orange-400" />
                            <span className="font-semibold">Cloudflare</span>
                        </a>
                        <a 
                            href="https://github.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-white/50 hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-500"
                        >
                            <Github size={20} className="text-white" />
                            <span className="font-semibold">GitHub</span>
                        </a>
                        <a 
                            href="https://firebase.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/50 hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-500"
                        >
                            <Flame size={20} className="text-amber-500" />
                            <span className="font-semibold">Firebase</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default App;