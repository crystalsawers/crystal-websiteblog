'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

const SubscribeButton = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleSubscribe = () => {
    router.push('/subscribe');
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <button onClick={handleSubscribe}>
      Subscribe
    </button>
  );
};

export default SubscribeButton;
