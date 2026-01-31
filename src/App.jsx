import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase'; 
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Login from './components/Login';
import PanicButton from './components/PanicButton';
import MentorDashboard from './components/MentorDashboard';
import WarRoom from './components/WarRoom';
import TopUp from './components/TopUp'; // Import the new TopUp component
import { LogOut, Zap, DollarSign, Plus } from 'lucide-react';
import LandingPage from './components/LandingPage';

function App() {
  const { user, profile, logout, loading } = useAuth();
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;

    const fieldToWatch = profile.role === 'developer' ? 'requesterId' : 'mentorId';
    const q = query(
      collection(db, "help_requests"),
      where(fieldToWatch, "==", user.uid),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActiveSessionId(snapshot.docs[0].id);
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

  if (!user) {
    if (showLogin) {
      return <Login />;
    } else {
      return <LandingPage onGetStarted={() => setShowLogin(true)} />;
    }
  }

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

            {/* CLICKABLE WALLET CHIP */}
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
          <>
            {profile?.role === 'mentor' ? (
              <MentorDashboard userId={user.uid} /> 
            ) : (
              <div className="max-w-xl mx-auto space-y-8">
                <header className="text-center">
                  <h1 className="text-6xl font-black mb-4 tracking-tighter uppercase italic text-white">Stuck?</h1>
                  <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em]">Broadcast your signal to the network.</p>
                </header>
                {/* Pass profile to PanicButton to check balance */}
                <PanicButton userId={user.uid} profile={profile} onSessionStart={(id) => setActiveSessionId(id)} />
              </div>
            )}
          </>
        )}
      </main>

      {/* TOP-UP MODAL OVERLAY */}
      {showTopUp && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="relative w-full max-w-md">
                <button 
                    onClick={() => setShowTopUp(false)}
                    className="absolute -top-10 right-0 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-[0.2em] transition-colors"
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