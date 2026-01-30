import React, { useState, useEffect, useRef } from 'react';
import { db, rtdb } from '../firebase';
import { ref, onValue, set, push, serverTimestamp as rtdbTimestamp } from 'firebase/database';
import { doc, onSnapshot, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { Terminal, ShieldCheck, Cpu, Code2, Send, MessageSquare } from 'lucide-react';

// --- SYNTAX HIGHLIGHTING IMPORTS ---
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup'; 
import 'prismjs/themes/prism-tomorrow.css'; 

const WarRoom = ({ sessionId, userRole, userId, onLeave }) => {
    const [data, setData] = useState(null);
    const [code, setCode] = useState("// Initializing Secure Uplink...");
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const isLocalChange = useRef(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // 1. Sync Metadata & Code
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "help_requests", sessionId), (snap) => setData(snap.data()));
        const codeRef = ref(rtdb, `sessions/${sessionId}/code`);
        const unsubCode = onValue(codeRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null && !isLocalChange.current) setCode(val);
            isLocalChange.current = false;
        });
        return () => { unsub(); unsubCode(); };
    }, [sessionId]);

    // 2. Sync Chat Messages
    useEffect(() => {
        const chatRef = ref(rtdb, `sessions/${sessionId}/chat`);
        const unsubscribe = onValue(chatRef, (snapshot) => {
            const chatData = snapshot.val();
            if (chatData) {
                const msgList = Object.values(chatData);
                setMessages(msgList);
            }
        });
        return () => unsubscribe();
    }, [sessionId]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const chatRef = ref(rtdb, `sessions/${sessionId}/chat`);
        push(chatRef, {
            senderId: userId,
            role: userRole,
            text: newMessage,
            timestamp: rtdbTimestamp()
        });
        setNewMessage("");
    };

    const handleCodeChange = (newCode) => {
        isLocalChange.current = true;
        setCode(newCode);
        set(ref(rtdb, `sessions/${sessionId}/code`), newCode);
    };

    const resolveSession = async () => {
        if (!data || data.status === 'resolved') return;

        try {
            await runTransaction(db, async (transaction) => {
                const devRef = doc(db, "users", data.requesterId);
                const mentorRef = doc(db, "users", data.mentorId);
                const sessionRef = doc(db, "help_requests", sessionId);

                const devSnap = await transaction.get(devRef);
                const mentorSnap = await transaction.get(mentorRef);

                if (!devSnap.exists()) throw `Developer Profile Not Found.`;
                if (!mentorSnap.exists()) throw `Mentor Profile Not Found.`;

                const currentDevBalance = Number(devSnap.data().walletBalance) || 0;
                const currentMentorBalance = Number(mentorSnap.data().walletBalance) || 0;
                const bountyAmount = Number(data.bounty) || 0;

                if (currentDevBalance < bountyAmount) throw "Insufficient Funds.";

                transaction.update(devRef, { walletBalance: currentDevBalance - bountyAmount });
                transaction.update(mentorRef, { walletBalance: currentMentorBalance + bountyAmount });
                transaction.update(sessionRef, { status: 'resolved', resolvedAt: serverTimestamp() });
            });

            alert("💰 Bounty Settled Successfully!");
            onLeave();
        } catch (e) {
            console.error(e);
            alert(`Transaction Failed: ${e}`);
        }
    };

    return (
        <div className="h-[85vh] flex flex-col bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600/20 p-3 rounded-2xl animate-pulse"><Cpu className="text-blue-500" /></div>
                    <div>
                        <h2 className="font-black text-white uppercase tracking-tighter text-sm">Uplink_{sessionId.slice(0,6)}</h2>
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] font-mono text-green-500 uppercase tracking-widest leading-none">Bounty: ${data?.bounty}</span>
                        </div>
                    </div>
                </div>
                {userRole === 'developer' && (
                    <button 
                        onClick={resolveSession} 
                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-lg transition-all flex items-center gap-2"
                    >
                        <ShieldCheck size={14} /> Resolve & Pay
                    </button>
                )}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* UPGRADED EDITOR AREA - BUG FIX APPLIED HERE */}
                <div className="flex-1 p-6 flex flex-col border-r border-slate-800/50 bg-slate-950/20">
                    <div className="mb-2 px-2 flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Live_Collaborative_Editor // JS</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        </div>
                    </div>
                    
                    {/* FIXED: Wrapper with overflow-auto to prevent "Half-Screen" bug */}
                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-[2.5rem] overflow-auto shadow-inner focus-within:border-blue-500/20 transition-all custom-scrollbar">
                        <Editor
                            value={code}
                            onValueChange={handleCodeChange}
                            highlight={code => highlight(code, languages.js)}
                            padding={24}
                            style={{
                                fontFamily: '"Fira code", "Fira Mono", monospace',
                                fontSize: 14,
                                minHeight: '100%',
                                backgroundColor: 'transparent',
                            }}
                            className="prism-editor"
                        />
                    </div>
                </div>

                {/* CHAT SIDEBAR */}
                <div className="w-96 bg-slate-950/50 flex flex-col">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
                        <MessageSquare size={16} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure_Channel</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.senderId === userId ? 'items-end' : 'items-start'}`}>
                                <span className="text-[7px] font-black text-slate-600 uppercase mb-1 tracking-tighter">{msg.role}</span>
                                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-[11px] leading-snug ${
                                    msg.senderId === userId 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700 shadow-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950">
                        <div className="relative">
                            <input 
                                type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Communicate fix..."
                                className="w-full bg-slate-900 border border-slate-800 p-3 pr-12 rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-all"
                            />
                            <button type="submit" className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all">
                                <Send size={14} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WarRoom;