'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext'; 

const SubscribeButton = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth(); 

  // Render the Subscribe link if the user is NOT authenticated
  const handleSubscribe = () => {
    router.push('/subscribe'); // Navigate to the subscribe page
  };

  // If the user is authenticated, render nothing
  if (isAuthenticated) {
    return null;
  }

  return (
    <button onClick={handleSubscribe} className="subscribe-button">
      Subscribe
    </button>
  );
};

export default SubscribeButton;
