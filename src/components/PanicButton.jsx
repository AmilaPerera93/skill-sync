import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Radio, Loader2, XCircle, DollarSign, Send, ShieldAlert } from 'lucide-react';

const PanicButton = ({ userId, profile, onSessionStart }) => {
    const [status, setStatus] = useState('idle'); 
    const [requestId, setRequestId] = useState(null);
    const [bounty, setBounty] = useState(10);
    const [language, setLanguage] = useState('React / Vite');
    const [desc, setDesc] = useState('');

    useEffect(() => {
        if (!requestId) return;
        const unsub = onSnapshot(doc(db, "help_requests", requestId), (snapshot) => {
            const data = snapshot.data();
            if (data?.status === 'active') onSessionStart(requestId);
            if (!snapshot.exists() || data?.status === 'cancelled') {
                setStatus('idle');
                setRequestId(null);
            }
        });
        return () => unsub();
    }, [requestId, onSessionStart]);

    const handlePanic = async () => {
        // --- BALANCE CHECK ---
        const currentBalance = profile?.walletBalance || 0;
        if (currentBalance < bounty) {
            alert(`Insufficient Funds! You need $${bounty} to broadcast this signal. Your current balance is $${currentBalance.toFixed(2)}.`);
            return;
        }

        if (!desc.trim()) return alert("Describe the issue so mentors can help!");
        
        setStatus('loading');
        try {
            const docRef = await addDoc(collection(db, "help_requests"), {
                requesterId: userId,
                description: desc,
                language,
                bounty: Number(bounty),
                status: "pending",
                createdAt: serverTimestamp()
            });
            setRequestId(docRef.id);
            setStatus('broadcasting');
        } catch (e) { 
            console.error(e);
            setStatus('idle'); 
        }
    };

    const stopBroadcasting = async () => {
        if (requestId) {
            await updateDoc(doc(db, "help_requests", requestId), { status: 'cancelled' });
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {status === 'idle' ? (
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <ShieldAlert size={12} /> Bug_Parameters
                        </label>
                        <textarea 
                            placeholder="What's the error message? (e.g. Uncaught TypeError...)" 
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 p-5 rounded-3xl text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all h-40 resize-none font-medium" 
                        />
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Environment</label>
                            <select onChange={(e) => setLanguage(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none cursor-pointer hover:border-slate-700 font-bold appearance-none">
                                <option>React / Vite</option>
                                <option>Firebase / Auth</option>
                                <option>Node.js / Express</option>
                                <option>Python / Django</option>
                            </select>
                        </div>
                        <div className="w-1/3 space-y-2">
                            <label className="text-[10px] font-black text-green-500 uppercase tracking-widest ml-1">Bounty ($)</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" />
                                <input type="number" value={bounty} onChange={(e) => setBounty(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-4 pl-10 rounded-2xl text-white outline-none font-black" />
                            </div>
                        </div>
                    </div>

                    <button onClick={handlePanic} className="w-full group bg-blue-600 hover:bg-blue-500 py-6 rounded-3xl font-black text-xl flex justify-center items-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20">
                        {status === 'loading' ? <Loader2 className="animate-spin" /> : <Send className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />} 
                        INITIATE_BROADCAST
                    </button>
                </div>
            ) : (
                <div className="bg-slate-900/80 backdrop-blur-2xl border border-blue-500/20 p-16 rounded-[3rem] text-center space-y-10">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                        <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-12 rounded-full relative shadow-2xl shadow-blue-500/40">
                            <Radio size={56} className="text-white animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Signal Active</h2>
                        <p className="text-slate-500 font-mono text-xs mt-3 uppercase tracking-[0.2em]">Pinging {language} mentors...</p>
                    </div>
                    <button onClick={stopBroadcasting} className="flex items-center gap-2 mx-auto px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full font-black transition-all uppercase text-[10px] tracking-[0.2em] border border-red-500/20">
                        <XCircle size={16} /> Terminate_Signal
                    </button>
                </div>
            )}
        </div>
    );
};

export default PanicButton;