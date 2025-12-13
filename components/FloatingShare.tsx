'use client';

import { useState, useEffect } from 'react';

interface FloatingShareProps {
  title?: string;
  description?: string;
  image?: string;
}

export default function FloatingShare({ title, description, image }: FloatingShareProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [pageUrl, setPageUrl] = useState('');
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    // Set URL and title on client side
    setPageUrl(window.location.href);
    setPageTitle(title || document.title);
    
    const handleScroll = () => {
      // Show floating share after scrolling 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [title]);

  const handleShare = (platform: string) => {
    if (!pageUrl) return;
    
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedTitle = encodeURIComponent(pageTitle);
    const encodedDescription = encodeURIComponent(description || pageTitle);
    const encodedImage = image ? encodeURIComponent(image) : '';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDescription}${encodedImage ? `&media=${encodedImage}` : ''}`;
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0ARead more: ${encodedUrl}`;
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=500,scrollbars=yes');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-3 z-40 ml-1">
      {/* Facebook */}
      <button
        onClick={() => handleShare('facebook')}
        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:scale-110"
        aria-label="Share on Facebook"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/>
        </svg>
      </button>

      {/* Twitter/X */}
      <button
        onClick={() => handleShare('twitter')}
        className="p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:scale-110"
        aria-label="Share on Twitter"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </button>

      {/* Pinterest */}
      <button
        onClick={() => handleShare('pinterest')}
        className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg hover:scale-110"
        aria-label="Share on Pinterest"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
        </svg>
      </button>

      {/* Email */}
      <button
        onClick={() => handleShare('email')}
        className="p-3 bg-stone-600 text-white rounded-full hover:bg-stone-700 transition-colors shadow-lg hover:scale-110"
        aria-label="Share via Email"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
}
