/**
 * Author Image Component - Client Component for handling image errors
 */
"use client";

import { useState } from 'react';
import { getAuthorImageUrl, getAuthorInitials } from '@/lib/author-image-utils';

interface AuthorImageProps {
  author: {
    name: string;
    image?: string;
    avatar?: string;
    img?: string;
    slug: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AuthorImage({ author, size = 'md', className = '' }: AuthorImageProps) {
  const [imageError, setImageError] = useState(false);
  
  // Transform author object to match the expected interface
  const authorForImageUrl = {
    avatar: author.avatar,
    img: author.img || author.image
  };
  
  const imageUrl = getAuthorImageUrl(authorForImageUrl);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`${sizeClasses[size]} mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 ${className}`}>
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={author.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
          <div className="text-center">
            <span className="text-sm font-bold text-orange-600">
              {getAuthorInitials(author.name)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}