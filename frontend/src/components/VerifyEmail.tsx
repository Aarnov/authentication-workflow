import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api/auth';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();
  const hasRequested = useRef(false); // Prevents React 18 strict mode double-firing

  useEffect(() => {
    if (!email || !token) {
      setStatus('error');
      setErrorMessage('Missing verification parameters.');
      return;
    }

    if (hasRequested.current) return;
    hasRequested.current = true;

    const handleVerification = async () => {
      try {
        await verifyEmail({ email, token });
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 2500); // Auto-login and redirect
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.response?.data?.error || 'Verification protocol failed.');
      }
    };

    handleVerification();
  }, [email, token, navigate]);

  return (
    <div className="relative bg-zinc-900/80 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,1)] w-full max-w-md border border-zinc-600/40 text-center animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">
          System.Verify
        </h2>
        <p className="text-zinc-500 text-xs mt-2 font-mono tracking-wider">{email}</p>
      </div>

      {status === 'verifying' && (
        <div className="space-y-4 py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="text-zinc-400 text-sm tracking-widest animate-pulse uppercase">Authenticating Signature...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-green-950/80 border border-green-500/50 text-green-300 p-6 rounded-xl text-sm backdrop-blur-sm shadow-inner space-y-2">
          <p className="font-bold uppercase tracking-wider">Identity Verified</p>
          <p className="text-xs opacity-75">Session initialized. Redirecting to dashboard...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-950/80 border border-red-500/50 text-red-300 p-6 rounded-xl text-sm backdrop-blur-sm shadow-inner space-y-4">
          <p className="font-bold uppercase tracking-wider">Verification Error</p>
          <p className="text-xs">{errorMessage}</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs tracking-widest uppercase font-bold py-3 px-6 rounded-xl border border-zinc-600 transition-colors"
          >
            Return_To_Login
          </button>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;