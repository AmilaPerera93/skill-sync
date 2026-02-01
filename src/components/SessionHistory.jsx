import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { History, CheckCircle, XCircle, Code2, Clock, Loader2 } from 'lucide-react';

const SessionHistory = ({ userId, role }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(true);
            return;
        }

        const q = query(
            collection(db, "help_requests"),
            where(role === 'developer' ? "requesterId" : "mentorId", "==", userId),
            where("status", "in", ["resolved", "cancelled"]),
            orderBy("createdAt", "desc"),
            limit(10)
        );

        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setHistory(data);
            setLoading(false);
        }, (err) => {
            console.error("Archive Sync Failed:", err);
            setLoading(false);
        });

        return () => unsub();
    }, [userId, role]);

    if (loading) return (
        <div className="mt-12 text-center py-10 opacity-30 animate-pulse flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Syncing_Archives...</span>
        </div>
    );

    if (history.length === 0) return null;

    return (
        <div className="mt-12 w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <History size={18} className="text-slate-500" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Mission_Archive</h3>
            </div>

            <div className="grid gap-4">
                {history.map(item => (
                    <div key={item.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl flex justify-between items-center group hover:bg-slate-900/60 transition-all border-l-4 border-l-transparent hover:border-l-blue-500">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${item.status === 'resolved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {item.status === 'resolved' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white leading-tight uppercase tracking-tight">
                                    {item.description?.slice(0, 45)}...
                                </p>
                                <div className="flex gap-4 mt-1">
                                    <span className="text-[9px] font-mono text-slate-400 uppercase flex items-center gap-1">
                                        <Code2 size={10} /> {item.language}
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-400 uppercase flex items-center gap-1">
                                        <Clock size={10} /> {item.createdAt?.toDate()?.toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`text-sm font-black font-mono ${role === 'mentor' ? 'text-green-500' : 'text-slate-400'}`}>
                                {role === 'mentor' ? '+' : '-'}${item.bounty?.toFixed(2)}
                            </span>
                            <p className="text-[8px] font-black text-slate-600 uppercase mt-1 opacity-50">{item.status}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SessionHistory;