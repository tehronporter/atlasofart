// app/admin/page.tsx
// Atlas of Art — Admin Dashboard

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { IngestionPanel } from '@/components/admin/IngestionPanel';
import { ArtworkManager } from '@/components/admin/ArtworkManager';
import { AnalyticsPanel } from '@/components/admin/AnalyticsPanel';
import { ModerationPanel } from '@/components/admin/ModerationPanel';

interface Stats {
  totalArtworks: number;
  gettyArtworks: number;
  withCoordinates: number;
  withImages: number;
}

interface IngestLog {
  id: string;
  batch_id: string;
  status: string;
  artworks_added: number;
  artworks_updated: number;
  errors?: string[] | null;
  metadata?: any;
  created_at: string;
  completed_at?: string | null;
}

const tabs = [
  { id: 'ingestion', label: 'Ingestion', icon: '⬇️' },
  { id: 'artworks', label: 'Artworks', icon: '🖼️' },
  { id: 'moderation', label: 'Moderation', icon: '⚠️' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
];

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('ingestion');
  const [stats, setStats] = useState<Stats>({ totalArtworks: 0, gettyArtworks: 0, withCoordinates: 0, withImages: 0 });
  const [logs, setLogs] = useState<IngestLog[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check authorization on mount
  useEffect(() => {
    const checkAuth = async () => {
      const authorized = await isAdmin();
      if (!authorized) {
        router.push('/');
      } else {
        setIsAuthorized(true);
      }
    };
    checkAuth();
  }, [router]);

  const fetchStats = async () => {
    try {
      setStatsError(null);
      const res = await fetch('/api/ingest');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats ?? { totalArtworks: 0, gettyArtworks: 0, withCoordinates: 0, withImages: 0 });
        setLogs(data.recentLogs ?? []);
      } else {
        setStatsError(data.error || 'Failed to load stats');
      }
    } catch (err: any) {
      setStatsError(err.message || 'Network error');
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) fetchStats();
  }, [isAuthorized]);

  const dbConnected = !statsError;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-500/60 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500 text-sm">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-neutral-100">
      {/* Header */}
      <div className="border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-neutral-500 hover:text-neutral-300 transition-colors text-sm">
              ← Map
            </a>
            <span className="text-neutral-700">/</span>
            <h1 className="text-sm font-semibold text-white">Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-500' : 'bg-red-500'} shadow-[0_0_6px_currentColor]`} />
            <span className="text-xs text-neutral-500">
              {isLoadingStats ? 'Connecting…' : dbConnected ? 'Supabase connected' : 'Supabase error'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <AdminTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div>

        {activeTab === 'ingestion' && (
          <IngestionPanel
            stats={stats}
            logs={logs}
            isLoadingStats={isLoadingStats}
            statsError={statsError}
            onRefreshStats={fetchStats}
          />
        )}

        {activeTab === 'artworks' && <ArtworkManager />}

        {activeTab === 'moderation' && <ModerationPanel />}

        {activeTab === 'analytics' && <AnalyticsPanel />}
      </div>
    </div>
  );
}
