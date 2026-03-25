/**
 * Web Haptics Utility
 * Provides haptic feedback for touch interactions on supported devices
 */

export function vibrate(pattern: number | number[] = 50): boolean {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      return navigator.vibrate(pattern);
    } catch (e) {
      console.warn('[Haptics] Vibration failed:', e);
      return false;
    }
  }
  return false;
}

export function vibrateLight(): boolean {
  return vibrate(10);
}

export function vibrateMedium(): boolean {
  return vibrate(25);
}

export function vibrateHeavy(): boolean {
  return vibrate(50);
}

export function vibrateSuccess(): boolean {
  return vibrate([50, 30, 50]);
}

export function vibrateError(): boolean {
  return vibrate([100, 50, 100, 50, 100]);
}

export function stopVibration(): boolean {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    return navigator.vibrate(0);
  }
  return false;
}

export function isHapticsSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}
