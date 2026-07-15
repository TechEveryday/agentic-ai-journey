import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/core': resolve(__dirname, 'src/core'),
      '@/application': resolve(__dirname, 'src/application'),
      '@/infrastructure': resolve(__dirname, 'src/infrastructure'),
      '@/presentation': resolve(__dirname, 'src/presentation'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/**/*.d.ts',
        'src/**/index.ts',
        // SignalR transport talks to a real network hub — meaningfully
        // covered by the Playwright e2e test instead of unit tests.
        'src/infrastructure/SignalRMessageTransport.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
