import { useEffect, useRef, useState, useCallback } from 'react';

function isLikelyMobile() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
}

/**
 * Detects a phone shake via DeviceMotionEvent.
 * Desktop fallback: press S to trigger the same action (Space avoided — too easy to misfire).
 * iOS 13+ needs an explicit user gesture to grant motion permission.
 */
export function useShake({
  enabled = true,
  onShake,
  threshold = 32,
  cooldownMs = 4000,
  desktopKey = true,
} = {}) {
  const [permission, setPermission] = useState('unknown'); // unknown | granted | denied | unsupported
  const lastShakeAt = useRef(0);
  const lastAccel = useRef({ x: null, y: null, z: null });
  const peakCount = useRef(0);
  const peakWindowStart = useRef(0);
  const onShakeRef = useRef(onShake);
  const canFireRef = useRef(false);
  const isDesktop = !isLikelyMobile();

  useEffect(() => {
    onShakeRef.current = onShake;
  }, [onShake]);

  useEffect(() => {
    canFireRef.current = Boolean(enabled && (permission === 'granted' || isDesktop));
  }, [enabled, permission, isDesktop]);

  const fireShake = useCallback(() => {
    if (!canFireRef.current) return false;
    const now = Date.now();
    if (now - lastShakeAt.current < cooldownMs) return false;
    lastShakeAt.current = now;
    peakCount.current = 0;
    if (typeof onShakeRef.current === 'function') {
      onShakeRef.current();
      return true;
    }
    return false;
  }, [cooldownMs]);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined') return false;

    if (isDesktop) {
      setPermission('granted');
      return true;
    }

    if (!('DeviceMotionEvent' in window)) {
      setPermission('unsupported');
      return false;
    }

    try {
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        const result = await DeviceMotionEvent.requestPermission();
        if (result === 'granted') {
          setPermission('granted');
          return true;
        }
        setPermission('denied');
        return false;
      }

      setPermission('granted');
      return true;
    } catch (err) {
      setPermission('denied');
      return false;
    }
  }, [isDesktop]);

  // Motion sensor (phones) — need multiple strong peaks, not tiny noise
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    if (isDesktop) {
      setPermission('granted');
      return undefined;
    }

    if (!('DeviceMotionEvent' in window)) {
      setPermission('unsupported');
      return undefined;
    }

    const needsIOSPermission =
      typeof DeviceMotionEvent.requestPermission === 'function';

    if (!needsIOSPermission) {
      setPermission('granted');
    }

    const handleMotion = (event) => {
      if (!canFireRef.current) return;

      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const { x = 0, y = 0, z = 0 } = acc;
      const prev = lastAccel.current;

      // Skip first sample (no baseline yet) — avoids false fire on listen start
      if (prev.x == null) {
        lastAccel.current = { x, y, z };
        return;
      }

      const delta =
        Math.abs(x - prev.x) + Math.abs(y - prev.y) + Math.abs(z - prev.z);
      lastAccel.current = { x, y, z };

      if (delta < threshold) return;

      const now = Date.now();
      if (now - peakWindowStart.current > 800) {
        peakWindowStart.current = now;
        peakCount.current = 0;
      }
      peakCount.current += 1;

      // Real shake usually has several spikes; one bump should not open camera
      if (peakCount.current >= 3) {
        fireShake();
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [threshold, fireShake, isDesktop]);

  // Desktop: S only (Space removed — accidental presses caused camera overlay blink)
  useEffect(() => {
    if (typeof window === 'undefined' || !desktopKey) return undefined;

    const handleKey = (event) => {
      if (!canFireRef.current) return;
      const tag = (event.target && event.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) {
        return;
      }

      if (event.key === 's' || event.key === 'S') {
        event.preventDefault();
        fireShake();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [desktopKey, fireShake]);

  const needsPermission =
    !isDesktop &&
    permission === 'unknown' &&
    typeof window !== 'undefined' &&
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function';

  return {
    permission,
    needsPermission,
    requestPermission,
    isActive: permission === 'granted' || isDesktop,
    isDesktop,
  };
}
