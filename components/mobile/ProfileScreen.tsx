// components/mobile/ProfileScreen.tsx
// Mobile full-screen profile & auth view

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUser, signOut } from '@/lib/auth';

interface ProfileScreenProps {
  savedCount: number;
}

export default function ProfileScreen({ savedCount }: ProfileScreenProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSignOut = async () => {
    await signOut().catch(() => {});
    setUser(null);
  };

  return (
    <div className="fixed inset-0 bg-white z-30 flex flex-col lg:hidden" style={{ paddingBottom: 'max(4rem, calc(4rem + env(safe-area-inset-bottom)))' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4 border-b border-[#e5e7eb] shrink-0">
        <h1 className="text-[20px] font-semibold text-[#111111]">Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-16 bg-[#f9fafb] rounded-xl animate-pulse" />
            <div className="h-12 bg-[#f9fafb] rounded-xl animate-pulse" />
          </div>
        ) : user ? (
          <>
            {/* User info card */}
            <div className="flex items-center gap-4 p-4 bg-[#f9fafb] rounded-2xl">
              <div className="w-14 h-14 rounded-full bg-[#2e5bff] flex items-center justify-center shrink-0">
                <span className="text-white text-[20px] font-semibold">
                  {(user.email?.[0] ?? '?').toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#111111] truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-[12px] text-[#9ca3af] truncate mt-0.5">{user.email}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-[#f9fafb] rounded-2xl text-center">
                <p className="text-[24px] font-semibold text-[#2e5bff]">{savedCount}</p>
                <p className="text-[11px] text-[#9ca3af] mt-0.5">Saved</p>
              </div>
              <div className="p-4 bg-[#f9fafb] rounded-2xl text-center">
                <p className="text-[24px] font-semibold text-[#111111]">∞</p>
                <p className="text-[11px] text-[#9ca3af] mt-0.5">Artworks</p>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full py-3.5 rounded-xl border border-[#e5e7eb] text-[13px] font-medium text-[#6b7280] active:bg-[#f9fafb] transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            {/* Guest state */}
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <div className="w-20 h-20 rounded-full bg-[#f9fafb] flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#d1d5db]">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p className="text-[17px] font-semibold text-[#111111]">Sign in to Atlas of Art</p>
                <p className="text-[13px] text-[#9ca3af] mt-1.5 leading-relaxed">Save artworks, track your journey,<br />and explore art across history.</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full py-3.5 rounded-xl bg-[#2e5bff] text-white text-[14px] font-semibold text-center active:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="block w-full py-3.5 rounded-xl border border-[#e5e7eb] text-[14px] font-medium text-[#111111] text-center active:bg-[#f9fafb] transition-colors"
              >
                Create Account
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
