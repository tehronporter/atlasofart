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
        <div className="h-9 w-full bg-gray-200 rounded-lg animate-pulse" />
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
        className="flex-1 px-3 py-2 text-[11px] rounded-lg border border-gray-300 text-neutral-700 hover:bg-gray-100 hover:text-neutral-900 transition-all text-center"
      >
        Sign In
      </Link>
      <Link
        href="/login"
        className="flex-1 px-3 py-2 text-[11px] rounded-lg bg-[#1e5a96] border border-[#1e5a96] text-white hover:bg-[#164071] transition-all text-center"
      >
        Sign Up
      </Link>
    </div>
  );
}
