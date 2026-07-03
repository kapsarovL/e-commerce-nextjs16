'use client';

import { useEffect, useState, useCallback } from 'react';
import { Cookie } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  getConsent,
  setConsent,
  acceptAll,
  rejectAll,
  CATEGORIES,
  type CookieCategory,
  type CookieConsent,
} from '@/lib/cookie-consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<CookieConsent | null>(null);
  const [animState, setAnimState] = useState<'enter' | 'idle' | 'exit'>('idle');

  useEffect(() => {
    if (getConsent()) return;

    const sentinel = document.getElementById('cookie-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          requestAnimationFrame(() => setAnimState('enter'));
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const hide = useCallback(() => {
    setAnimState('exit');
    setTimeout(() => setVisible(false), 200);
  }, []);

  function handleAcceptAll() {
    acceptAll();
    hide();
  }

  function handleRejectAll() {
    rejectAll();
    hide();
  }

  function handleOpenSheet() {
    const current = getConsent() ?? { essential: true, functional: false, analytics: false, marketing: false };
    setDraft({ ...current });
    setSheetOpen(true);
  }

  function handleSavePreferences() {
    if (!draft) return;
    setConsent(draft);
    setSheetOpen(false);
    hide();
  }

  function toggleDraft(category: CookieCategory, checked: boolean) {
    setDraft(prev => (prev ? { ...prev, [category]: checked } : prev));
  }

  if (!visible) return null;

  return (
    <>
      <div
        role="dialog"
        aria-label="Cookie consent"
        aria-modal="false"
        className={cn(
          'bg-background/95 supports-backdrop-filter:bg-background/80 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-sm',
          animState === 'enter' && 'animate-in slide-in-from-bottom-8 fade-in duration-200 motion-reduce:animate-none',
          animState === 'exit' && 'animate-out slide-out-to-bottom-8 fade-out duration-200 motion-reduce:animate-none',
        )}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:py-3">
          <div className="flex items-start gap-3 sm:flex-1">
            <Cookie className="text-muted-foreground mt-0.5 size-5 shrink-0" />
            <div className="text-sm">
              <p className="text-foreground font-medium">We value your privacy</p>
              <p className="text-muted-foreground mt-0.5">
                We use cookies to enhance your browsing experience, serve personalised content, and analyse our traffic.{' '}
                <a href="/privacy" className="hover:text-foreground underline underline-offset-2">
                  Learn more
                </a>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRejectAll}>
              Reject All
            </Button>
            <Button variant="ghost" size="sm" onClick={handleOpenSheet}>
              Customize
            </Button>
            <Button variant="default" size="sm" onClick={handleAcceptAll}>
              Accept All
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="sm:mx-auto sm:max-w-lg sm:rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Cookie Preferences</SheetTitle>
            <SheetDescription>
              Choose which cookies to allow. Essential cookies are always active as they are required for the site to
              function.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4">
            {CATEGORIES.map(cat => (
              <div key={cat.key} className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <label htmlFor={`cookie-${cat.key}`} className="text-foreground text-sm leading-none font-medium">
                    {cat.label}
                    {cat.required && <span className="text-muted-foreground ml-1 text-xs font-normal">(Required)</span>}
                  </label>
                  <p className="text-muted-foreground text-xs leading-relaxed">{cat.description}</p>
                </div>
                <Switch
                  id={`cookie-${cat.key}`}
                  size="sm"
                  checked={draft?.[cat.key] ?? false}
                  onCheckedChange={checked => toggleDraft(cat.key, checked)}
                  disabled={cat.required}
                />
              </div>
            ))}
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button onClick={handleSavePreferences}>Save Preferences</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
