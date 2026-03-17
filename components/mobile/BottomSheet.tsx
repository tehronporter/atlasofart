// components/mobile/BottomSheet.tsx
// iOS-style bottom sheet with snap points, gestures, and momentum

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import haptics from '@/lib/haptics';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[]; // percentages: [30, 70, 95]
  initialSnap?: number; // index of initial snap point
  header?: React.ReactNode; // optional header with grab handle
  showGrabHandle?: boolean;
  className?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  snapPoints = [30, 70, 95],
  initialSnap = 1,
  header,
  showGrabHandle = true,
  className = '',
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef(0);
  const currentSnapRef = useRef(initialSnap);
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate sheet height based on snap point percentage
  const getSheetHeight = useCallback((snapPoint: number): number => {
    if (typeof window === 'undefined') return 0;
    return (window.innerHeight * snapPoint) / 100;
  }, []);

  // Handle drag start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    dragStartRef.current = e.touches[0].clientY;
    setIsDragging(true);
    haptics.light();
  }, []);

  // Handle drag movement
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!sheetRef.current || !isDragging) return;

    const currentY = e.touches[0].clientY;
    const diff = dragStartRef.current - currentY;
    const currentHeight = getSheetHeight(snapPoints[currentSnapRef.current]);

    // Calculate new height based on drag
    const newHeight = Math.max(0, currentHeight + diff);
    const screenHeight = window.innerHeight;

    // Apply transform for smooth dragging
    const translateY = screenHeight - newHeight;
    sheetRef.current.style.transform = `translateY(${translateY}px)`;
    sheetRef.current.style.transition = 'none';
  }, [isDragging, snapPoints, getSheetHeight]);

  // Handle drag end (snap to nearest point)
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!sheetRef.current || !isDragging) return;

    const currentY = e.changedTouches[0].clientY;
    const dragDistance = dragStartRef.current - currentY;
    const velocity = dragDistance / (e.timeStamp - (dragStartRef.current as any) || e.timeStamp);

    setIsDragging(false);

    // Determine which snap point to snap to based on velocity and position
    const currentHeight = getSheetHeight(snapPoints[currentSnapRef.current]);
    let nextSnapIndex = currentSnapRef.current;

    // If dragging up (negative velocity) - snap to next higher point
    if (velocity < -0.3) {
      nextSnapIndex = Math.min(currentSnapRef.current + 1, snapPoints.length - 1);
    }
    // If dragging down (positive velocity) - snap to next lower point
    else if (velocity > 0.3) {
      nextSnapIndex = Math.max(currentSnapRef.current - 1, 0);
    }
    // If dragging down from bottom sheet - dismiss
    else if (currentSnapRef.current === 0 && velocity > 0.1) {
      onClose();
      return;
    }

    // Snap to the determined point
    currentSnapRef.current = nextSnapIndex;
    snapToPoint(nextSnapIndex);
  }, [isDragging, snapPoints, getSheetHeight, onClose]);

  // Snap to a specific point with animation
  const snapToPoint = useCallback((index: number) => {
    if (!sheetRef.current) return;

    setCurrentSnap(index);
    const height = getSheetHeight(snapPoints[index]);
    const translateY = window.innerHeight - height;

    sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    sheetRef.current.style.transform = `translateY(${translateY}px)`;
    haptics.light();
  }, [snapPoints, getSheetHeight]);

  // Handle scrim click to dismiss
  const handleScrimClick = useCallback(() => {
    if (currentSnapRef.current === 0) {
      onClose();
    } else {
      snapToPoint(0);
    }
  }, [snapToPoint, onClose]);

  // Initialize sheet position on open
  useEffect(() => {
    if (!isOpen || !sheetRef.current) return;

    // Remove touch listeners from old listeners
    sheetRef.current.removeEventListener('touchstart', handleTouchStart);
    sheetRef.current.removeEventListener('touchmove', handleTouchMove);
    sheetRef.current.removeEventListener('touchend', handleTouchEnd);

    // Add new touch listeners
    sheetRef.current.addEventListener('touchstart', handleTouchStart, { passive: true });
    sheetRef.current.addEventListener('touchmove', handleTouchMove, { passive: true });
    sheetRef.current.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Set initial position
    snapToPoint(currentSnapRef.current);

    // Prevent body scroll when sheet is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
      sheetRef.current?.removeEventListener('touchstart', handleTouchStart);
      sheetRef.current?.removeEventListener('touchmove', handleTouchMove);
      sheetRef.current?.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, handleTouchStart, handleTouchMove, handleTouchEnd, snapToPoint]);

  if (!isOpen) return null;

  return (
    <>
      {/* Scrim / Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 lg:hidden"
        onClick={handleScrimClick}
        style={{
          opacity: currentSnap === 0 ? 0 : (currentSnap / (snapPoints.length - 1)) * 0.4,
          transition: isDragging ? 'none' : 'opacity 0.3s',
        }}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 lg:hidden flex flex-col max-h-[95vh] ${className}`}
        style={{
          transform: `translateY(${window.innerHeight}px)`,
          touchAction: 'none',
        }}
      >
        {/* Grab Handle */}
        {showGrabHandle && (
          <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        {header && <div className="flex-shrink-0">{header}</div>}

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
