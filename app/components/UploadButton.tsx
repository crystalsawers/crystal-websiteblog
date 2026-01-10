'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

const UploadButton = ({ mobileMenu = false }: { mobileMenu?: boolean }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Only show button when logged in
  if (!isAuthenticated) {
    return null;
  }

  const handleUpload = () => {
    router.push('/upload-image');
  };

  return (
    <button
      onClick={handleUpload}
      className={
        mobileMenu
          ? 'text-md block w-full text-center text-[var(--navbar-text)] hover:text-white'
          : 'block text-xs text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base'
      }
    >
      Upload
    </button>
  );
};

export default UploadButton;
