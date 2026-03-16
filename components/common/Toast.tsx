// components/common/Toast.tsx
// Simple toast notification component

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onDismiss: () => void;
}

export default function Toast({ message, type = 'info', duration = 2000, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const bgColor = {
    success: 'bg-green-500/20 border-green-500/30',
    info: 'bg-blue-500/20 border-blue-500/30',
    warning: 'bg-amber-500/20 border-amber-500/30',
    error: 'bg-red-500/20 border-red-500/30',
  }[type];

  const textColor = {
    success: 'text-green-400',
    info: 'text-blue-400',
    warning: 'text-amber-400',
    error: 'text-red-400',
  }[type];

  const iconColor = {
    success: 'text-green-500',
    info: 'text-blue-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
  }[type];

  return (
    <div
      className={`fixed bottom-6 left-6 max-w-sm px-4 py-3 rounded-lg border ${bgColor} ${textColor} text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50`}
    >
      {type === 'success' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconColor}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {type === 'info' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconColor}>
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      )}
      {type === 'warning' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconColor}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )}
      {type === 'error' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconColor}>
          <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      )}
      <span>{message}</span>
    </div>
  );
}
