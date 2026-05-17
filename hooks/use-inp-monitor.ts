'use client';

import { useEffect } from 'react';
import { onINP } from 'web-vitals/attribution';

interface INPAttribution {
  interactionTarget: string; // CSS selector of the clicked element
  interactionType: string; // 'pointer' | 'keyboard'
  interactionTime: number; // When the interaction started
  nextPaintTime: number; // When the browser painted the response
  processedEventEntries: PerformanceEventTiming[];
  longAnimationFrameEntries: PerformanceLongAnimationFrameTiming[];
}

// Development-only — remove before production or gate behind a flag
export function useINPMonitor(): void {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    onINP(
      metric => {
        const attr = metric.attribution as unknown as INPAttribution;

        if (metric.value > 200) {
          console.group(
            `%c[INP] ${metric.rating.toUpperCase()} — ${Math.round(metric.value)}ms`,
            metric.rating === 'poor' ? 'color: #E24B4A; font-weight: bold' : 'color: #BA7517; font-weight: bold',
          );
          console.log('Interaction:', attr.interactionType, 'on', attr.interactionTarget);
          console.log(
            'Input delay:',
            Math.round(attr.processedEventEntries[0]?.processingStart - attr.processedEventEntries[0]?.startTime) +
              'ms',
          );
          console.log(
            'Processing:',
            Math.round(attr.processedEventEntries[0]?.processingEnd - attr.processedEventEntries[0]?.processingStart) +
              'ms',
          );
          console.log(
            'Presentation:',
            Math.round(attr.nextPaintTime - attr.processedEventEntries[0]?.processingEnd) + 'ms',
          );

          // Long animation frames tell you which scripts ran during the interaction
          if (attr.longAnimationFrameEntries?.length) {
            console.log(
              'Long animation frames:',
              attr.longAnimationFrameEntries.map(f => ({
                duration: Math.round(f.duration) + 'ms',
                scripts: f.scripts?.map(s => s.sourceURL).filter(Boolean),
              })),
            );
          }
          console.groupEnd();
        }
      },
      { reportAllChanges: true }, // Log every interaction, not just on page hide
    );
  }, []);
}
