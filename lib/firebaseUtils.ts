import { collection, query, where, getDocs, addDoc, writeBatch } from 'firebase/firestore';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { db, auth } from './firebaseConfig'; 

// Check if email is already subscribed
export const checkSubscriberExists = async (email: string): Promise<boolean> => {
  const q = query(collection(db, 'subscribers'), where('email', '==', email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

// Add a subscriber to Firestore
export const addSubscriber = async (email: string): Promise<boolean> => {
  try {
    await addDoc(collection(db, 'subscribers'), { email });
    await sendConfirmationEmail(email);
    return true;
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return false;
  }
};

// Send email confirmation
const sendConfirmationEmail = async (email: string) => {
  const actionCodeSettings = {
    url: 'https://crystal-websiteblog.vercel.app/confirm?email=' + email, // this is the deployment url but i need to test with localhost
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
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
      batch.delete(doc.ref);
    });
  
    try {
      await batch.commit();  // Commit the batch operation
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  };
