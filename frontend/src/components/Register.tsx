import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { registerUser, getGoogleOAuthUrl } from '../api/auth';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // NEW: Holds the verification instruction message
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typedTitle, setTypedTitle] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  
  const location = useLocation();

  const title = "New.Instance";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'oauth_failed') {
      setError('OAuth_Authentication_Failed');
    }
  }, [location]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    
    try {
      const res = await registerUser({ email, password, name });
      // Catch the backend success message instead of navigating away
      setMessage(res.message || 'Registration initiated. Check your email for the verification link.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setError('');
      const url = await getGoogleOAuthUrl();
      window.location.href = url;
    } catch (err) {
      setError('Failed_To_Initialize_OAuth');
    }
  };

  return (
    <div 
      className={`relative bg-zinc-900/80 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,1)] w-full max-w-lg border border-zinc-600/40 transform transition-all duration-1000 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      <div className="mb-12 text-center h-12">
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

      {/* --- VERIFICATION REQUIRED INSTRUCTION CARD --- */}
      {message ? (
        <div className="bg-blue-950/80 border border-blue-500/50 text-blue-200 p-6 rounded-xl mb-6 text-sm backdrop-blur-sm shadow-inner space-y-4 text-center animate-fade-in">
          <p className="font-bold uppercase tracking-widest text-base text-white">Verification_Required</p>
          <p className="text-xs leading-relaxed text-zinc-300">{message}</p>
          <p className="text-xs text-zinc-400">This link will self-terminate in <span className="text-white font-bold">5 minutes</span>.</p>
          <div className="pt-2">
            <Link 
              to="/login"
              className="inline-block bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs tracking-widest uppercase font-bold py-3 px-6 rounded-xl border border-zinc-600 transition-colors"
            >
              Return_To_Login
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* --- PRIMARY REGISTRATION FORM --- */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3 group">
              <label className="flex items-center justify-between text-sm font-semibold text-zinc-300 uppercase tracking-widest group-focus-within:text-white transition-colors">
                <span>Identifier</span>
                <span className="text-zinc-600 text-xs tracking-normal lowercase">(Optional)</span>
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 text-lg rounded-xl bg-black/50 border border-zinc-700 text-gray-100 placeholder-zinc-600 focus:bg-zinc-950 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all duration-300 shadow-inner"
                placeholder="Alias"
              />
            </div>

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

            <div className="space-y-3 group">
              <label className="text-sm font-semibold text-zinc-300 uppercase tracking-widest group-focus-within:text-white transition-colors">
                Security_Key
              </label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 text-lg rounded-xl bg-black/50 border border-zinc-700 text-gray-100 placeholder-zinc-600 focus:bg-zinc-950 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all duration-300 shadow-inner"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-zinc-200 to-zinc-400 hover:from-white hover:to-zinc-300 text-black font-extrabold text-lg tracking-wider uppercase py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Transmitting...' : 'Generate_Profile'}
            </button>
          </form>

          {/* --- DIVIDER --- */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-zinc-700/50"></div>
            <div className="flex-grow border-t border-zinc-700/50"></div>
          </div>

          {/* --- GOOGLE OAUTH BUTTON --- */}
          <div className="mt-8">
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-4 bg-zinc-950/50 hover:bg-zinc-800 text-gray-200 font-bold py-3.5 px-4 rounded-xl border border-zinc-700 shadow-inner hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="tracking-wider uppercase text-sm">Register_With_Google</span>
            </button>
          </div>
        </>
      )}

      <div className="mt-10 pt-6 border-t border-zinc-700/50 text-center">
        <p className="text-base text-zinc-400">
          Already verified?{' '}
          <Link to="/login" className="text-zinc-200 hover:text-white font-bold transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            Authenticate_Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;