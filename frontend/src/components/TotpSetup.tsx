import React, { useState, useEffect } from 'react';
import { generateTotpSecret, verifyTotpSetup, disableTotp, getCurrentUser } from '../api/auth'; // assuming getMe or your useAuth hook is here

const TotpSetup = () => {
  const [step, setStep] = useState<'initial' | 'qr' | 'success'>('initial');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isAlreadyEnabled, setIsAlreadyEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);

  // Check the database state directly from the user profile on mount
  useEffect(() => {
    const fetchUserTotpStatus = async () => {
      try {
        const userData = await getCurrentUser(); // or read from your AuthContext if you already store it globally
        if (userData?.totpCredential?.verified) {
          setIsAlreadyEnabled(true);
        }
      } catch (err) {
        console.error('Failed to sync user security state', err);
      } finally {
        setIsProcessing(false);
      }
    };
    fetchUserTotpStatus();
  }, []);

  const handleStartSetup = async () => {
    setError('');
    setIsProcessing(true);
    try {
      const data = await generateTotpSecret();
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
      setStep('qr');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to generate TOTP secret';
      if (msg.includes('already enabled')) {
        setIsAlreadyEnabled(true);
      }
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);
    try {
      await verifyTotpSetup(token);
      setStep('success');
      setIsAlreadyEnabled(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid verification code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTerminate = async () => {
    if (!window.confirm('Are you sure you want to terminate this authenticator? You will need to scan a new QR code.')) {
      return;
    }

    setError('');
    setIsProcessing(true);
    try {
      await disableTotp();
      setIsAlreadyEnabled(false);
      setStep('initial');
      setToken('');
      setSecret('');
      setQrCodeUrl('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to terminate authenticator');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing && !isAlreadyEnabled && step === 'initial') {
    return (
      <div className="bg-black/30 border border-zinc-700/50 rounded-2xl p-8 text-center text-zinc-400">
        <p className="animate-pulse tracking-widest text-xs uppercase">Syncing Security State...</p>
      </div>
    );
  }

  if (isAlreadyEnabled && step !== 'qr') {
    return (
      <div className="bg-black/30 border border-zinc-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-950 border border-green-500/50 text-green-400 font-bold">
          ✓
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-widest text-zinc-200 uppercase mb-2">
            Authenticator_Active
          </h3>
          <p className="text-sm text-zinc-400">
            Your account is secured with an offline cryptographic authenticator app.
          </p>
        </div>

        {error && <div className="bg-red-950/80 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm">{error}</div>}

        <button 
          onClick={handleTerminate}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-red-950 to-red-900 hover:from-red-900 hover:to-red-800 text-red-200 font-bold py-3.5 px-4 rounded-xl border border-red-500/30 transition-all duration-300 tracking-widest text-xs uppercase shadow-[0_0_15px_rgba(220,38,38,0.1)]"
        >
          {isProcessing ? 'Terminating...' : 'Terminate_And_Reconfigure'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black/30 border border-zinc-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
      <h3 className="text-xl font-bold tracking-widest text-zinc-200 uppercase mb-2">
        Authenticator_App
      </h3>
      <p className="text-sm text-zinc-400 mb-6">
        Link an offline TOTP device (Google Authenticator, Authy) for multi-factor authorization.
      </p>

      {error && <div className="bg-red-950/80 border border-red-500/50 text-red-300 p-3 rounded-lg mb-6 text-sm">{error}</div>}

      {step === 'initial' && (
        <button 
          onClick={handleStartSetup}
          disabled={isProcessing}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-3.5 rounded-xl border border-zinc-600 transition-colors tracking-widest text-xs uppercase"
        >
          {isProcessing ? 'Initializing...' : 'Initialize_TOTP_Setup'}
        </button>
      )}

      {step === 'qr' && (
        <form onSubmit={handleVerify} className="space-y-6 text-center animate-fade-in">
          <div className="bg-white p-4 rounded-xl inline-block border border-zinc-700 shadow-inner">
            <img src={qrCodeUrl} alt="TOTP QR Code" className="w-48 h-48 mx-auto" />
          </div>
          <p className="text-xs text-zinc-400 font-mono break-all bg-black/40 p-2 rounded border border-zinc-800">Secret: {secret}</p>
          
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-2">Enter 6-Digit Code</label>
            <input 
              type="text" maxLength={6} required value={token} onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-zinc-700 text-gray-100 rounded-xl text-center tracking-widest text-xl focus:border-zinc-400 focus:outline-none transition-colors"
              placeholder="000000"
            />
          </div>

          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => { setStep('initial'); setIsAlreadyEnabled(false); }}
              className="w-1/3 bg-black/40 hover:bg-zinc-800 text-zinc-400 font-bold py-3 rounded-xl border border-zinc-700 transition-colors tracking-widest text-xs uppercase"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isProcessing}
              className="w-2/3 bg-zinc-200 hover:bg-white text-black font-extrabold py-3 rounded-xl transition-colors tracking-widest text-xs uppercase shadow-lg"
            >
              {isProcessing ? 'Verifying...' : 'Verify_And_Lock'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TotpSetup;