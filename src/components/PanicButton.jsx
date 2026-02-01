import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { Zap, Terminal, XOctagon } from 'lucide-react';

const PanicButton = ({ userId, profile, existingPending }) => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [description, setDescription] = useState("");
  const [bounty, setBounty] = useState(10);
  const [language, setLanguage] = useState("JavaScript");

  useEffect(() => {
    setIsBroadcasting(existingPending);
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
      await addDoc(collection(db, "help_requests"), {
        requesterId: userId,
        description,
        bounty: Number(bounty),
        language,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error(error);
      setIsBroadcasting(false);
    }
  };

  // NEW: Kill-switch to stop broadcasting
  const terminateBroadcast = async () => {
    try {
      const q = query(
        collection(db, "help_requests"),
        where("requesterId", "==", userId),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      setIsBroadcasting(false);
    } catch (error) {
      console.error("Termination Failed:", error);
    }
  };

  if (isBroadcasting) {
    return (
      <div className="bg-slate-900 border-2 border-blue-500/30 p-12 rounded-[3.5rem] text-center space-y-8 shadow-[0_0_60px_rgba(59,130,246,0.15)] relative overflow-hidden transition-all duration-700">
        <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
        <div className="relative z-10">
          <div className="relative inline-block mb-6">
            <Zap size={64} className="text-blue-500 mx-auto" />
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-ping" />
          </div>
          <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Signal_Active</h3>
          <p className="text-slate-500 font-mono text-[10px] mt-2 uppercase tracking-[0.4em]">Broadcasting SOS to the global network...</p>
        </div>
        <button 
          onClick={terminateBroadcast}
          className="relative z-10 mx-auto px-8 py-3 border border-red-500/50 hover:bg-red-500 hover:text-white text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
        >
          <XOctagon size={14} /> Terminate_Broadcast
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handlePanic} className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Problem Description</label>
        <textarea 
          className="w-full bg-slate-950 border border-slate-800 p-6 rounded-3xl text-white outline-none focus:border-blue-500 transition-all min-h-[120px] resize-none"
          placeholder="What's the issue? (e.g., Infinite loop in login component...)"
          value={description} onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Stack</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 appearance-none font-mono text-xs uppercase"
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
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 font-mono"
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