import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

export const createSeries = async (name: string) => {
  const seriesRef = collection(db, 'series');

  // Check if series already exists
  const q = query(seriesRef, where('name', '==', name));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error('Series already exists');
  }

  // If no duplicate, create the series
  const docRef = await addDoc(seriesRef, {
    name,
    postIds: [], // Initialize postIds as an empty array
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// New function to associate a post with a series dynamically
export const associatePostWithSeries = async (
  seriesId: string,
  postId: string,
) => {
  const seriesRef = doc(db, 'series', seriesId);
  const seriesDoc = await getDoc(seriesRef); // Use getDoc here for a single document

  if (seriesDoc.exists()) {
    const seriesData = seriesDoc.data();
    const postIds = seriesData.postIds || [];

    if (!postIds.includes(postId)) {
      postIds.push(postId);
      await updateDoc(seriesRef, {
        postIds: postIds, // Add postId to the postIds array
      });
    }
  } else {
    console.log('Series not found');
  }
};
