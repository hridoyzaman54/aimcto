import { useState, useEffect, useRef } from 'react';

interface UseOptimizedImageOptions {
  src: string;
  placeholder?: string;
  priority?: boolean;
}

interface UseOptimizedImageResult {
  src: string;
  isLoaded: boolean;
  ref: React.RefObject<HTMLImageElement | null>;
}

// Cache for preloaded images
const imageCache = new Set<string>();

// Preload an image and cache it
export function preloadImage(src: string): Promise<void> {
  if (imageCache.has(src)) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.add(src);
      resolve();
    };
    img.onerror = reject;
    img.src = src;
  });
}

// Preload multiple images
export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage));
}

// Default placeholder - a simple gray SVG
const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=';

// Hook for optimized image loading with intersection observer
export function useOptimizedImage({ 
  src, 
  placeholder = DEFAULT_PLACEHOLDER,
  priority = false 
}: UseOptimizedImageOptions): UseOptimizedImageResult {
  const [isLoaded, setIsLoaded] = useState(imageCache.has(src));
  const [currentSrc, setCurrentSrc] = useState(imageCache.has(src) ? src : placeholder);
  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imageCache.has(src)) {
      setCurrentSrc(src);
      setIsLoaded(true);
      return;
    }

    if (priority) {
      // Load immediately for priority images
      const img = new Image();
      img.onload = () => {
        imageCache.add(src);
        setCurrentSrc(src);
        setIsLoaded(true);
      };
      img.src = src;
      return;
    }

    // Use intersection observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.onload = () => {
              imageCache.add(src);
              setCurrentSrc(src);
              setIsLoaded(true);
            };
            img.src = src;
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0.01
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [src, priority, placeholder]);

  return { src: currentSrc, isLoaded, ref };
}

// Check if image is already cached
export function isImageCached(src: string): boolean {
  return imageCache.has(src);
}
