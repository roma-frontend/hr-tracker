"use client";

/**
 * Lightweight device fingerprinting — no external libs needed.
 * Creates a stable hash from browser/device characteristics.
 * Not 100% unique but very good for recognizing returning devices.
 */

interface FingerprintData {
  userAgent: string;
  language: string;
  platform: string;
  screenRes: string;
  timezone: string;
  colorDepth: number;
  hardwareConcurrency: number;
  touchPoints: number;
  cookieEnabled: boolean;
  doNotTrack: string | null;
}

export async function getDeviceFingerprint(): Promise<{
  fingerprint: string;
  userAgent: string;
  data: FingerprintData;
}> {
  if (typeof window === "undefined") {
    return { fingerprint: "server", userAgent: "", data: {} as FingerprintData };
  }

  const data: FingerprintData = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenRes: `${screen.width}x${screen.height}x${screen.availWidth}x${screen.availHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    colorDepth: screen.colorDepth,
    hardwareConcurrency: navigator.hardwareConcurrency ?? 0,
    touchPoints: navigator.maxTouchPoints ?? 0,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
  };

  const str = JSON.stringify(data);
  const fingerprint = await hashString(str);

  return { fingerprint, userAgent: navigator.userAgent, data };
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}
