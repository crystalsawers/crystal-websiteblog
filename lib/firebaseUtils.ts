import { collection, query, where, getDocs, addDoc, writeBatch } from 'firebase/firestore';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { db, auth } from './firebaseConfig'; 

// Check if email is already subscribed
export const checkSubscriberExists = async (email: string): Promise<boolean> => {
  const q = query(collection(db, 'subscribers'), where('email', '==', email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;  // Return true if the email exists
};

// Add a subscriber to Firestore
export const addSubscriber = async (email: string): Promise<boolean> => {
  try {
    // Check if the subscriber already exists
    const exists = await checkSubscriberExists(email);
    if (exists) {
      console.error('Email already subscribed:', email);
      return false; // Return false if already subscribed
    }

    // Add the email to Firestore
    await addDoc(collection(db, 'subscribers'), { email });
    
    // Send confirmation email
    await sendConfirmationEmail(email);
    return true; // Return true if successful
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return false; // Return false on error
  }
};

// Send email confirmation
const sendConfirmationEmail = async (email: string) => {
  const actionCodeSettings = {
    // url: 'https://crystal-websiteblog.vercel.app/confirm?email=' + email, // URL to handle the confirmation
    url: 'http://localhost:3000/confirm?email=' + email,
    handleCodeInApp: true, // Handle the code in your app
  };

  try {
    // Sending the confirmation email
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    console.log('Confirmation email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

// Remove a subscriber (unsubscribe)
export const removeSubscriber = async (email: string): Promise<boolean> => {
  const q = query(collection(db, 'subscribers'), where('email', '==', email));
  const querySnapshot = await getDocs(q);
  
  const batch = writeBatch(db);  // Use writeBatch to create a batch
  
  querySnapshot.forEach((doc) => {
    batch.delete(doc.ref);  // Prepare the delete operation for each document
  });
  
  try {
    await batch.commit();  // Commit the batch operation
    console.log('Unsubscribed:', email);
    return true; // Return true if successful
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return false; // Return false on error
  }
};
