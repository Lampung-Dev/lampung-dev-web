/**
 * Transform event image URL to use API route
 * This handles both old URLs (/uploads/events/...) and new URLs (/api/uploads/events/...)
 * Needed because Next.js can't serve files uploaded after build time
 */
export function getEventImageUrl(imageUrl: string): string {
  // If it's already using the API route, return as-is
  if (imageUrl.startsWith('/api/uploads/events/')) {
    return imageUrl;
  }

  // Transform old static path to API route
  if (imageUrl.startsWith('/uploads/events/')) {
    return imageUrl.replace('/uploads/events/', '/api/uploads/events/');
  }

  // For external URLs (http/https), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Fallback: return as-is
  return imageUrl;
}
