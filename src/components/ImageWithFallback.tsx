import React, { useState, useEffect } from 'react';
import { SVG_DATA_URIS, FALLBACK_PATHS } from '../assets/fallbacks.js';

// Remember images that have already loaded during this app session.
const loadedImageSources = new Set<string>();

export interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'restaurant' | 'food' | 'avatar';
  containerClassName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  fallbackType = 'food',
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}) => {
  const hasValidSrc = Boolean(src && src.trim().length > 0);

  const [stage, setStage] = useState<number>(
    hasValidSrc ? 0 : 1
  );

  const [isLoading, setIsLoading] = useState<boolean>(
    hasValidSrc && !loadedImageSources.has(src as string)
  );

  useEffect(() => {
    if (src && src.trim().length > 0) {
      setStage(0);
      setIsLoading(!loadedImageSources.has(src));
    } else {
      setStage(1);
      setIsLoading(false);
    }
  }, [src]);

  const getSourceForStage = (currentStage: number): string => {
    switch (currentStage) {
      case 0:
        return src || FALLBACK_PATHS[fallbackType];
      case 1:
        return FALLBACK_PATHS[fallbackType];
      default:
        return SVG_DATA_URIS[fallbackType];
    }
  };

  const currentSrc = getSourceForStage(stage);

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    if (stage === 0 && src) {
      loadedImageSources.add(src);
    }

    setIsLoading(false);
    onLoad?.(e);
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    if (stage < 2) {
      setStage((previousStage) => previousStage + 1);
    } else {
      setIsLoading(false);
    }

    onError?.(e);
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName || className}`}>
      {isLoading && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#1C2530] border border-[#293241] animate-pulse flex flex-col items-center justify-center z-10 select-none"
        >
          <div className="w-6 h-6 rounded-full border-2 border-[#D4AF37]/40 border-t-[#D4AF37] animate-spin mb-1" />
          <span className="text-[9px] font-black tracking-widest text-[#D4AF37]/70 uppercase">
            FOODORA
          </span>
        </div>
      )}

      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />
    </div>
  );
};