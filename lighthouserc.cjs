// lighthouserc.js
// Runs locally too: lhci autorun

/** @type {import('@lhci/cli').LhciConfig} */
module.exports = {
  ci: {
    collect: {
      // Start the Next.js production server.
      // 'next start' requires a prior 'next build' — the workflow does this.
      startServerCommand: 'pnpm start',
      startServerReadyPattern: '✓ Ready in',
      startServerReadyTimeout: 30000,

      // Which URLs to audit.
      // Audit your most critical routes — not every page.
      // Each URL gets 3 runs; LHCI takes the median.
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/products',
        'http://localhost:3000/checkout',
      ],

      numberOfRuns: 3, // Median of 3 eliminates single-run flake

      settings: {
        // Throttle to simulate real-world conditions.
        // This is what Google measures field data against.
        preset: 'desktop',

        // Throttle CPU 4x and network to simulate mid-range device on 4G.
        // Remove these to test unthrottled — but your scores will be optimistic.
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 4,
        },

        // Skip audits that don't affect CWV — speeds up CI by ~30 seconds.
        onlyCategories: ['performance'],

        // Disable storage reset between runs — simulates repeat visitor.
        // Remove if you want cold-cache scores (harsher, more accurate for LCP).
        disableStorageReset: false,

        // Chrome flags for headless CI environment.
        // --no-sandbox required in Docker/GitHub Actions.
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },

    // LHCI built-in assertions — first gate.
    // Our assert-vitals.mjs script adds the precise per-metric check on top.
    assert: {
      assertions: {
        // Performance score floor — catches general regressions.
        'categories:performance': ['error', { minScore: 0.7 }],

        // These are LHCI's own numeric assertions.
        // Our script provides the precise LCP/CLS block with better output.
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.15 }],
        'total-blocking-time': ['warn', { maxNumericValue: 500 }],
      },
      // Don't fail on informational audits — only on the ones above.
      includePassedAssertions: false,
    },

    upload: {
      // Store reports locally — available as workflow artifacts.
      // Switch to 'lhci' target to use LHCI server for historical comparison.
      target: 'filesystem',
      outputDir: '.lighthouseci',
      reportFilenamePattern: 'lhr-%%DATETIME%%-%%HOSTNAME%%.json',
    },
  },
};
