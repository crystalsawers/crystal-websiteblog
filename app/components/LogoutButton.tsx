'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth'; 
import { auth } from '../../lib/firebaseConfig'; 
import { useAuth } from './AuthContext'; 

const LogoutButton = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      // Sign out from Firebase Authentication
      await signOut(auth);
      
      // Redirect to the homepage after logout
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Render nothing if the user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
};

export default LogoutButton;
