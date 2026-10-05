import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    
    try {
      const res = await requestPasswordReset(email);
      setMessage(res.message);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-zinc-900/80 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,1)] w-full max-w-lg border border-zinc-600/40 animate-fade-in">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">
          System.Recovery
        </h2>
      </div>

      {error && (
        <div className="bg-red-950/80 border border-red-500/50 text-red-300 p-4 rounded-xl mb-6 text-sm backdrop-blur-sm shadow-inner">
          {error}
        </div>
      )}

      {message ? (
        <div className="bg-green-950/80 border border-green-500/50 text-green-300 p-4 rounded-xl mb-6 text-sm backdrop-blur-sm shadow-inner text-center">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3 group">
            <label className="text-sm font-semibold text-zinc-300 uppercase tracking-widest group-focus-within:text-white transition-colors">
              Account_Identifier
            </label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 text-lg rounded-xl bg-black/50 border border-zinc-700 text-gray-100 placeholder-zinc-600 focus:bg-zinc-950 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all duration-300"
              placeholder="user@network.local"
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 bg-gradient-to-r from-zinc-200 to-zinc-400 hover:from-white hover:to-zinc-300 text-black font-extrabold text-lg tracking-wider uppercase py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Transmitting...' : 'Request_Reset_Link'}
          </button>
        </form>
      )}

      <div className="mt-10 pt-6 border-t border-zinc-700/50 text-center">
        <Link to="/login" className="text-xs tracking-widest uppercase text-zinc-500 hover:text-zinc-300 font-bold transition-colors">
          Return_To_Primary_Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;