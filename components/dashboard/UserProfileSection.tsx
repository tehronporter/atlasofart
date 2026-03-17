// components/dashboard/UserProfileSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { getUser, getProfile, signOut } from '@/lib/auth';
import Link from 'next/link';

export default function UserProfileSection() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getUser();
        if (currentUser) {
          setUser(currentUser);
          const userProfile = await getProfile(currentUser.id);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="px-3.5 py-3 space-y-2">
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="border-t border-gray-300 mx-4 my-3 pt-3">
      <div className="px-1">
        <p className="text-[10px] uppercase tracking-widest text-neutral-700 mb-2">Account</p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 mb-2.5">
          <p className="text-[11px] text-neutral-900 font-medium mb-0.5">{profile?.full_name || user.email}</p>
          <p className="text-[9px] text-neutral-700">{user.email}</p>
          {profile?.role === 'admin' && (
            <p className="text-[8px] text-amber-400 mt-1.5 font-medium uppercase tracking-wider">👑 Admin</p>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className="w-full px-2.5 py-2 text-[10px] rounded-lg bg-gray-100 border border-gray-200 text-neutral-700 hover:bg-gray-200 hover:text-neutral-900 transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
