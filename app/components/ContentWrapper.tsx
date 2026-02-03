'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import Footer from './Footer';

interface Props {
  children: ReactNode;
}

export default function ContentWrapper({ children }: Props) {
  const footerRef = useRef<HTMLElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // function to update footer height and window width
    const update = () => {
      setFooterHeight(footerRef.current?.offsetHeight || 0);
      setWindowWidth(window.innerWidth);
    };

    update(); // initial call
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // determine extra padding based on screen width
  const extraPadding = windowWidth < 768 ? 32 : 16;

  return (
    <>
      <div
        className="flex-1"
        style={{
          paddingBottom: footerHeight + extraPadding,
        }}
      >
        {children}
      </div>

      <Footer ref={footerRef} />
    </>
  );
}
