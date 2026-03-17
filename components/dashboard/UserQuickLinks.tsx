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
    <div className="border-t border-gray-300 mx-4 my-3 pt-3">
      <p className="text-[10px] uppercase tracking-widest text-neutral-700 px-1 mb-2">Your Library</p>
      <div className="space-y-1.5 px-1">
        <Link
          href="/favorites"
          className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-150 transition-all"
        >
          <span className="text-amber-500">⭐</span>
          <span className="flex-1 text-[11px] text-neutral-800">Favorites</span>
          <span className="text-[9px] text-neutral-700 bg-gray-200 px-1.5 py-0.5 rounded">
            {favCount}
          </span>
        </Link>
        <Link
          href="/collections"
          className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-150 transition-all"
        >
          <span className="text-blue-600">📚</span>
          <span className="flex-1 text-[11px] text-neutral-800">Collections</span>
          <span className="text-[9px] text-neutral-700 bg-gray-200 px-1.5 py-0.5 rounded">
            {collCount}
          </span>
        </Link>
      </div>
    </div>
  );
}
