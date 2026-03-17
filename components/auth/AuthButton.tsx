// components/auth/AuthButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { getUser } from '@/lib/auth';
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

  if (isLoading) {
    return (
      <div className="flex gap-2">
        <div className="h-8 w-full bg-white/15 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Link
        href="/login"
        className="flex-1 px-3 py-2 text-[11px] rounded-lg border border-white/30 text-white/80 hover:bg-white/15 hover:text-white transition-all text-center"
      >
        Sign In
      </Link>
      <Link
        href="/login"
        className="flex-1 px-3 py-2 text-[11px] rounded-lg bg-white text-[#2e53ff] font-semibold hover:bg-white/90 transition-all text-center"
      >
        Sign Up
      </Link>
    </div>
  );
}
