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
    serverTimestamp,
    limit 
} from 'firebase/firestore';
import { Terminal, Activity, Code2, AlertTriangle, CheckCircle } from 'lucide-react';

const MentorDashboard = ({ userId, onAccept }) => {
    const [requests, setRequests] = useState([]);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);

    // 1. Real-time listener for "pending" help signals
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
            setError("Database connection error. Please check your Firestore Indexes.");
        });

        return () => unsubscribe();
    }, []);

    // 2. Listener for "Recent Earnings" (Resolved Sessions)
    useEffect(() => {
        const q = query(
            collection(db, "help_requests"),
            where("mentorId", "==", userId),
            where("status", "==", "resolved"),
            orderBy("resolvedAt", "desc"),
            limit(5)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setHistory(data);
        });

        return () => unsubscribe();
    }, [userId]);

    // 3. Handshake logic to establish connection
    const acceptRequest = async (id) => {
    try {
        const docRef = doc(db, "help_requests", id);
        await updateDoc(docRef, {
            status: 'active',
            mentorId: userId, // Ensure this is the actual Firebase UID (e.g., "abc123xyz")
            acceptedAt: serverTimestamp()
        });
    } catch (error) {
        console.error(error);
    }
};

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-12 border-b border-slate-900 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em]">System_Online</span>
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Live_Feed</h1>
                    <p className="text-slate-500 font-mono text-xs uppercase mt-1 tracking-widest">
                        Scanning frequencies for active signals
                    </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-full flex items-center gap-3">
                    <Activity size={18} className="text-blue-500" />
                    <span className="text-xs font-black text-slate-300 font-mono">
                        {requests.length} SIGNALS_DETECTED
                    </span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl mb-8 flex items-center gap-3 text-red-500 text-sm font-bold">
                    <AlertTriangle size={20} /> {error}
                </div>
            )}

            {/* Request Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {requests.map(req => (
                    <div 
                        key={req.id} 
                        className="group bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-blue-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="bg-blue-600/10 text-blue-500 p-3 rounded-2xl">
                                <Code2 size={24} />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Tech_Stack</span>
                                <span className="text-xs font-black text-white bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 uppercase italic">
                                    {req.language || 'General'}
                                </span>
                            </div>
                        </div>
                        
                        <p className="text-xl text-slate-200 font-bold mb-8 leading-tight min-h-[4rem]">
                            "{req.description}"
                        </p>

                        <div className="flex items-center justify-between mb-8 border-t border-slate-800 pt-6">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bounty_Amount</span>
                            <span className="text-xl font-black text-green-500 font-mono">${req.bounty || 0}</span>
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

            {/* Empty State */}
            {requests.length === 0 && !error && (
                <div className="text-center py-32 bg-slate-900/20 rounded-[3rem] border border-dashed border-slate-800/50">
                    <Terminal size={48} className="mx-auto text-slate-800 mb-6 animate-pulse" />
                    <p className="text-slate-600 font-mono text-xs uppercase tracking-[0.4em]">
                        Scanning frequencies... No signals detected in this sector.
                    </p>
                </div>
            )}

            {/* Recent Earnings History */}
            <div className="mt-24 max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Recent_Earnings</h3>
                    <div className="flex-1 h-px bg-slate-900" />
                </div>
                
                <div className="space-y-3">
                    {history.length > 0 ? history.map((item) => (
                        <div key={item.id} className="bg-slate-900/50 border border-slate-800 p-5 rounded-[1.5rem] flex justify-between items-center group hover:border-green-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                                    <CheckCircle size={18} className="text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase tracking-tight">{item.description.slice(0, 30)}...</p>
                                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                                        {item.resolvedAt?.toDate().toLocaleDateString() || 'Recently'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-black text-green-500 font-mono">+${item.bounty?.toFixed(2)}</span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-slate-600 text-[10px] uppercase font-mono py-10">No transactions recorded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MentorDashboard;