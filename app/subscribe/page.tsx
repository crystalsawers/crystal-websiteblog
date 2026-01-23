'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  addSubscriber,
  checkSubscriberExists,
  removeSubscriber,
} from '../../lib/subscriberUtils';
import { collection, DocumentData, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

const SubscribePage = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
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
          "You're already signed up. Please contact loglapandover@gmail.com if there are any issues.",
        );
        return;
      }
      const success = await addSubscriber(email, name);
      if (success) {
        setMessage(
          'Thank you for subscribing! A confirmation email has been sent.',
        );

        try {
          // ======= STEP 1: Fetch the latest post from all categories =======
          const allCategories = ['misc', 'lifestyle', 'formula1', 'cricket', 'music', 'apps', 'devops', 'embedded'];
          let latestPostDoc: QueryDocumentSnapshot<DocumentData> | null = null;
          let latestPostDate = 0;
          let finalCategory = '';

          for (const category of allCategories) {
            const snap = await getDocs(collection(db, category));


            for (const doc of snap.docs) {  
            const data = doc.data();
            const postTime = new Date(data.date).getTime();
            if (postTime > latestPostDate) {
              latestPostDate = postTime;
              latestPostDoc = doc;
              finalCategory = category;
            }
          }

          }

          if (!latestPostDoc) {
            console.warn('No posts found.');
            return;
          }

          const postId = latestPostDoc.id;

              // ======= STEP 2: Build dynamic post URL =======
          const reviewCategories = ['misc', 'lifestyle'];
          const interestCategories = ['formula1', 'cricket', 'music'];
          const projectCategories = ['apps', 'devops', 'embedded'];

          const categoryPrefixFromPath = reviewCategories.includes(finalCategory)
            ? 'reviews'
            : projectCategories.includes(finalCategory)
            ? 'projects'
            : interestCategories.includes(finalCategory)
            ? 'interests'
            : '';

          const BASE_URL = 'https://loglapandover.co.nz/';
          const postUrl = `${BASE_URL}${categoryPrefixFromPath}/${finalCategory}/${postId}`;


          // ======= STEP 3: Trigger notification to NEW SUBSCRIBERS =======
          const response = await fetch('/api/sendNotification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postTitle:  `NEW SUBSCRIBER: ${name}, ${email}`,
            subscriberName: name,     // new field for backend to use
            subscriberEmail: email, 
            postUrl,
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
        setMessage('There was an error. Please try again. Please contact loglapandover@gmail.com if there are any issues.');
      }
    } else {
      const success = await removeSubscriber(email);
      if (success) {
        setMessage('You have successfully unsubscribed.');
      } else {
        setMessage('There was an error. Please try again. Please contact loglapandover@gmail.com if there are any issues.');
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
        <h1 className="mb-4 text-2xl font-bold text-black">
          {isSubscribing
            ? 'Subscribe to My Latest Posts'
            : 'Unsubscribe from My Posts'}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="create-form-input"
          />
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
        <p className="mt-4 text-black">
          The subscription is completely free! There is no money involved here.
          When you subscribe you only stay updated with my latest posts, unless
          you unsubscribe of course.
        </p>

        {message && (
          <p
            className={`mt-4 ${
              message.includes('error') || message.includes('issues')
                ? 'text-red-700' // Render red text for error messages
                : 'text-black' // Render black text for success messages
            }`}
          >
            {message}
          </p>
        )}

        <button
          onClick={() => setIsSubscribing(!isSubscribing)}
          className="mt-4 text-black underline"
        >
          {isSubscribing ? 'Want to unsubscribe?' : 'Want to subscribe?'}
        </button>
      </div>
    </main>
  );
};

export default SubscribePage;
