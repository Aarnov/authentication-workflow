import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestEmailOtp, verifyEmailOtp } from '../api/auth';

const OtpLogin = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const [typedTitle, setTypedTitle] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  
  const navigate = useNavigate();
  const title = "System.OTP_Auth";

  // Handle the typing animation
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

  // Handle the countdown timer for the Resend button
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    
    try {
      await requestEmailOtp(email);
      setStep(2);
      setResendTimer(60); // Start 60-second cooldown
      setMessage('Authorization key transmitted to network address.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to request key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await verifyEmailOtp({ email, code });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid authorization key');
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

      {message && (
        <div className="bg-green-950/80 border border-green-500/50 text-green-300 p-4 rounded-xl mb-6 text-base backdrop-blur-sm shadow-inner">
          {message}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-6">
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
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 bg-gradient-to-r from-zinc-200 to-zinc-400 hover:from-white hover:to-zinc-300 text-black font-extrabold text-lg tracking-wider uppercase py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Transmitting...' : 'Request_Key'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="space-y-3 group text-center">
            <label className="text-sm font-semibold text-zinc-300 uppercase tracking-widest group-focus-within:text-white transition-colors">
              Authorization_Key
            </label>
            <p className="text-xs text-zinc-500 mt-1 mb-4">Sent to {email}</p>
            <input 
              type="text" 
              required 
              maxLength={6}
              value={code} 
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-5 py-4 text-center tracking-[1em] text-2xl font-mono rounded-xl bg-black/50 border border-zinc-700 text-gray-100 placeholder-zinc-600 focus:bg-zinc-950 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all duration-300 shadow-inner"
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

          {/* --- RESEND BUTTON --- */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => handleRequestOtp()}
              disabled={resendTimer > 0 || isSubmitting}
              className="text-xs font-bold tracking-widest uppercase text-zinc-400 hover:text-zinc-200 disabled:text-zinc-700 transition-colors"
            >
              {resendTimer > 0 
                ? `Awaiting_Signal... (${resendTimer}s)` 
                : 'Resend_Key'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-10 pt-6 border-t border-zinc-700/50 text-center flex flex-col gap-3">
        <Link to="/login" className="text-xs tracking-widest uppercase text-zinc-500 hover:text-zinc-300 font-bold transition-colors">
          Return_To_Primary_Login
        </Link>
      </div>
    </div>
  );
};

export default OtpLogin;