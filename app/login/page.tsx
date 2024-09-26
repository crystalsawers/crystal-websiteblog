'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebaseConfig';

const allowedUsers = ['crystalsawers39@gmail.com'];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check if the email is in the allowed users list
    if (!allowedUsers.includes(email)) {
      setError('You are not allowed to log in.');
      return;
    }
    
    try {
      // Firebase login with email and password
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to main page
      router.push('/');
    } catch (err: unknown) {
      console.error(err);
      setError('Invalid email or password');
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md">
      <div className="login-card">
        <h1 className="login-card-title">Login</h1>
        <form onSubmit={handleSubmit} className="login-card-form">
          <label className="login-card-label">
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <button type="submit" className="login-card-button">
            Login
          </button>
          {error && <p className="login-card-error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
