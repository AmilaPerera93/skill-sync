import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { CreditCard, DollarSign, Zap, CheckCircle } from 'lucide-react';

const TopUp = ({ userId, onComplete }) => {
    const [amount, setAmount] = useState(25);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleDeposit = async () => {
        setLoading(true);
        try {
            const userRef = doc(db, "users", userId);
            // Use increment to safely add to the existing balance
            await updateDoc(userRef, {
                walletBalance: increment(Number(amount))
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                if (onComplete) onComplete();
            }, 2000);
        } catch (e) {
            console.error(e);
            alert("Deposit failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl max-w-md mx-auto">
            <div className="text-center mb-8">
                <div className="bg-blue-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="text-blue-500" size={32} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Refill Wallet</h2>
                <p className="text-slate-500 text-xs font-mono mt-1 uppercase tracking-widest">Instant Credit Injection</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
                {[10, 25, 50].map((val) => (
                    <button 
                        key={val} 
                        onClick={() => setAmount(val)}
                        className={`py-3 rounded-xl font-black text-sm transition-all border ${
                            amount === val ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                    >
                        ${val}
                    </button>
                ))}
            </div>

            <div className="relative mb-8">
                <DollarSign className="absolute left-4 top-4 text-slate-500" size={20} />
                <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-2xl text-white font-black outline-none focus:border-blue-500 transition-all"
                    placeholder="Custom Amount"
                />
            </div>

            <button 
                onClick={handleDeposit}
                disabled={loading || success}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-tighter flex items-center justify-center gap-3 transition-all ${
                    success ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-blue-600 hover:text-white'
                }`}
            >
                {loading ? "Processing..." : success ? <><CheckCircle size={20} /> Success!</> : <><CreditCard size={20} /> Deposit Credits</>}
            </button>
        </div>
    );
};

export default TopUp;