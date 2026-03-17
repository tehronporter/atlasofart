// components/dashboard/UserProfileSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { getUser, getProfile, signOut } from '@/lib/auth';

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
      <div className="px-3.5 py-2 space-y-1.5">
        <div className="h-4 bg-white/15 rounded animate-pulse" />
        <div className="h-3 bg-white/10 rounded animate-pulse w-2/3" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="border-t border-white/[0.1] mx-3.5 pt-2.5 mt-1">
      <p className="text-[10px] uppercase tracking-widest text-white/50 mb-2 px-0.5">Account</p>
      <div className="bg-white/[0.1] border border-white/[0.15] rounded-lg px-2.5 py-2 mb-2">
        <div className="flex items-center gap-2">
          {/* User icon */}
          <div className="w-6 h-6 rounded-full bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/80">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-white font-medium truncate">{profile?.full_name || user.email}</p>
            <p className="text-[9px] text-white/50 truncate">{user.email}</p>
          </div>
          {profile?.role === 'admin' && (
            <div className="ml-auto shrink-0" title="Admin">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/60">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[10px] rounded-lg bg-white/[0.08] border border-white/[0.12] text-white/70 hover:bg-white/[0.15] hover:text-white transition-all"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign Out
      </button>
    </div>
  );
}
