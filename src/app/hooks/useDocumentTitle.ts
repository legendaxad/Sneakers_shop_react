import { useEffect } from 'react';

/** Set the browser tab title for a page. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} · MULTI-SHOP` : 'MULTI-SHOP — Premium Sneakers';
  }, [title]);
}
