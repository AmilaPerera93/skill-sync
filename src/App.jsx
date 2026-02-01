import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase'; 
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Login from './components/Login';
import PanicButton from './components/PanicButton';
import MentorDashboard from './components/MentorDashboard';
import WarRoom from './components/WarRoom';
import TopUp from './components/TopUp';
import LandingPage from './components/LandingPage';
import SessionHistory from './components/SessionHistory'; // Ensure this is created
import { LogOut, Zap, DollarSign, Plus } from 'lucide-react';

function App() {
  const { user, profile, logout, loading } = useAuth();
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // 1. Persistent Session Listener
  useEffect(() => {
    if (!user || !profile) return;

    const fieldToWatch = profile.role === 'developer' ? 'requesterId' : 'mentorId';
    const q = query(
      collection(db, "help_requests"),
      where(fieldToWatch, "==", user.uid),
      where("status", "in", ["pending", "active"]) 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const session = snapshot.docs[0];
        // Only set activeSessionId for WarRoom if status is actually 'active'
        if (session.data().status === 'active') {
            setActiveSessionId(session.id);
        }
      } else {
        setActiveSessionId(null);
      }
    }, (error) => console.error("Session Listener Error:", error));

    return () => unsubscribe();
  }, [user, profile]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Zap className="text-blue-500 animate-pulse" size={48} />
    </div>
  );

  // 2. Public Routing (Landing vs Login)
  if (!user) {
    return showLogin ? (
      <Login />
    ) : (
      <LandingPage onGetStarted={() => setShowLogin(true)} />
    );
  }

  // 3. Authenticated App Shell
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <nav className="border-b border-slate-900 p-4 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic shadow-lg shadow-blue-500/20">S</div>
              <h2 className="font-black italic tracking-tighter text-xl uppercase tracking-widest">
                  Skill_Sync <span className="text-blue-500">//</span> {profile?.role}
              </h2>
            </div>

            <button 
                onClick={() => setShowTopUp(true)}
                className="hidden sm:flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-2xl shadow-inner hover:border-blue-500/50 transition-all group"
            >
                <div className="bg-green-500/20 p-1 rounded-lg group-hover:bg-blue-500/20 transition-all">
                    <DollarSign size={14} className="text-green-500 group-hover:text-blue-500" />
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-[8px] font-black text-slate-500 uppercase leading-none">Balance</span>
                    <span className="text-sm font-black text-white font-mono">
                        ${profile?.walletBalance?.toFixed(2) || "0.00"}
                    </span>
                </div>
                <Plus size={12} className="text-blue-500 ml-1 opacity-50 group-hover:opacity-100" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-[10px] font-mono text-slate-500 uppercase tracking-widest">{user.email}</span>
            <button onClick={logout} className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 transition-all active:scale-90">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-10 px-4">
        {activeSessionId ? (
          <WarRoom 
            sessionId={activeSessionId} 
            userRole={profile?.role} 
            userId={user.uid} 
            onLeave={() => setActiveSessionId(null)} 
          />
        ) : (
          <div className="max-w-4xl mx-auto space-y-16">
            {profile?.role === 'mentor' ? (
              <MentorDashboard userId={user.uid} /> 
            ) : (
              <div className="space-y-12">
                <header className="text-center pt-10">
                  <h1 className="text-6xl font-black mb-4 tracking-tighter uppercase italic text-white leading-none">Stuck?</h1>
                  <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Broadcast your signal to the network.</p>
                </header>
                <PanicButton userId={user.uid} profile={profile} onSessionStart={(id) => setActiveSessionId(id)} />
                <SessionHistory userId={user.uid} role="developer" />
              </div>
            )}
          </div>
        )}
      </main>

      {showTopUp && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="relative w-full max-w-md">
                <button 
                    onClick={() => setShowTopUp(false)}
                    className="absolute -top-10 right-0 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-[0.2em]"
                >
                    [ Close_Terminal ]
                </button>
                <TopUp userId={user.uid} onComplete={() => setShowTopUp(false)} />
            </div>
        </div>
      )}
    </div>
  );
}

export default App;