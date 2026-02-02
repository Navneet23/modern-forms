import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { ThemeConfig, BackgroundEffect } from '../types/theme';
import type { LayoutMode } from '../types/form';

/**
 * Minimal shareable form configuration
 * Only stores what's needed to reconstruct the form:
 * - Original Google Form URL (to re-parse)
 * - Theme customizations
 * - Layout mode
 */
export interface ShareableFormConfig {
  // Original Google Form URL
  u: string;
  // Layout mode: 's' = standard, 'q' = question-by-question
  l: 's' | 'q';
  // Theme (using short keys to minimize size)
  t: {
    // Theme ID (to restore preset themes)
    i: string;
    // Colors (only include if customized)
    c?: {
      p: string;   // primary
      s: string;   // secondary
      bg: string;  // background
      sf: string;  // surface
      tx: string;  // text
      ts: string;  // textSecondary
      bd: string;  // border
      er: string;  // error
      su: string;  // success
    };
    // Border radius
    r: string;
    // Background image URL (if any)
    bi?: string;
    // Background effect
    be?: BackgroundEffect;
    // Font family
    ff?: string;
    // Header image URL
    hi?: string;
    // Header style: 'b' = banner, 'i' = integrated, 'h' = half-card
    hs?: 'b' | 'i' | 'h';
    // Header image shape: 'cl' = cloud, 'ci' = circle
    hsh?: 'cl' | 'ci';
    // Header image crop
    hc?: { x: number; y: number; s: number };
  };
  // Created timestamp (for 7-day expiry check)
  ts: number;
}

/**
 * Checks if a URL is a base64 data URL (which would be too large to include in shareable URLs)
 */
export function isBase64DataUrl(url: string | undefined): boolean {
  return !!url && url.startsWith('data:');
}

/**
 * Encodes a form configuration into a URL-safe compressed string
 */
export function encodeFormConfig(
  googleFormUrl: string,
  layoutMode: LayoutMode,
  theme: ThemeConfig
): string {
  // Don't include base64 data URLs in shareable links - they're too large
  // Only include external URLs (https://, http://)
  const backgroundImageUrl = theme.backgroundImageUrl && !isBase64DataUrl(theme.backgroundImageUrl)
    ? theme.backgroundImageUrl
    : undefined;

  const headerImageUrl_ = theme.headerImageUrl && !isBase64DataUrl(theme.headerImageUrl)
    ? theme.headerImageUrl
    : undefined;

  const config: ShareableFormConfig = {
    u: googleFormUrl,
    l: layoutMode === 'standard' ? 's' : 'q',
    t: {
      i: theme.id,
      c: {
        p: theme.colors.primary,
        s: theme.colors.secondary,
        bg: theme.colors.background,
        sf: theme.colors.surface,
        tx: theme.colors.text,
        ts: theme.colors.textSecondary,
        bd: theme.colors.border,
        er: theme.colors.error,
        su: theme.colors.success,
      },
      r: theme.borderRadius,
      bi: backgroundImageUrl,
      be: theme.backgroundEffect,
      ff: theme.fontFamily,
      hi: headerImageUrl_,
      hs: theme.headerStyle === 'banner' ? 'b' : theme.headerStyle === 'integrated' ? 'i' : theme.headerStyle === 'half-card' ? 'h' : undefined,
      hsh: theme.headerImageShape === 'cloud' ? 'cl' : theme.headerImageShape === 'circle' ? 'ci' : undefined,
      hc: theme.headerImageCrop ? { x: theme.headerImageCrop.x, y: theme.headerImageCrop.y, s: theme.headerImageCrop.scale } : undefined,
    },
    ts: Date.now(),
  };

  // Remove undefined values to minimize size
  if (!config.t.bi) delete config.t.bi;
  if (!config.t.be) delete config.t.be;
  if (!config.t.ff) delete config.t.ff;
  if (!config.t.hi) delete config.t.hi;
  if (!config.t.hs) delete config.t.hs;
  if (!config.t.hsh) delete config.t.hsh;
  if (!config.t.hc) delete config.t.hc;

  const jsonString = JSON.stringify(config);
  return compressToEncodedURIComponent(jsonString);
}

/**
 * Decodes a compressed string back into form configuration
 * Returns null if invalid or expired (>7 days)
 */
export function decodeFormConfig(encoded: string): ShareableFormConfig | null {
  try {
    const jsonString = decompressFromEncodedURIComponent(encoded);
    if (!jsonString) return null;

    const config = JSON.parse(jsonString) as ShareableFormConfig;

    // Check for 7-day expiry
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - config.ts > SEVEN_DAYS_MS) {
      return null; // Expired
    }

    // Validate required fields
    if (!config.u || !config.l || !config.t) {
      return null;
    }

    return config;
  } catch {
    return null;
  }
}

/**
 * Converts ShareableFormConfig back to full ThemeConfig
 */
export function shareableToThemeConfig(shareable: ShareableFormConfig): ThemeConfig {
  const t = shareable.t;

  return {
    id: t.i,
    name: 'Shared Theme',
    description: 'Theme from shared link',
    colors: t.c ? {
      primary: t.c.p,
      secondary: t.c.s,
      background: t.c.bg,
      surface: t.c.sf,
      text: t.c.tx,
      textSecondary: t.c.ts,
      border: t.c.bd,
      error: t.c.er,
      success: t.c.su,
    } : {
      // Fallback to default colors if not present
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
    borderRadius: t.r as ThemeConfig['borderRadius'],
    fontFamily: t.ff || "'Inter', system-ui, sans-serif",
    headerImageUrl: t.hi,
    headerStyle: t.hs === 'b' ? 'banner' : t.hs === 'i' ? 'integrated' : t.hs === 'h' ? 'half-card' : undefined,
    headerImageShape: t.hsh === 'cl' ? 'cloud' : t.hsh === 'ci' ? 'circle' : undefined,
    headerImageCrop: t.hc ? { x: t.hc.x, y: t.hc.y, scale: t.hc.s } : undefined,
    backgroundImageUrl: t.bi,
    backgroundEffect: t.be,
  };
}

/**
 * Converts layout mode from shareable format
 */
export function shareableToLayoutMode(shareable: ShareableFormConfig): LayoutMode {
  return shareable.l === 's' ? 'standard' : 'question-by-question';
}

/**
 * Creates a shareable URL from form configuration
 */
export function createShareableUrl(
  googleFormUrl: string,
  layoutMode: LayoutMode,
  theme: ThemeConfig
): string {
  const encoded = encodeFormConfig(googleFormUrl, layoutMode, theme);
  return `${window.location.origin}${window.location.pathname}?d=${encoded}`;
}

/**
 * Extracts the encoded data from URL if present
 */
export function getEncodedDataFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('d');
}
