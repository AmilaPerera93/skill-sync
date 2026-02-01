import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Zap, Terminal, Code2, AlertCircle } from 'lucide-react';

const PanicButton = ({ userId, profile, existingPending, onSessionStart }) => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [description, setDescription] = useState("");
  const [bounty, setBounty] = useState(10);
  const [language, setLanguage] = useState("JavaScript");

  useEffect(() => {
    if (existingPending) {
      setIsBroadcasting(true);
    } else {
      setIsBroadcasting(false);
    }
  }, [existingPending]);

  const handlePanic = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    if (profile.walletBalance < bounty) {
        alert("Insufficient Balance! Top up your wallet first.");
        return;
    }

    try {
      setIsBroadcasting(true);
      const docRef = await addDoc(collection(db, "help_requests"), {
        requesterId: userId,
        description,
        bounty: Number(bounty),
        language,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      // onSessionStart(docRef.id); // We wait for a mentor to accept before jumping to WarRoom
    } catch (error) {
      console.error(error);
      setIsBroadcasting(false);
    }
  };

  if (isBroadcasting) {
    return (
      <div className="bg-slate-900 border-2 border-blue-500/50 p-12 rounded-[3rem] text-center space-y-8 animate-pulse shadow-[0_0_50px_rgba(59,130,246,0.2)]">
        <div className="relative inline-block">
            <Zap size={64} className="text-blue-500 mx-auto relative z-10" />
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-ping" />
        </div>
        <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Signal_Broadcasting</h3>
            <p className="text-slate-500 font-mono text-[10px] mt-2 uppercase tracking-[0.3em]">Scanning for available mentors...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handlePanic} className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Problem Description</label>
        <textarea 
          className="w-full bg-slate-950 border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-blue-500 transition-all min-h-[120px] resize-none"
          placeholder="Describe your bug (e.g., Auth flow failing in React...)"
          value={description} onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Language/Stack</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 appearance-none"
            value={language} onChange={(e) => setLanguage(e.target.value)}
          >
            <option>JavaScript</option>
            <option>Python / Django</option>
            <option>React / Next.js</option>
            <option>Node.js</option>
            <option>Firebase</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Bounty ($)</label>
          <input 
            type="number" 
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
            value={bounty} onChange={(e) => setBounty(e.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-3xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 uppercase tracking-tighter">
        <Terminal size={20} /> Initiate Emergency Broadcast
      </button>
    </form>
  );
};

export default PanicButton;