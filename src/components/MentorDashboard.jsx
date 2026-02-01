import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    orderBy, 
    doc, 
    updateDoc, 
    serverTimestamp 
} from 'firebase/firestore';
import { Terminal, Activity, Code2, AlertTriangle } from 'lucide-react';
import SessionHistory from './SessionHistory'; // Import the new persistent history component

const MentorDashboard = ({ userId }) => {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);

    // 1. Real-time listener for "pending" help signals
    // This allows Mentors to see bugs as they are broadcasted
    useEffect(() => {
        const q = query(
            collection(db, "help_requests"),
            where("status", "==", "pending"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRequests(data);
            setError(null);
        }, (err) => {
            console.error("Firestore Listen Error:", err);
            setError("Database connection error. Ensure your Firestore Indexes are built.");
        });

        return () => unsubscribe();
    }, []);

    // 2. Handshake logic to establish connection
    // When a mentor clicks "Establish Uplink", the session becomes "active"
    const acceptRequest = async (id) => {
        try {
            const docRef = doc(db, "help_requests", id);
            await updateDoc(docRef, {
                status: 'active',
                mentorId: userId,
                acceptedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Uplink Error:", error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-12">
            
            {/* --- HEADER SECTION --- */}
            <div className="flex justify-between items-end mb-12 border-b border-slate-900 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em]">System_Online</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">Live_Feed</h1>
                    <p className="text-slate-500 font-mono text-[10px] uppercase mt-2 tracking-widest">
                        Scanning global frequencies for active SOS signals
                    </p>
                </div>
                
                <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-full flex items-center gap-3 shadow-inner">
                    <Activity size={18} className="text-blue-500" />
                    <span className="text-xs font-black text-slate-300 font-mono">
                        {requests.length} SIGNALS_DETECTED
                    </span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold">
                    <AlertTriangle size={20} /> {error}
                </div>
            )}

            {/* --- ACTIVE REQUESTS GRID --- */}
            <div className="grid gap-6 md:grid-cols-2">
                {requests.map(req => (
                    <div 
                        key={req.id} 
                        className="group bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-blue-500/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(59,130,246,0.1)]"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="bg-blue-600/10 text-blue-500 p-3 rounded-2xl">
                                <Code2 size={24} />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Target_Stack</span>
                                <span className="text-xs font-black text-white bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 uppercase italic">
                                    {req.language || 'General'}
                                </span>
                            </div>
                        </div>
                        
                        <p className="text-xl text-slate-200 font-bold mb-8 leading-tight min-h-[4rem] line-clamp-2">
                            "{req.description}"
                        </p>

                        <div className="flex items-center justify-between mb-8 border-t border-slate-800 pt-6">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bounty_Credit</span>
                            <span className="text-2xl font-black text-green-500 font-mono">${req.bounty || 0}</span>
                        </div>
                        
                        <button 
                            onClick={() => acceptRequest(req.id)}
                            className="w-full bg-white text-black hover:bg-blue-600 hover:text-white font-black py-4 rounded-2xl transition-all flex justify-center items-center gap-2 uppercase tracking-tighter active:scale-95 shadow-xl"
                        >
                            <Terminal size={18} /> Establish Uplink
                        </button>
                    </div>
                ))}
            </div>

            {/* --- EMPTY STATE --- */}
            {requests.length === 0 && !error && (
                <div className="text-center py-32 bg-slate-900/20 rounded-[3rem] border border-dashed border-slate-800/50">
                    <Terminal size={48} className="mx-auto text-slate-800 mb-6 animate-pulse" />
                    <p className="text-slate-600 font-mono text-xs uppercase tracking-[0.4em]">
                        Scanning frequencies... No signals detected in this sector.
                    </p>
                </div>
            )}

            {/* --- DYNAMIC PERSISTENT HISTORY --- */}
            <div className="pt-12 border-t border-slate-900">
                <SessionHistory userId={userId} role="mentor" />
            </div>

        </div>
    );
};

export default MentorDashboard;