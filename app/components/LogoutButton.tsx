'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth'; // Import the signOut function from Firebase
import { auth } from '../../lib/firebaseConfig'; // Import your Firebase auth instance

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Sign out from Firebase Authentication
      await signOut(auth);
      
      // Redirect to the login page or homepage after logout
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
};

export default LogoutButton;
