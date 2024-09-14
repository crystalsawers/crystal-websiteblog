// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Fetch credentials from environment variables
    const expectedUsername = process.env.NEXT_PUBLIC_LOGIN_USERNAME;
    const expectedPassword = process.env.NEXT_PUBLIC_LOGIN_PASSWORD;

    console.log(`Expected Username: ${expectedUsername}, Expected Password: ${expectedPassword}`);
    
    // Validate credentials
    if (username === expectedUsername && password === expectedPassword) {
      // Set cookie to indicate user is logged in
      document.cookie = 'loggedIn=true; path=/';

      // Redirect to protected page
      router.push('/protected-page');
    } else {
      // Show error message
      setError('Invalid username or password');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="login-card">
        <h1 className="login-card-title">Login</h1>
        <form onSubmit={handleSubmit} className="login-card-form">
          <label className="login-card-label">
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-card-input"
            />
          </label>
          <label className="login-card-label">
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-card-input"
            />
          </label>
          <button type="submit" className="login-card-button">Login</button>
          {error && <p className="login-card-error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
