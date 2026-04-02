/**
 * Optimized Image Component with lazy loading and blur placeholder
 *
 * Usage:
 * <OptimizedImage
 *   src="/path/to/image.jpg"
 *   alt="Description"
 *   width={800}
 *   height={600}
 *   priority={false}
 *   className="rounded-lg"
 * />
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Fallback for broken images
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-800 text-gray-500 ${className}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
        }}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
      }}
    >
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        placeholder={placeholder}
        blurDataURL={
          blurDataURL ||
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        }
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleLoad}
        onError={handleError}
        sizes="(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 33vw"
      />
      {!isLoaded && <div className="absolute inset-0 bg-gray-800 animate-pulse" />}
    </div>
  );
}

/**
 * Optimized Avatar Component
 */
interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 56,
};

export function OptimizedAvatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const pixelSize = sizeMap[size];

  if (!src) {
    return (
      <div
        className={`rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={pixelSize}
      height={pixelSize}
      className={`rounded-full object-cover ${className}`}
      priority={false}
    />
  );
}
