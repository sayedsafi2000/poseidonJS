/**
 * Image optimization utilities for Cloudinary and Next.js Image component
 * Provides consistent image optimization across the storefront
 */

/**
 * Build optimized Cloudinary URL with auto-format, quality, and optional width
 * @param url - Original image URL
 * @param options - Optimization options
 * @returns Optimized URL or original if not a Cloudinary image
 */
export function optimizeCloudinaryUrl(
  url: string,
  options?: {
    quality?: 'auto' | 'low' | 'medium' | 'high';
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'thumb';
  }
): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;

  const quality = options?.quality || 'auto';
  let transformations = `/f_auto,q_${quality}`;

  if (options?.width) {
    transformations += `,w_${options.width}`;
  }
  if (options?.height) {
    transformations += `,h_${options.height}`;
  }
  if (options?.crop) {
    transformations += `,c_${options.crop}`;
  }

  return url.replace('/upload/', `/upload${transformations}/`);
}

/**
 * Generate responsive image srcSet for different breakpoints
 * Useful for native img srcSet attribute
 */
export function generateResponsiveSrcSet(
  url: string,
  widths: number[] = [320, 640, 1024, 1280, 1920]
): string {
  if (!url.includes('res.cloudinary.com')) return url;

  return widths
    .map((width) => {
      const optimized = optimizeCloudinaryUrl(url, { width, quality: 'auto' });
      return `${optimized} ${width}w`;
    })
    .join(', ');
}

/**
 * Get optimized URL for product images (smaller, aggressive compression)
 */
export function getOptimizedProductImageUrl(url: string): string {
  return optimizeCloudinaryUrl(url, {
    quality: 'auto',
    width: 800,
    crop: 'fill',
  });
}

/**
 * Get optimized URL for banner images (large, high quality)
 */
export function getOptimizedBannerImageUrl(url: string): string {
  return optimizeCloudinaryUrl(url, {
    quality: 'auto',
    crop: 'fill',
  });
}

/**
 * Get optimized URL for thumbnail images (very small, aggressive compression)
 */
export function getOptimizedThumbnailImageUrl(url: string): string {
  return optimizeCloudinaryUrl(url, {
    quality: 'low',
    width: 200,
    crop: 'thumb',
  });
}

/**
 * Common Next.js Image sizes props for responsive images
 * @param context - 'product' | 'banner' | 'collection' | 'thumbnail'
 */
export const responsiveSizes = {
  product:
    '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw',
  banner: '100vw',
  collection: '(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw',
  thumbnail: '(max-width: 640px) 80px, 120px',
  card: '(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 50vw, 33vw',
};
