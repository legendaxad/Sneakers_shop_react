// jest-dom adds DOM matchers such as toBeInTheDocument() to Vitest's expect.
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// jsdom does not implement these browser APIs used by the UI.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
URL.createObjectURL = vi.fn(() => 'blob:preview') as unknown as typeof URL.createObjectURL;
URL.revokeObjectURL = vi.fn() as unknown as typeof URL.revokeObjectURL;
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
Object.defineProperty(window, 'IntersectionObserver', { writable: true, value: IntersectionObserverStub });
Object.defineProperty(globalThis, 'IntersectionObserver', { writable: true, value: IntersectionObserverStub });
