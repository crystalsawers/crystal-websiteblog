import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Check if email is already subscribed
export const checkSubscriberExists = async (
  email: string,
): Promise<boolean> => {
  const q = query(collection(db, 'subscribers'), where('email', '==', email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty; // Return true if the email exists
};

// Function to send email notification to the admin to say that someone has subscribed
const sendEmailNotification = async (subscriberEmail: string) => {
  try {
    // const EMAIL_USER = process.env.NEXT_PUBLIC_EMAIL_USER; // Access the email user

    await fetch('/api/sendNotification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postTitle: `New Subscriber: ${subscriberEmail}`,
        postUrl: 'https://crystal-websiteblog.vercel.app/',
        notificationEmail: subscriberEmail, // Pass the subscriber's email here
      }),
    });

    // console.log('Notification sent to:', EMAIL_USER);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Add a subscriber to Firestore
export const addSubscriber = async (email: string): Promise<boolean> => {
  try {
    const exists = await checkSubscriberExists(email);
    if (exists) {
      console.error('Email already subscribed:', email);
      return false;
    }
    await addDoc(collection(db, 'subscribers'), { email });
    // console.log('Successfully subscribed:', email);

    // Send notification to the designated email
    // console.log('Preparing to send notification to:', email);
    await sendEmailNotification(email);

    return true;
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return false;
  }
};

// Remove a subscriber (unsubscribe)
export const removeSubscriber = async (email: string): Promise<boolean> => {
  const q = query(collection(db, 'subscribers'), where('email', '==', email));
  const querySnapshot = await getDocs(q);

  const batch = writeBatch(db);
  querySnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  try {
    await batch.commit();
    // console.log('Unsubscribed:', email);
    return true;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return false;
  }
};

// Function to fetch subscriber emails (to be used in API route)
export const getSubscriberEmails = async () => {
  try {
    const subscribersSnap = await getDocs(collection(db, 'subscribers'));

    // Log the number of subscribers fetched
    console.log('Number of subscribers fetched:', subscribersSnap.docs.length);

    // Map through the documents to get email addresses
    const emails = subscribersSnap.docs.map((doc) => {
      console.log(`Fetched email: ${doc.data().email}`); // Log each email
      return doc.data().email;
    });

    return emails;
  } catch (error) {
    console.error('Error fetching subscriber emails:', error);
    throw error; // Propagate the error for handling in the caller function
  }
};
