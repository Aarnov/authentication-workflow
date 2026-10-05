import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../api/auth';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  if (!email || !token) {
    return (
      <div className="bg-red-950/80 border border-red-500/50 text-red-300 p-6 rounded-xl text-center max-w-md w-full">
        Invalid or missing recovery parameters.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setIsSubmitting(true);
    
    try {
      const res = await resetPassword({ email, token, newPassword });
      setMessage(res.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-zinc-900/80 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,1)] w-full max-w-lg border border-zinc-600/40 animate-fade-in">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">
          System.Initialize_Key
        </h2>
        <p className="text-zinc-500 text-xs mt-2 font-mono tracking-wider">{email}</p>
      </div>

      {error && (
        <div className="bg-red-950/80 border border-red-500/50 text-red-300 p-4 rounded-xl mb-6 text-sm backdrop-blur-sm shadow-inner">
          {error}
        </div>
      )}

      {message ? (
        <div className="bg-green-950/80 border border-green-500/50 text-green-300 p-4 rounded-xl mb-6 text-sm backdrop-blur-sm shadow-inner text-center">
          {message}
          <p className="mt-2 text-xs opacity-75">Redirecting to login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3 group">
            <label className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">
              New_Cryptographic_Key
            </label>
            <input 
              type="password" 
              required 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-5 py-4 text-lg rounded-xl bg-black/50 border border-zinc-700 text-gray-100 placeholder-zinc-600 focus:bg-zinc-950 focus:outline-none focus:border-zinc-400 transition-all duration-300"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-3 group">
            <label className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">
              Confirm_Key
            </label>
            <input 
              type="password" 
              required 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-4 text-lg rounded-xl bg-black/50 border border-zinc-700 text-gray-100 placeholder-zinc-600 focus:bg-zinc-950 focus:outline-none focus:border-zinc-400 transition-all duration-300"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 bg-gradient-to-r from-zinc-200 to-zinc-400 hover:from-white text-black font-extrabold text-lg tracking-wider uppercase py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Set_New_Key'}
          </button>
        </form>
      )}
      
      <div className="mt-10 pt-6 border-t border-zinc-700/50 text-center">
        <Link to="/login" className="text-xs tracking-widest uppercase text-zinc-500 hover:text-zinc-300 font-bold transition-colors">
          Cancel_Sequence
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;