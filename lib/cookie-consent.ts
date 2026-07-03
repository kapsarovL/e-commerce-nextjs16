export type CookieCategory = 'essential' | 'functional' | 'analytics' | 'marketing';

export type CookieConsent = Record<CookieCategory, boolean>;

const STORAGE_KEY = 'cookie-consent';

const defaults: CookieConsent = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
};

export function getConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    return { ...defaults, ...parsed };
  } catch {
    return null;
  }
}

export function setConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
}

export function hasConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function acceptAll(): CookieConsent {
  const all: CookieConsent = { essential: true, functional: true, analytics: true, marketing: true };
  setConsent(all);
  return all;
}

export function rejectAll(): CookieConsent {
  setConsent(defaults);
  return { ...defaults };
}

export const CATEGORIES: { key: CookieCategory; label: string; description: string; required: boolean }[] = [
  {
    key: 'essential',
    label: 'Essential',
    description: 'Required for the site to function. Includes session management and security.',
    required: true,
  },
  {
    key: 'functional',
    label: 'Functional',
    description: 'Remembers your preferences (language, region) for a personalised experience.',
    required: false,
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Helps us understand how visitors use the site so we can improve it.',
    required: false,
  },
  {
    key: 'marketing',
    label: 'Marketing',
    description: 'Used to deliver relevant ads and track campaign effectiveness.',
    required: false,
  },
];
