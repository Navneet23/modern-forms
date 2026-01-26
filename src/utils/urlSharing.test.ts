import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  encodeFormConfig,
  decodeFormConfig,
  shareableToThemeConfig,
  shareableToLayoutMode,
  createShareableUrl,
  getEncodedDataFromUrl,
} from './urlSharing';
import type { ThemeConfig } from '../types/theme';

describe('URL Sharing', () => {
  const mockTheme: ThemeConfig = {
    id: 'lavender-dreams',
    name: 'Lavender Dreams',
    description: 'A soft lavender theme',
    colors: {
      primary: '#6750A4',
      secondary: '#625B71',
      background: '#F6EDFF',
      surface: '#FFFFFF',
      text: '#1C1B1F',
      textSecondary: '#49454F',
      border: '#CAC4D0',
      error: '#B3261E',
      success: '#2E7D32',
    },
    borderRadius: 'md',
    fontFamily: 'Inter, sans-serif',
    backgroundImageUrl: undefined,
    backgroundEffect: 'shapes',
  };

  const mockGoogleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSf123abc/viewform';

  describe('encodeFormConfig', () => {
    it('should encode form config to a compressed string', () => {
      const encoded = encodeFormConfig(mockGoogleFormUrl, 'standard', mockTheme);

      expect(encoded).toBeDefined();
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    it('should produce decodable encoded string', () => {
      const encoded = encodeFormConfig(mockGoogleFormUrl, 'standard', mockTheme);
      const decoded = decodeFormConfig(encoded);

      // Should be able to decode back
      expect(decoded).not.toBeNull();
      expect(decoded?.u).toBe(mockGoogleFormUrl);
    });

    it('should encode question-by-question layout', () => {
      const encoded = encodeFormConfig(mockGoogleFormUrl, 'question-by-question', mockTheme);
      const decoded = decodeFormConfig(encoded);

      expect(decoded?.l).toBe('q');
    });

    it('should encode standard layout', () => {
      const encoded = encodeFormConfig(mockGoogleFormUrl, 'standard', mockTheme);
      const decoded = decodeFormConfig(encoded);

      expect(decoded?.l).toBe('s');
    });

    it('should include timestamp for expiry', () => {
      const encoded = encodeFormConfig(mockGoogleFormUrl, 'standard', mockTheme);
      const decoded = decodeFormConfig(encoded);

      expect(decoded?.ts).toBeDefined();
      expect(typeof decoded?.ts).toBe('number');
      expect(decoded?.ts).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('decodeFormConfig', () => {
    it('should decode a valid encoded string', () => {
      const encoded = encodeFormConfig(mockGoogleFormUrl, 'standard', mockTheme);
      const decoded = decodeFormConfig(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.u).toBe(mockGoogleFormUrl);
      expect(decoded?.l).toBe('s');
    });

    it('should return null for invalid encoded string', () => {
      const decoded = decodeFormConfig('invalid-string');

      expect(decoded).toBeNull();
    });

    it('should return null for empty string', () => {
      const decoded = decodeFormConfig('');

      expect(decoded).toBeNull();
    });

    it('should return null for expired config (> 7 days)', () => {
      const encoded = encodeFormConfig(mockGoogleFormUrl, 'standard', mockTheme);
      const decoded = decodeFormConfig(encoded);

      // Manually modify timestamp to 8 days ago
      if (decoded) {
        const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
        const modifiedConfig = { ...decoded, ts: eightDaysAgo };
        const modifiedJson = JSON.stringify(modifiedConfig);

        // Re-encode with old timestamp
        const { compressToEncodedURIComponent } = require('lz-string');
        const reEncoded = compressToEncodedURIComponent(modifiedJson);

        const reDecoded = decodeFormConfig(reEncoded);
        expect(reDecoded).toBeNull();
      }
    });

    it('should preserve all theme colors', () => {
      const encoded = encodeFormConfig(mockGoogleFormUrl, 'standard', mockTheme);
      const decoded = decodeFormConfig(encoded);

      expect(decoded?.t.c?.p).toBe(mockTheme.colors.primary);
      expect(decoded?.t.c?.s).toBe(mockTheme.colors.secondary);
      expect(decoded?.t.c?.bg).toBe(mockTheme.colors.background);
      expect(decoded?.t.c?.sf).toBe(mockTheme.colors.surface);
      expect(decoded?.t.c?.tx).toBe(mockTheme.colors.text);
      expect(decoded?.t.c?.ts).toBe(mockTheme.colors.textSecondary);
      expect(decoded?.t.c?.bd).toBe(mockTheme.colors.border);
      expect(decoded?.t.c?.er).toBe(mockTheme.colors.error);
      expect(decoded?.t.c?.su).toBe(mockTheme.colors.success);
    });

    it('should preserve background effect', () => {
      const encoded = encodeFormConfig(mockGoogleFormUrl, 'standard', mockTheme);
      const decoded = decodeFormConfig(encoded);

      expect(decoded?.t.be).toBe('shapes');
    });

    it('should handle theme with background image', () => {
      const themeWithImage = {
        ...mockTheme,
        backgroundImageUrl: 'https://example.com/image.jpg',
      };

      const encoded = encodeFormConfig(mockGoogleFormUrl, 'standard', themeWithImage);
      const decoded = decodeFormConfig(encoded);

      expect(decoded?.t.bi).toBe('https://example.com/image.jpg');
    });
  });

  describe('shareableToThemeConfig', () => {
    it('should convert shareable config back to full theme config', () => {
      const encoded = encodeFormConfig(mockGoogleFormUrl, 'standard', mockTheme);
      const decoded = decodeFormConfig(encoded);

      if (decoded) {
        const theme = shareableToThemeConfig(decoded);

        expect(theme.id).toBe('lavender-dreams');
        expect(theme.colors.primary).toBe('#6750A4');
        expect(theme.colors.secondary).toBe('#625B71');
        expect(theme.borderRadius).toBe('md');
        expect(theme.backgroundEffect).toBe('shapes');
      }
    });

    it('should handle missing optional fields', () => {
      const encoded = encodeFormConfig(mockGoogleFormUrl, 'standard', mockTheme);
      const decoded = decodeFormConfig(encoded);

      if (decoded) {
        // Remove optional fields
        delete decoded.t.bi;
        delete decoded.t.be;

        const theme = shareableToThemeConfig(decoded);

        expect(theme.backgroundImageUrl).toBeUndefined();
        expect(theme.backgroundEffect).toBeUndefined();
      }
    });
  });

  describe('shareableToLayoutMode', () => {
    it('should convert "s" to "standard"', () => {
      const encoded = encodeFormConfig(mockGoogleFormUrl, 'standard', mockTheme);
      const decoded = decodeFormConfig(encoded);

      if (decoded) {
        expect(shareableToLayoutMode(decoded)).toBe('standard');
      }
    });

    it('should convert "q" to "question-by-question"', () => {
      const encoded = encodeFormConfig(mockGoogleFormUrl, 'question-by-question', mockTheme);
      const decoded = decodeFormConfig(encoded);

      if (decoded) {
        expect(shareableToLayoutMode(decoded)).toBe('question-by-question');
      }
    });
  });

  describe('createShareableUrl', () => {
    beforeEach(() => {
      // Reset window.location mock
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'http://localhost:3000',
          pathname: '/',
        },
        writable: true,
      });
    });

    it('should create a full URL with encoded data', () => {
      const url = createShareableUrl(mockGoogleFormUrl, 'standard', mockTheme);

      expect(url).toContain('http://localhost:3000/');
      expect(url).toContain('?d=');
      expect(url.length).toBeGreaterThan(50);
    });

    it('should create decodable URL', () => {
      const url = createShareableUrl(mockGoogleFormUrl, 'standard', mockTheme);
      const encodedData = url.split('?d=')[1];
      const decoded = decodeFormConfig(encodedData);

      expect(decoded).not.toBeNull();
      expect(decoded?.u).toBe(mockGoogleFormUrl);
    });
  });

  describe('getEncodedDataFromUrl', () => {
    it('should extract encoded data from URL with ?d= parameter', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?d=encodedDataHere',
        },
        writable: true,
      });

      const result = getEncodedDataFromUrl();
      expect(result).toBe('encodedDataHere');
    });

    it('should return null when no ?d= parameter', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '',
        },
        writable: true,
      });

      const result = getEncodedDataFromUrl();
      expect(result).toBeNull();
    });

    it('should return null when different parameter', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?f=legacyId',
        },
        writable: true,
      });

      const result = getEncodedDataFromUrl();
      expect(result).toBeNull();
    });
  });

  describe('URL size', () => {
    it('should produce reasonably sized URLs (< 500 chars for typical form)', () => {
      const url = createShareableUrl(mockGoogleFormUrl, 'standard', mockTheme);

      // Typical form config should compress to under 500 characters
      expect(url.length).toBeLessThan(500);
    });

    it('should handle long background image URLs', () => {
      const themeWithLongUrl = {
        ...mockTheme,
        backgroundImageUrl: 'https://example.com/very/long/path/to/image/with/many/segments/image.jpg?param1=value1&param2=value2',
      };

      const url = createShareableUrl(mockGoogleFormUrl, 'standard', themeWithLongUrl);
      const encodedData = url.split('?d=')[1];
      const decoded = decodeFormConfig(encodedData);

      expect(decoded?.t.bi).toBe(themeWithLongUrl.backgroundImageUrl);
    });
  });
});
