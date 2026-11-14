import { useState, type ImgHTMLAttributes } from 'react';
import { PLACEHOLDER_IMAGE } from '../../constants';
import { resolveImageUrl } from '../../utils/format';

interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Raw backend path (`uploads/...`), absolute URL, or empty. */
  src?: string | null;
}

/** Image that resolves backend upload paths and falls back to a local placeholder if loading fails. */
export function SafeImage({ src, alt = '', ...rest }: SafeImageProps) {
  const resolved = resolveImageUrl(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const current = failedSrc === resolved ? PLACEHOLDER_IMAGE : resolved;

  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      loading={rest.loading ?? 'lazy'}
      onError={() => {
        if (current !== PLACEHOLDER_IMAGE) setFailedSrc(resolved);
      }}
    />
  );
}
