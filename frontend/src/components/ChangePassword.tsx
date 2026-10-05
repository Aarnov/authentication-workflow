import React, { useState } from 'react';
import { changePassword } from '../api/auth';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }
    if (newPassword.length < 8) {
      return setError('New password must be at least 8 characters');
    }

    setIsSubmitting(true);
    try {
      const res = await changePassword({ currentPassword, newPassword });
      setMessage(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black/30 border border-zinc-700/50 rounded-2xl p-6 sm:p-8 mt-8 backdrop-blur-md">
      <h3 className="text-xl font-bold tracking-widest text-zinc-200 uppercase mb-2">
        Update_Access_Key
      </h3>
      <p className="text-sm text-zinc-400 mb-6">
        Modify your primary cryptographic key. Local authorization required.
      </p>

      {error && <div className="bg-red-950/80 border border-red-500/50 text-red-300 p-3 rounded-lg mb-6 text-sm">{error}</div>}
      {message && <div className="bg-green-950/80 border border-green-500/50 text-green-300 p-3 rounded-lg mb-6 text-sm">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-2">Current Key</label>
          <input 
            type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 bg-black/50 border border-zinc-700 text-gray-100 rounded-xl focus:border-zinc-400 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-2">New Key</label>
          <input 
            type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 bg-black/50 border border-zinc-700 text-gray-100 rounded-xl focus:border-zinc-400 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-2">Confirm New Key</label>
          <input 
            type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-black/50 border border-zinc-700 text-gray-100 rounded-xl focus:border-zinc-400 focus:outline-none transition-colors"
          />
        </div>
        
        <button 
          type="submit" disabled={isSubmitting}
          className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-3 rounded-xl border border-zinc-600 transition-colors tracking-widest text-sm uppercase disabled:opacity-50"
        >
          {isSubmitting ? 'Updating...' : 'Commit_Change'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;