// Use Lorem Picsum for reliable free images
// Categories map to specific image IDs that work well as headers

// Curated gallery of background images that work well for forms
export const BACKGROUND_GALLERY: number[] = [
  29,   // Mountain landscape
  16,   // Ocean/beach
  274,  // City at night
  281,  // Abstract colorful
  10,   // Forest
  15,   // River valley
  100,  // Travel/scenic
  164,  // Architecture
  366,  // Abstract patterns
  399,  // Geometric
  431,  // Food/warm tones
  452,  // Office/business
];

// Expanded background images by category for search
const BACKGROUND_IMAGES: { [key: string]: number[] } = {
  nature: [10, 11, 14, 15, 16, 17, 18, 19, 27, 28, 29, 54, 55, 56, 57, 58],
  mountain: [14, 15, 29, 54, 58, 100, 167, 224, 256, 273],
  ocean: [16, 17, 37, 47, 73, 141, 244, 256, 290, 292],
  beach: [16, 17, 37, 47, 73, 141, 244, 256, 290, 292],
  city: [164, 214, 215, 219, 242, 252, 257, 260, 274, 335],
  urban: [164, 214, 215, 219, 242, 252, 257, 260, 274, 335],
  abstract: [281, 303, 366, 399, 465, 468, 476, 501, 545, 552],
  pattern: [281, 303, 366, 399, 465, 468, 476, 501, 545, 552],
  forest: [10, 11, 14, 18, 19, 28, 38, 42, 44, 49],
  sky: [120, 180, 223, 234, 265, 279, 302, 329, 337, 376],
  sunset: [120, 142, 167, 223, 234, 265, 279, 329, 337, 376],
  business: [380, 374, 395, 452, 453, 346, 338, 359, 367, 368],
  office: [380, 374, 395, 452, 453, 346, 338, 359, 367, 368],
  technology: [0, 1, 2, 60, 180, 201, 239, 267, 284, 326],
  minimal: [195, 228, 238, 250, 255, 260, 301, 310, 313, 367],
  architecture: [164, 214, 219, 257, 260, 311, 335, 338, 339, 348],
};

// Search for background images by keyword
export function searchBackgroundImages(query: string): number[] {
  const lowerQuery = query.toLowerCase().trim();

  // Check for exact category match first
  if (BACKGROUND_IMAGES[lowerQuery]) {
    return BACKGROUND_IMAGES[lowerQuery];
  }

  // Check for partial matches
  const matchedCategories: number[][] = [];
  for (const [category, images] of Object.entries(BACKGROUND_IMAGES)) {
    if (category.includes(lowerQuery) || lowerQuery.includes(category)) {
      matchedCategories.push(images);
    }
  }

  if (matchedCategories.length > 0) {
    // Combine and deduplicate results
    const combined = new Set<number>();
    matchedCategories.forEach(images => images.forEach(id => combined.add(id)));
    return Array.from(combined).slice(0, 12);
  }

  // Fallback to a mix from different categories
  return BACKGROUND_GALLERY;
}

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

// Legacy exports for compatibility
export function buildSearchQuery(keywords: string[]): string {
  return keywords.slice(0, 3).join(' ');
}

export function getUnsplashSourceUrl(query: string, width = 1200, height = 400): string {
  // Redirect to Lorem Picsum instead
  const category = determineCategory(query.split(' '));
  return getRandomImageFromCategory(category, width, height);
}
