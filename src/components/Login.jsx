import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Terminal, ShieldCheck, Lock, Chrome } from 'lucide-react';

const Login = () => {
  const { loginWithGoogle, loginEmail, registerEmail } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('developer');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) await registerEmail(email, password, role);
      else await loginEmail(email, password);
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
        <h1 className="text-4xl font-black text-center text-white italic mb-2">SKILL_SYNC</h1>
        <p className="text-center text-slate-500 text-xs font-mono mb-10 uppercase tracking-widest">Secure Access Terminal</p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-500" size={18} />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 transition-all" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-500" size={18} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 transition-all" />
          </div>
          
          {isRegistering && (
            <div className="flex gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
              <button type="button" onClick={() => setRole('developer')} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${role === 'developer' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>DEVELOPER</button>
              <button type="button" onClick={() => setRole('mentor')} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${role === 'mentor' ? 'bg-green-600 text-white' : 'text-slate-500 hover:text-white'}`}>MENTOR</button>
            </div>
          )}

          <button className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-blue-500 hover:text-white transition-all uppercase tracking-tighter">
            {isRegistering ? 'Create Account' : 'Initialize Session'}
          </button>
        </form>

        <button onClick={() => loginWithGoogle(role)} className="w-full border border-slate-800 py-4 rounded-2xl flex justify-center items-center gap-3 text-slate-300 font-bold hover:bg-slate-800 transition-all mb-8">
          <Chrome size={20} /> Continue with Google
        </button>

        <p className="text-center text-slate-500 text-xs">
          {isRegistering ? "Already have an account?" : "New to the network?"} 
          <button onClick={() => setIsRegistering(!isRegistering)} className="ml-2 text-blue-400 font-black hover:underline underline-offset-4">
            {isRegistering ? "LOG IN" : "JOIN NOW"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;