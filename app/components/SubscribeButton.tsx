'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

const SubscribeButton = ({ mobileMenu = false }: { mobileMenu?: boolean }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleSubscribe = () => {
    router.push('/subscribe');
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={handleSubscribe}
      className={
        mobileMenu
          ? 'text-md block w-full text-center text-[var(--navbar-text)] hover:text-white'
          : 'block text-xs text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base'
      }
    >
      Subscribe
    </button>
  );
};

export default SubscribeButton;
