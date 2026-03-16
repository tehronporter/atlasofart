// components/auth/UserMenu.tsx - User menu component
// Phase 14: Auth UI

'use client';

import { useState, useEffect } from 'react';
import { getUser, signOut } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getUser().then(setUser).catch(() => setUser(null));
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    window.location.reload();
  };

  if (!user) {
    return (
      <a
        href="/login"
        className="px-4 py-2 bg-amber-500 text-neutral-900 rounded font-medium hover:bg-amber-400 transition-colors text-sm"
      >
        Sign In
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors"
      >
        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-neutral-900 text-xs font-bold">
          {user.email?.[0].toUpperCase()}
        </div>
        <span className="text-sm text-neutral-300 hidden sm:block">
          {user.email?.split('@')[0]}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-800">
              <p className="text-sm text-white truncate">{user.email}</p>
            </div>
            
            <a
              href="/collections"
              className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              My Collections
            </a>
            
            <a
              href="/favorites"
              className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              Favorites
            </a>

            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-800 hover:text-red-300"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
