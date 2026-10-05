import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginTotp } from '../api/auth';

const TotpLogin = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [typedTitle, setTypedTitle] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  
  const navigate = useNavigate();
  const title = "System.App_Auth";

  // Typing animation effect
  useEffect(() => {
    setIsVisible(true);
    let i = 0;
    const timer = setInterval(() => {
      setTypedTitle(title.slice(0, i + 1));
      i++;
      if (i >= title.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await loginTotp({ email, code });
      navigate('/dashboard'); // Success! Send them to the protected dashboard
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid authenticator key');
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className={`relative bg-zinc-900/80 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,1)] w-full max-w-lg border border-zinc-600/40 transform transition-all duration-1000 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      <div className="mb-10 text-center h-12">
        <h2 className="text-4xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">
          {typedTitle}
          {isTyping && <span className="animate-pulse text-zinc-400 font-light">_</span>}
        </h2>
      </div>
      
      {error && (
        <div className="bg-red-950/80 border border-red-500/50 text-red-300 p-4 rounded-xl mb-6 text-base backdrop-blur-sm shadow-inner">
          {error}
        </div>
      )}

      <form onSubmit={handleVerifyTotp} className="space-y-6">
        <div className="space-y-3 group">
          <label className="text-sm font-semibold text-zinc-300 uppercase tracking-widest group-focus-within:text-white transition-colors">
            Email_Address
          </label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 text-lg rounded-xl bg-black/50 border border-zinc-700 text-gray-100 placeholder-zinc-600 focus:bg-zinc-950 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all duration-300 shadow-inner"
            placeholder="user@network.local"
          />
        </div>

        <div className="space-y-3 group text-center mt-8">
          <label className="text-sm font-semibold text-zinc-300 uppercase tracking-widest group-focus-within:text-white transition-colors">
            App_Generated_Key
          </label>
          <input 
            type="text" 
            required 
            maxLength={6}
            value={code} 
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full mt-4 px-5 py-4 text-center tracking-[1em] text-2xl font-mono rounded-xl bg-black/50 border border-zinc-700 text-gray-100 placeholder-zinc-600 focus:bg-zinc-950 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all duration-300 shadow-inner"
            placeholder="••••••"
          />
        </div>
        
        <button 
          type="submit"
          disabled={isSubmitting || code.length !== 6}
          className="w-full mt-6 bg-gradient-to-r from-zinc-200 to-zinc-400 hover:from-white hover:to-zinc-300 text-black font-extrabold text-lg tracking-wider uppercase py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Verifying...' : 'Initialize_Session'}
        </button>
      </form>

      <div className="mt-10 pt-6 border-t border-zinc-700/50 text-center flex flex-col gap-3">
        <Link to="/login" className="text-xs tracking-widest uppercase text-zinc-500 hover:text-zinc-300 font-bold transition-colors">
          Return_To_Primary_Login
        </Link>
      </div>
    </div>
  );
};

export default TotpLogin;