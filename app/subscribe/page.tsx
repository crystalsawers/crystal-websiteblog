'use client'
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { addSubscriber, checkSubscriberExists, removeSubscriber } from '../../lib/firebaseUtils';

const SubscribePage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user); // Set true if user exists
    });
    return () => unsubscribe(); // Cleanup the subscription
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubscribing) {
      const exists = await checkSubscriberExists(email);
      if (exists) {
        setMessage("You're already signed up. Please contact us if there are any issues.");
        return;
      }
      const success = await addSubscriber(email);
      if (success) {
        setMessage('Thank you for subscribing! A confirmation email has been sent.');
      } else {
        setMessage('There was an error. Please try again.');
      }
    } else {
      const success = await removeSubscriber(email);
      if (success) {
        setMessage('You have successfully unsubscribed.');
      } else {
        setMessage('There was an error. Please try again.');
      }
    }
  };

  // Render nothing if the user is logged in
  if (isLoggedIn) {
    return null; // Render nothing for authenticated users
  }

  return (
    <main className="mx-auto my-12 max-w-5xl px-8">
      <div className="subscribe-card bg-emerald-500 rounded-lg p-6 shadow-md">
        <h1 className="page-title text-gray-100 mb-4">
          {isSubscribing ? 'Subscribe to Our Latest Posts' : 'Unsubscribe from Our Posts'}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="create-form-input"
          />
          <button type="submit" className="login-card-button">
            {isSubscribing ? 'Subscribe' : 'Unsubscribe'}
          </button>
        </form>
        {message && <p className="text-gray-200 mt-4">{message}</p>}

        <button
          onClick={() => setIsSubscribing(!isSubscribing)}
          className="text-gray-200 mt-4 underline"
        >
          {isSubscribing ? 'Want to unsubscribe?' : 'Want to subscribe?'}
        </button>
      </div>
    </main>
  );
};

export default SubscribePage;