import { useState, type ImgHTMLAttributes } from 'react';
import { PLACEHOLDER_IMAGE } from '../../../lib/config';
import { resolveImageUrl } from '../../../lib/utils/format';

interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Raw backend path (`uploads/...`), absolute URL, or empty. */
  src?: string | null;
  /** Local image used when `src` is empty or fails to load (defaults to the sneaker placeholder). */
  fallback?: string;
}

/** Image that resolves backend upload paths and falls back to a local image if loading fails. */
export function SafeImage({ src, alt = '', fallback = PLACEHOLDER_IMAGE, ...rest }: SafeImageProps) {
  const resolved = src ? resolveImageUrl(src) : fallback;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const current = failedSrc === resolved ? fallback : resolved;

  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      loading={rest.loading ?? 'lazy'}
      onError={() => {
        if (current !== fallback) setFailedSrc(resolved);
      }}
    />
  );
}
