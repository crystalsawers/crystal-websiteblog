'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

const FeedbackButton = ({ mobileMenu = false }: { mobileMenu?: boolean }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  const handleFeedback = () => {
    router.push('/feedback');
  };

  return (
    <button
      onClick={handleFeedback}
      className={
        mobileMenu
          ? 'text-md block w-full text-center text-[var(--navbar-text)] hover:text-white'
          : 'block text-xs text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base'
      }
    >
      Feedback
    </button>
  );
};

export default FeedbackButton;
