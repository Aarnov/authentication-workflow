import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../api/auth';
import TotpSetup from './TotpSetup';
import ChangePassword from './ChangePassword';

const Dashboard = () => {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  // Drawer State Management
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [securityView, setSecurityView] = useState<'menu' | 'password' | 'totp'>('menu');
  
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        setError('Session_Terminated. Please re-authenticate.');
        setTimeout(() => navigate('/login'), 2000);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSecurityView('menu'), 500); // Reset view after slide-out animation
  };

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="bg-red-950/80 border border-red-500/50 text-red-300 p-6 rounded-xl text-lg backdrop-blur-sm shadow-[0_0_30px_rgba(220,38,38,0.2)] animate-pulse">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="text-zinc-400 text-xl tracking-widest animate-pulse">
          Decrypting_Session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-black text-gray-100 selection:bg-zinc-800 selection:text-white">
      {/* --- NAVBAR --- */}
      <nav className="w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold tracking-widest text-zinc-200 text-sm sm:text-base">AUTH_PLAYGROUND</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">SECURE</span>
        </div>
        
        {/* RIGHT SIDE: USERNAME & BLACK HEAD AVATAR */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-zinc-300 hidden sm:block">
            {user.name || 'Entity'}
          </span>
          
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="w-11 h-11 rounded-full bg-zinc-950 border border-zinc-700/80 flex items-center justify-center text-zinc-300 hover:border-zinc-400 hover:text-white transition-all duration-300 shadow-inner group cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-400"
            title="Open Security Terminal"
          >
            {/* Minimalist user avatar */}
            <svg className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div 
          className={`relative bg-zinc-900/80 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,1)] w-full max-w-xl border border-zinc-600/40 transform transition-all duration-1000 ease-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}
        >
          <div className="mb-10 border-b border-zinc-700/50 pb-6 flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">
              System.Status
            </h2>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>

          <div className="space-y-8">
            <div className="bg-black/50 border border-zinc-700/80 rounded-xl p-6 shadow-inner">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">Active_Entity_Profile</h3>
              
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
                  <span className="text-zinc-400 text-sm tracking-wide">Identifier:</span>
                  <span className="text-gray-100 font-medium text-lg">{user.name || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
                  <span className="text-zinc-400 text-sm tracking-wide">Network_Address:</span>
                  <span className="text-gray-100 font-medium text-lg">{user.email}</span>
                </div>
                <div className="flex flex-col space-y-2 pt-1">
                  <span className="text-zinc-500 text-xs tracking-wide">Security_ID:</span>
                  <span className="text-zinc-600 font-mono text-xs break-all bg-black/40 p-2 rounded border border-zinc-800">{user.id}</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-zinc-500 uppercase tracking-widest">
                Click the avatar icon in the top right navbar to open the security terminal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- BACKGROUND OVERLAY --- */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-500 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
      ></div>

      {/* --- SLIDING SECURITY DRAWER --- */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-zinc-900/95 backdrop-blur-3xl border-l border-zinc-700/50 shadow-2xl z-50 transform transition-transform duration-500 ease-out flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
          <h3 className="text-lg font-bold tracking-widest text-zinc-200 uppercase">
            Security_Terminal
          </h3>
          <button 
            onClick={closeDrawer}
            className="text-zinc-500 hover:text-zinc-300 font-mono text-xl transition-colors p-2"
          >
            [X]
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {securityView === 'menu' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-zinc-400 mb-6">Select a protocol to configure for this entity.</p>
              
              <button 
                onClick={() => setSecurityView('password')}
                className="w-full flex justify-between items-center bg-black/40 hover:bg-zinc-800 border border-zinc-800 p-5 rounded-xl transition-all duration-300 group"
              >
                <div className="text-left">
                  <span className="block text-sm font-bold text-zinc-300 uppercase tracking-widest mb-1 group-hover:text-white">Update_Access_Key</span>
                  <span className="block text-xs text-zinc-500">Modify your primary password</span>
                </div>
                <span className="text-zinc-600 font-mono group-hover:text-zinc-400">&gt;</span>
              </button>

              <button 
                onClick={() => setSecurityView('totp')}
                className="w-full flex justify-between items-center bg-black/40 hover:bg-zinc-800 border border-zinc-800 p-5 rounded-xl transition-all duration-300 group"
              >
                <div className="text-left">
                  <span className="block text-sm font-bold text-zinc-300 uppercase tracking-widest mb-1 group-hover:text-white">Authenticator_App</span>
                  <span className="block text-xs text-zinc-500">Link an offline TOTP device</span>
                </div>
                <span className="text-zinc-600 font-mono group-hover:text-zinc-400">&gt;</span>
              </button>
            </div>
          )}

          {securityView === 'password' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setSecurityView('menu')}
                className="text-xs tracking-widest text-zinc-500 hover:text-zinc-300 uppercase mb-6 flex items-center font-bold"
              >
                &lt; Return_To_Menu
              </button>
              <ChangePassword />
            </div>
          )}

          {securityView === 'totp' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setSecurityView('menu')}
                className="text-xs tracking-widest text-zinc-500 hover:text-zinc-300 uppercase mb-6 flex items-center font-bold"
              >
                &lt; Return_To_Menu
              </button>
              <TotpSetup />
            </div>
          )}
        </div>

        {/* --- DRAWER FOOTER / TERMINATE SESSION --- */}
        <div className="p-6 border-t border-zinc-800 bg-black/40">
          <button 
            onClick={handleLogout} 
            className="w-full bg-gradient-to-r from-red-950 to-red-900 hover:from-red-900 hover:to-red-800 text-red-200 font-extrabold tracking-wider uppercase py-4 px-4 rounded-xl border border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.1)] transition-all duration-300 active:scale-[0.98]"
          >
            Terminate_Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;