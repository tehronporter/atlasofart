// components/auth/AuthButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { getUser, signOut } from '@/lib/auth';
import Link from 'next/link';

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getUser();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      window.location.reload();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-2">
        <div className="h-9 w-full bg-white/[0.04] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] text-neutral-600 px-2">
          Signed in as <span className="text-neutral-400">{user.email}</span>
        </p>
        <button
          onClick={handleSignOut}
          className="w-full px-3 py-2 text-[11px] rounded-lg bg-neutral-800/50 border border-neutral-700/50 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-all"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Link
        href="/login"
        className="flex-1 px-3 py-2 text-[11px] rounded-lg border border-neutral-700/50 text-neutral-300 hover:bg-white/[0.04] hover:text-white transition-all text-center"
      >
        Sign In
      </Link>
      <Link
        href="/login"
        className="flex-1 px-3 py-2 text-[11px] rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all text-center"
      >
        Sign Up
      </Link>
    </div>
  );
}
