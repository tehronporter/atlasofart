// components/mobile/MobileTabBar.tsx
// iOS-style bottom tab navigation for mobile

'use client';

import { useState } from 'react';
import haptics from '@/lib/haptics';

export type TabType = 'map' | 'search' | 'saved' | 'profile';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

interface MobileTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

function MapIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  const tabs: TabItem[] = [
    { id: 'map', label: 'Map', icon: <MapIcon /> },
    { id: 'search', label: 'Search', icon: <SearchIcon /> },
    { id: 'saved', label: 'Saved', icon: <HeartIcon /> },
    { id: 'profile', label: 'Profile', icon: <UserIcon /> },
  ];

  const handleTabPress = (tabId: TabType) => {
    if (tabId !== activeTab) {
      haptics.light();
      onTabChange(tabId);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] z-40 lg:hidden"
      style={{
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex items-center justify-around h-12">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabPress(tab.id)}
            className={`flex flex-col items-center justify-center w-16 h-12 text-[10px] font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[#2e5bff]'
                : 'text-[#9ca3af] hover:text-[#6b7280]'
            }`}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            <div className="w-6 h-6">{tab.icon}</div>
            <span className="mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
