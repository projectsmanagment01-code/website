'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  quality?: number;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SafeImage - Hides completely if image fails to load
 * No broken image icons, no empty containers
 */
export function SafeImage({
  src,
  alt,
  width,
  height,
  quality = 75,
  priority = false,
  loading = 'lazy',
  sizes,
  className = '',
  style = {},
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // Don't render anything if image failed to load
  if (hasError) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={quality}
      priority={priority}
      loading={loading}
      sizes={sizes}
      className={className}
      style={style}
      onError={() => setHasError(true)}
    />
  );
}
