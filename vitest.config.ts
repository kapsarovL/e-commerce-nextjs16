import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: { lines: 20, functions: 20, branches: 20, statements: 20 },
      exclude: ['node_modules/**', '.next/**', 'drizzle/**', '**/*.config.*', '**/types/**'],
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, './') },
  },
});
