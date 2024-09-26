import { collection, query, where, getDocs, addDoc, writeBatch } from 'firebase/firestore';
import { db} from './firebaseConfig'; 

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

    console.log('Successfully subscribed:', email);
    return true; // Return true if successful
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return false; // Return false on error
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
