'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

const FeedbackButton = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  const handleFeedback = () => {
    router.push('/feedback');
  };

  return (
    <button onClick={handleFeedback} className="feedback-button">
      Feedback
    </button>
  );
};

export default FeedbackButton;
