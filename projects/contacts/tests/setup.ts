import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Ensure each test starts with a clean DOM. RTL auto-registers this via a
// global `afterEach` in most setups, but we register it explicitly here so
// test isolation doesn't depend on framework auto-detection.
afterEach(() => {
  cleanup();
});
