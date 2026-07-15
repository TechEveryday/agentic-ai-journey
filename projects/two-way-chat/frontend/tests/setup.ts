import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// jsdom does not implement scrollIntoView; MessageList calls it to keep the
// latest message in view, so stub it out for tests.
if (typeof window !== 'undefined' && !window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}

// RTL's import-time auto-cleanup detection can miss vitest's injected
// globals depending on module load order, so register it explicitly to
// guarantee each test starts from an empty DOM.
afterEach(() => {
  cleanup();
});
