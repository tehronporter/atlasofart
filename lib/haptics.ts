// lib/haptics.ts
// iOS haptic feedback utilities for web (using Vibration API)

export const haptics = {
  /**
   * Light tap - for subtle feedback (tab selection, hover states)
   */
  light: () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium feedback - for significant actions (marker selection, sheet snap)
   */
  medium: () => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  },

  /**
   * Heavy feedback - for important state changes
   */
  heavy: () => {
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  },

  /**
   * Selection pattern - rapid double tap
   */
  selection: () => {
    if (navigator.vibrate) {
      navigator.vibrate([10, 10, 10]);
    }
  },

  /**
   * Success pattern - three taps ascending
   */
  success: () => {
    if (navigator.vibrate) {
      navigator.vibrate([10, 20, 10, 20, 10]);
    }
  },

  /**
   * Error pattern - single heavy vibration
   */
  error: () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  },

  /**
   * Warning pattern - two medium taps
   */
  warning: () => {
    if (navigator.vibrate) {
      navigator.vibrate([15, 10, 15]);
    }
  },
};

export default haptics;
