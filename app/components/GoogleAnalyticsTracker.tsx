'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

function normalizePath(pathname: string) {
  return (
    pathname
      // replace long IDs (UUIDs / random strings)
      .replace(/\/[a-zA-Z0-9_-]{8,}$/, '/:id')
      // catch extra trailing dynamic segments
      .replace(/\/[a-zA-Z0-9_-]{6,}$/, '/:id')
  );
}

export default function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;

    const normalizedPath = normalizePath(pathname);

    const url =
      normalizedPath +
      (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}
