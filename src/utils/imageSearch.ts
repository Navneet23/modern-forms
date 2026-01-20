import type { ThemeConfig } from '../types/theme';

// Use Lorem Picsum for reliable free images
// Categories map to specific image IDs that work well as headers

const HEADER_IMAGES: { [key: string]: number[] } = {
  business: [380, 374, 395, 452, 453],
  technology: [0, 1, 2, 60, 180],
  nature: [10, 11, 15, 16, 17],
  education: [20, 24, 42, 48, 180],
  creative: [96, 145, 169, 200, 250],
  health: [177, 292, 306, 318, 325],
  food: [292, 429, 431, 488, 493],
  travel: [100, 164, 274, 318, 385],
  abstract: [281, 366, 399, 465, 545],
  default: [380, 374, 395, 452, 1],
};

// Keywords to category mapping
const KEYWORD_CATEGORIES: { [key: string]: string } = {
  // Business
  job: 'business', application: 'business', career: 'business', work: 'business',
  employee: 'business', company: 'business', corporate: 'business', office: 'business',
  meeting: 'business', professional: 'business', interview: 'business', resume: 'business',

  // Technology
  tech: 'technology', software: 'technology', computer: 'technology', digital: 'technology',
  code: 'technology', programming: 'technology', developer: 'technology', app: 'technology',
  website: 'technology', data: 'technology', ai: 'technology', machine: 'technology',

  // Education
  school: 'education', student: 'education', teacher: 'education', course: 'education',
  class: 'education', learn: 'education', study: 'education', university: 'education',
  college: 'education', training: 'education', workshop: 'education', education: 'education',

  // Creative
  design: 'creative', creative: 'creative', art: 'creative', graphic: 'creative',
  designer: 'creative', artist: 'creative', portfolio: 'creative', visual: 'creative',

  // Health
  health: 'health', medical: 'health', doctor: 'health', patient: 'health',
  wellness: 'health', fitness: 'health', hospital: 'health', clinic: 'health',

  // Food
  food: 'food', restaurant: 'food', recipe: 'food', cooking: 'food',
  menu: 'food', catering: 'food', chef: 'food', meal: 'food',

  // Travel
  travel: 'travel', trip: 'travel', vacation: 'travel', tourism: 'travel',
  hotel: 'travel', flight: 'travel', destination: 'travel', adventure: 'travel',

  // Nature
  nature: 'nature', environment: 'nature', outdoor: 'nature', garden: 'nature',
  green: 'nature', eco: 'nature', plant: 'nature', forest: 'nature',
};

// Extract keywords from form title and description
export function extractKeywords(title: string, description?: string): string[] {
  const text = `${title} ${description || ''}`.toLowerCase();

  // Remove common words
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here',
    'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or',
    'because', 'until', 'while', 'this', 'that', 'these', 'those', 'what',
    'which', 'who', 'whom', 'your', 'you', 'our', 'please', 'fill', 'out',
    'form', 'submit', 'enter', 'provide', 'required', 'optional', 'position',
  ]);

  const words = text
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  // Get unique words, prioritize longer words
  const uniqueWords = [...new Set(words)].sort((a, b) => b.length - a.length);

  return uniqueWords.slice(0, 5);
}

// Determine category from keywords
export function determineCategory(keywords: string[]): string {
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    if (KEYWORD_CATEGORIES[lowerKeyword]) {
      return KEYWORD_CATEGORIES[lowerKeyword];
    }
    // Partial match
    for (const [key, category] of Object.entries(KEYWORD_CATEGORIES)) {
      if (lowerKeyword.includes(key) || key.includes(lowerKeyword)) {
        return category;
      }
    }
  }
  return 'default';
}

// Get Lorem Picsum URL for a specific image
export function getPicsumUrl(imageId: number, width: number, height: number): string {
  return `https://picsum.photos/id/${imageId}/${width}/${height}`;
}

// Get a random image URL from a category
export function getRandomImageFromCategory(category: string, width: number, height: number): string {
  const imageIds = HEADER_IMAGES[category] || HEADER_IMAGES.default;
  const randomId = imageIds[Math.floor(Math.random() * imageIds.length)];
  return getPicsumUrl(randomId, width, height);
}

// Predefined color palettes that work well together
const COLOR_PALETTES = [
  { primary: '#4F46E5', secondary: '#7C3AED', bg: '#F8FAFC', surface: '#FFFFFF', text: '#1E293B', textSec: '#64748B' },
  { primary: '#0EA5E9', secondary: '#06B6D4', bg: '#F0F9FF', surface: '#FFFFFF', text: '#0C4A6E', textSec: '#64748B' },
  { primary: '#10B981', secondary: '#059669', bg: '#ECFDF5', surface: '#FFFFFF', text: '#064E3B', textSec: '#6B7280' },
  { primary: '#F59E0B', secondary: '#D97706', bg: '#FFFBEB', surface: '#FFFFFF', text: '#78350F', textSec: '#92400E' },
  { primary: '#EF4444', secondary: '#DC2626', bg: '#FEF2F2', surface: '#FFFFFF', text: '#7F1D1D', textSec: '#991B1B' },
  { primary: '#8B5CF6', secondary: '#A855F7', bg: '#FAF5FF', surface: '#FFFFFF', text: '#4C1D95', textSec: '#6B21A8' },
  { primary: '#EC4899', secondary: '#DB2777', bg: '#FDF2F8', surface: '#FFFFFF', text: '#831843', textSec: '#9D174D' },
  { primary: '#14B8A6', secondary: '#0D9488', bg: '#F0FDFA', surface: '#FFFFFF', text: '#134E4A', textSec: '#115E59' },
  // Dark themes
  { primary: '#818CF8', secondary: '#A78BFA', bg: '#1E1B4B', surface: '#312E81', text: '#E0E7FF', textSec: '#A5B4FC' },
  { primary: '#22D3EE', secondary: '#67E8F9', bg: '#164E63', surface: '#155E75', text: '#ECFEFF', textSec: '#A5F3FC' },
];

// Get a color palette based on category
function getColorPaletteForCategory(category: string): typeof COLOR_PALETTES[0] {
  const categoryPaletteMap: { [key: string]: number } = {
    business: 0,
    technology: 1,
    education: 5,
    creative: 6,
    health: 2,
    food: 3,
    travel: 7,
    nature: 2,
    abstract: 8,
    default: 0,
  };

  const paletteIndex = categoryPaletteMap[category] ?? 0;
  return COLOR_PALETTES[paletteIndex];
}

// Main function to generate a theme from form content
export async function generateThemeFromForm(
  title: string,
  description?: string
): Promise<{ theme: ThemeConfig; error?: string }> {
  const keywords = extractKeywords(title, description);
  const category = determineCategory(keywords);

  // Get image URLs from Lorem Picsum
  const headerImageUrl = getRandomImageFromCategory(category, 1200, 400);
  const backgroundImageUrl = getRandomImageFromCategory('abstract', 1920, 1080);

  // Get color palette for category
  const palette = getColorPaletteForCategory(category);

  return {
    theme: {
      id: 'generated',
      name: 'Generated Theme',
      description: `Theme generated for: ${title}`,
      colors: {
        primary: palette.primary,
        secondary: palette.secondary,
        background: palette.bg,
        surface: palette.surface,
        text: palette.text,
        textSecondary: palette.textSec,
        border: palette.textSec + '40',
        error: '#EF4444',
        success: '#22C55E',
      },
      borderRadius: 'lg',
      fontFamily: "'Inter', system-ui, sans-serif",
      headerImageUrl,
      backgroundImageUrl,
    },
    error: keywords.length === 0
      ? 'No relevant keywords found. Using default images and colors.'
      : undefined,
  };
}

// Legacy exports for compatibility
export function buildSearchQuery(keywords: string[]): string {
  return keywords.slice(0, 3).join(' ');
}

export function getUnsplashSourceUrl(query: string, width = 1200, height = 400): string {
  // Redirect to Lorem Picsum instead
  const category = determineCategory(query.split(' '));
  return getRandomImageFromCategory(category, width, height);
}
