import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      {/* Notice 'fixed' instead of 'absolute' so orbs stay in place if you scroll */}
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black relative overflow-hidden font-mono text-gray-200 flex items-center justify-center p-4">
        {/* Global Animated Background Orbs */}
        <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-zinc-600/15 rounded-full blur-[100px] animate-pulse mix-blend-screen pointer-events-none"></div>
        <div className="fixed bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-neutral-600/10 rounded-full blur-[100px] animate-pulse mix-blend-screen delay-1000 pointer-events-none"></div>

        {/* The current route's component will be injected right here */}
        <div className="relative z-10 w-full flex justify-center">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;