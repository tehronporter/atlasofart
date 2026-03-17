// components/dashboard/UserQuickLinks.tsx
'use client';

import { useState, useEffect } from 'react';
import { getUser, getUserFavorites, getUserCollections } from '@/lib/auth';
import Link from 'next/link';

export default function UserQuickLinks() {
  const [user, setUser] = useState<any>(null);
  const [favCount, setFavCount] = useState(0);
  const [collCount, setCollCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getUser();
        if (currentUser) {
          setUser(currentUser);
          const favs = await getUserFavorites();
          const colls = await getUserCollections();
          setFavCount(favs?.length || 0);
          setCollCount(colls?.length || 0);
        }
      } catch (err) {
        console.error('Failed to load quick links:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading || !user) return null;

  return (
    <div className="border-t border-white/[0.1] mx-3.5 pt-2.5 mt-2">
      <p className="text-[10px] uppercase tracking-widest text-white/50 mb-2 px-0.5">Your Library</p>
      <div className="space-y-1">
        <Link
          href="/favorites"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.15] hover:text-white transition-all"
        >
          {/* Star icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/60 shrink-0">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="flex-1 text-[11px] text-white/80">Favorites</span>
          <span className="text-[9px] text-white/50 bg-white/[0.1] px-1.5 py-0.5 rounded">{favCount}</span>
        </Link>
        <Link
          href="/collections"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.15] hover:text-white transition-all"
        >
          {/* Layers/collection icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/60 shrink-0">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span className="flex-1 text-[11px] text-white/80">Collections</span>
          <span className="text-[9px] text-white/50 bg-white/[0.1] px-1.5 py-0.5 rounded">{collCount}</span>
        </Link>
      </div>
    </div>
  );
}
