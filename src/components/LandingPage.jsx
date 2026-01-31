import React from 'react';
import { Terminal, Cpu, ShieldCheck, Zap, Code2, Users, ArrowRight } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      
      {/* 1. NAVBAR */}
      <nav className="container mx-auto p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic shadow-lg shadow-blue-500/20">S</div>
          <span className="font-black italic tracking-tighter text-xl uppercase">Skill_Sync</span>
        </div>
        <button 
          onClick={onGetStarted}
          className="px-6 py-2 border border-slate-700 hover:border-blue-500 rounded-full text-xs font-black uppercase tracking-widest transition-all"
        >
          Login // Sign_Up
        </button>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest mb-8 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            System Online: $50 Free Credits Active
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic mb-6 leading-none">
            Don't Debug <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Alone.</span>
          </h1>
          
          <p className="max-w-xl mx-auto text-slate-400 text-lg mb-10 leading-relaxed">
            The first <strong>Real-Time "War Room"</strong> for developers. 
            Broadcast your error. Connect with a mentor. Fix it together in a live, collaborative terminal.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button 
              onClick={onGetStarted}
              className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-black uppercase tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.5)]"
            >
              <span className="flex items-center gap-2">
                Initiate_Uplink <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <span className="text-xs font-mono text-slate-500 uppercase">No Credit Card Required</span>
          </div>
        </div>
      </header>

      {/* 3. FEATURE GRID (SEO Content) */}
      <section className="py-24 border-t border-slate-900 bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <Terminal className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-3">Live War Room</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Not a forum. A real-time IDE where you and a mentor edit code simultaneously with syntax highlighting and instant chat.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-green-500/50 transition-colors group">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                <ShieldCheck className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-3">Bounty Secured</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Smart contracts for developers. Funds are only transferred when the session is marked resolved. 100% secure.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Zap className="text-purple-500" size={24} />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-3">Instant Signal</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Hit the Panic Button and broadcast your stack (React, Node, Python) to thousands of online mentors instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER (Good for AdSense) */}
      <footer className="py-12 border-t border-slate-900 text-center">
        <p className="text-slate-600 text-xs font-mono uppercase tracking-widest mb-4">
          Skill_Sync Platform © 2024 // Colombo, LK
        </p>
        <div className="flex justify-center gap-6 opacity-50">
          <Code2 size={20} />
          <Cpu size={20} />
          <Users size={20} />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;