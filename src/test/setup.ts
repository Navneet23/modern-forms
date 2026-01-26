import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.location
const mockLocation = {
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  href: 'http://localhost:3000/',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
});

// Mock fetch for testing
global.fetch = vi.fn();

// Reset mocks before each test
afterEach(() => {
  vi.clearAllMocks();
});
