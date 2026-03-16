// components/dashboard/AdminSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { isAdmin } from '@/lib/auth';
import Link from 'next/link';

export default function AdminSection() {
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const admin = await isAdmin();
        setHasAdminAccess(admin);
      } catch (err) {
        console.error('Failed to check admin status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (isLoading || !hasAdminAccess) return null;

  return (
    <div className="border-t border-white/[0.05] mx-4 my-3 pt-3">
      <p className="text-[10px] uppercase tracking-widest text-neutral-600 px-1 mb-2">Administration</p>
      <Link
        href="/admin"
        className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/15 transition-all"
      >
        <span>🛠️</span>
        <span className="text-[11px] text-amber-300">Admin Panel</span>
        <span className="ml-auto text-[9px] text-amber-400 font-medium">→</span>
      </Link>
    </div>
  );
}
