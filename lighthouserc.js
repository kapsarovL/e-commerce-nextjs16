module.exports = {
  ci: {
    collect: {
      staticDistDir: '.next/standalone/public',
      numberOfRuns: 3,
      settings: {
        configPath: './lighthouse-config.js',
      },
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/perf',
      ],
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      // Disable LHCI built-in assertions — we use our own script for clarity
      preset: 'lighthouse:recommended',
      assertions: {
        // Only enforce the most critical metrics; others are monitored via our script
        'categories:performance': ['error', { minScore: 0.5 }],
      },
    },
  },
};
