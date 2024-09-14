// app/logout/page.tsx
'use client';

import { useRouter } from 'next/navigation';

const LogoutPage = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Remove the cookie to log out
    document.cookie = `loggedIn=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    router.push('/login');
  };

  return (
    <div>
      <h1>Logout</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default LogoutPage;
