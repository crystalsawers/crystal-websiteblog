// /app/subscribe/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  addSubscriber,
  checkSubscriberExists,
  removeSubscriber,
} from '../../lib/firebaseUtils';

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
        setMessage(
          "You're already signed up. Please contact us if there are any issues.",
        );
        return;
      }
      const success = await addSubscriber(email);
      if (success) {
        setMessage(
          'Thank you for subscribing! A confirmation email has been sent.',
        );

        // Trigger notification to new subscribers
        try {
          const response = await fetch('/api/sendNotification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              postTitle: 'New Subscription',
              postUrl: 'https://crystalsawers.co.nz/',
              notificationEmail: process.env.NEXT_PUBLIC_EMAIL_USER,
            }),
          });

          if (!response.ok) {
            const errorResponse = await response.json();
            console.error('Error sending notification:', errorResponse);
          } else {
            console.log('Notification sent successfully!');
          }
        } catch (error) {
          console.error('Network error while sending notification:', error);
        }
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
      <div className="subscribe-card rounded-lg bg-emerald-500 p-6 shadow-md">
        <h1 className="page-title mb-4 text-gray-100">
          {isSubscribing
            ? 'Subscribe to My Latest Posts'
            : 'Unsubscribe from My Posts'}
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
        {message && <p className="mt-4 text-gray-200">{message}</p>}
        <p className="mt-4 text-gray-200">
          The subscription is completely free! There is no money involved here.
          When you subscribe you only stay updated with my latest posts, unless
          you unsubscribe of course.
        </p>

        {message && <p className="mt-4 text-gray-200">{message}</p>}

        <button
          onClick={() => setIsSubscribing(!isSubscribing)}
          className="mt-4 text-gray-200 underline"
        >
          {isSubscribing ? 'Want to unsubscribe?' : 'Want to subscribe?'}
        </button>
      </div>
    </main>
  );
};

export default SubscribePage;
