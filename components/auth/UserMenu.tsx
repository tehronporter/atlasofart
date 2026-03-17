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
        className="px-4 py-2 bg-[#2e53ff] text-white rounded font-medium hover:bg-[#1e3fd4] transition-colors text-sm"
      >
        Sign In
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
      >
        <div className="w-6 h-6 bg-[#2e53ff] rounded-full flex items-center justify-center text-white text-xs font-bold">
          {user.email?.[0].toUpperCase()}
        </div>
        <span className="text-sm text-neutral-700 hidden sm:block">
          {user.email?.split('@')[0]}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm text-neutral-900 truncate">{user.email}</p>
            </div>

            <a
              href="/collections"
              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-gray-100 hover:text-neutral-900"
            >
              My Collections
            </a>

            <a
              href="/favorites"
              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-gray-100 hover:text-neutral-900"
            >
              Favorites
            </a>

            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
